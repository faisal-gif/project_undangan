<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Dua tindakan yang bisa dilakukan tamu dari halaman undangannya sendiri:
 * menyimpan acara ke kalender dan mengonfirmasi kehadiran.
 */
class UndanganTamuTest extends TestCase
{
    use RefreshDatabase;

    private Acara $aktif;
    private Tamu $tamu;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

        $this->aktif = Acara::where('aktif', true)->firstOrFail();
        $this->tamu = Tamu::create([
            'acara_id' => $this->aktif->id,
            'nama' => 'Tamu Uji',
            'code' => 'UJIUNDGN',
            'status' => 'belum',
        ]);
    }

    public function test_berkas_kalender_berisi_acara_yang_benar(): void
    {
        $balasan = $this->get(route('undangan.kalender', $this->tamu->code));

        $balasan->assertOk()
            ->assertHeader('Content-Type', 'text/calendar; charset=utf-8');

        $isi = $balasan->getContent();

        $this->assertStringContainsString('BEGIN:VEVENT', $isi);
        // 18:00 WIB = 11:00 UTC; .ics memakai UTC.
        $this->assertStringContainsString('DTSTART:' . $this->aktif->mulai->utc()->format('Ymd\THis\Z'), $isi);
        $this->assertStringContainsString('Grand Ballroom', $isi);
    }

    public function test_koma_pada_alamat_tidak_merusak_berkas_kalender(): void
    {
        $isi = $this->get(route('undangan.kalender', $this->tamu->code))->getContent();

        // Koma wajib di-escape; kalau tidak, sisa alamat dibaca sebagai medan lain.
        $this->assertStringNotContainsString('LOCATION:Grand Ballroom, ', $isi);
        $this->assertStringContainsString('LOCATION:Grand Ballroom\\, ', $isi);
    }

    public function test_kode_asing_tidak_mendapat_kalender(): void
    {
        $this->get(route('undangan.kalender', 'TIDAKADA'))->assertNotFound();
    }

    public function test_tamu_bisa_mengonfirmasi_kehadiran(): void
    {
        $this->post(route('undangan.rsvp', $this->tamu->code), ['rsvp' => 'hadir'])
            ->assertRedirect();

        $segar = $this->tamu->fresh();

        $this->assertSame('hadir', $segar->rsvp);
        $this->assertNotNull($segar->rsvp_pada);
        // Konfirmasi bukan kehadiran: status hanya berubah saat QR dipindai.
        $this->assertSame('belum', $segar->status);
    }

    public function test_konfirmasi_bisa_diubah(): void
    {
        $this->post(route('undangan.rsvp', $this->tamu->code), ['rsvp' => 'hadir']);
        $this->post(route('undangan.rsvp', $this->tamu->code), ['rsvp' => 'berhalangan']);

        $this->assertSame('berhalangan', $this->tamu->fresh()->rsvp);
    }

    public function test_pilihan_tidak_dikenal_ditolak(): void
    {
        $this->post(route('undangan.rsvp', $this->tamu->code), ['rsvp' => 'mungkin'])
            ->assertSessionHasErrors('rsvp');

        $this->assertSame('belum', $this->tamu->fresh()->rsvp);
    }

    public function test_tamu_edisi_lama_tidak_bisa_konfirmasi(): void
    {
        $lama = Acara::where('aktif', false)->firstOrFail();
        $this->tamu->update(['acara_id' => $lama->id]);

        $this->post(route('undangan.rsvp', $this->tamu->code), ['rsvp' => 'hadir'])
            ->assertNotFound();

        $this->assertSame('belum', $this->tamu->fresh()->rsvp);
    }

    public function test_halaman_undangan_membawa_status_konfirmasi(): void
    {
        $this->tamu->update(['rsvp' => 'hadir']);

        $this->get(route('undangan', [$this->tamu->code, 'tamu-uji']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('tamu.rsvp', 'hadir'));
    }
}

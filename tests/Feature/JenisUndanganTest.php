<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Undangan punya dua versi: tamu yang hadir, dan penerima penghargaan.
 * Jenisnya ditandai admin dan ikut dikirim ke halaman undangan.
 */
class JenisUndanganTest extends TestCase
{
    use RefreshDatabase;

    private Acara $aktif;

    protected function setUp(): void
    {
        parent::setUp();

        $this->aktif = Acara::where('aktif', true)->firstOrFail();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function tamu(array $atribut = []): Tamu
    {
        return Tamu::create($atribut + [
            'acara_id' => $this->aktif->id,
            'nama' => 'Tamu Uji',
            'code' => strtoupper(substr(md5(uniqid('', true)), 0, 8)),
            'status' => 'belum',
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_tamu_baru_berjenis_hadir_secara_bawaan(): void
    {
        $this->assertSame('hadir', $this->tamu()->jenis);
    }

    public function test_undangan_membawa_jenis_dan_kategori(): void
    {
        $tamu = $this->tamu([
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Positive News Maker',
        ]);

        $this->get(route('undangan', [$tamu->code, 'tamu-uji']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Guest/Undangan/Index')
                ->where('tamu.jenis', 'penerima')
                ->where('tamu.kategori_penghargaan', 'Positive News Maker'));
    }

    public function test_tamu_biasa_tidak_membawa_kategori(): void
    {
        $tamu = $this->tamu();

        $this->get(route('undangan', [$tamu->code, 'tamu-uji']))
            ->assertInertia(fn ($page) => $page
                ->where('tamu.jenis', 'hadir')
                ->where('tamu.kategori_penghargaan', null));
    }

    public function test_admin_menandai_tamu_sebagai_penerima(): void
    {
        $tamu = $this->tamu();

        $this->actingAs($this->admin())
            ->put(route('admin.tamu.update', $tamu->id), [
                'nama' => $tamu->nama,
                'jenis' => 'penerima',
                'kategori_penghargaan' => 'Man of The Year',
            ])
            ->assertRedirect();

        $segar = $tamu->fresh();

        $this->assertTrue($segar->penerima());
        $this->assertSame('Man of The Year', $segar->kategori_penghargaan);
    }

    public function test_kategori_dibuang_saat_jenis_kembali_ke_hadir(): void
    {
        $tamu = $this->tamu([
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Woman of The Year',
        ]);

        $this->actingAs($this->admin())
            ->put(route('admin.tamu.update', $tamu->id), [
                'nama' => $tamu->nama,
                'jenis' => 'hadir',
                // Sengaja masih terkirim: sisa isian form sebelumnya.
                'kategori_penghargaan' => 'Woman of The Year',
            ]);

        $this->assertNull($tamu->fresh()->kategori_penghargaan);
    }

    public function test_jenis_tidak_dikenal_ditolak(): void
    {
        $tamu = $this->tamu();

        $this->actingAs($this->admin())
            ->put(route('admin.tamu.update', $tamu->id), [
                'nama' => $tamu->nama,
                'jenis' => 'juri',
            ])
            ->assertSessionHasErrors('jenis');
    }

    public function test_salinan_dari_edisi_lama_kembali_jadi_tamu_biasa(): void
    {
        $lama = Acara::where('aktif', false)->firstOrFail();
        $asal = $this->tamu([
            'acara_id' => $lama->id,
            'nama' => 'Peraih Tahun Lalu',
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Positive News Maker',
        ]);

        $this->actingAs($this->admin())
            ->post(route('admin.tamu.salin'), ['tamu_ids' => [$asal->id]]);

        // Penerima ditentukan ulang tiap edisi.
        $salinan = Tamu::edisi($this->aktif)->where('nama', 'Peraih Tahun Lalu')->firstOrFail();

        $this->assertSame('hadir', $salinan->jenis);
    }
}

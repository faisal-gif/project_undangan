<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * tamu:pic menyentuh baris yang undangannya sudah dikirim, jadi janjinya
 * harus dijaga otomatis: mode coba tidak menulis, dan dengan --terapkan pun
 * HANYA kolom pic yang berubah.
 */
class IsiPicPenerimaTest extends TestCase
{
    use RefreshDatabase;

    /** Salah satu kode yang ada di daftar, PIC-nya "Naning". */
    private const KODE = 'DRAQWUGC';

    private function tamu(array $ganti = []): Tamu
    {
        return Tamu::create(array_merge([
            'acara_id' => Acara::aktif()->id,
            'code' => self::KODE,
            'nama' => 'Nur Vicky Wahyudi, S.Sn.',
            'lembaga' => 'Pengusaha Kota Batu',
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Innovation in Creative Economy',
            'jumlah_orang' => 2,
            'meja' => '9',
            'kursi' => '1, 2',
            'status' => 'belum',
            'rsvp' => 'hadir',
        ], $ganti));
    }

    public function test_mode_coba_tidak_menulis_pic(): void
    {
        $tamu = $this->tamu();

        $this->artisan('tamu:pic')
            ->expectsOutputToContain('MODE COBA')
            ->assertSuccessful();

        $this->assertNull($tamu->fresh()->pic);
    }

    public function test_terapkan_mengisi_pic(): void
    {
        $tamu = $this->tamu();

        $this->artisan('tamu:pic --terapkan')->assertSuccessful();

        $this->assertSame('Naning', $tamu->fresh()->pic);
    }

    public function test_hanya_kolom_pic_yang_berubah(): void
    {
        $tamu = $this->tamu();
        $sebelum = $tamu->only([
            'code', 'nama', 'lembaga', 'jenis', 'kategori_penghargaan',
            'jumlah_orang', 'meja', 'kursi', 'status', 'rsvp',
        ]);

        $this->artisan('tamu:pic --terapkan')->assertSuccessful();

        $segar = $tamu->fresh();

        foreach ($sebelum as $kolom => $nilai) {
            $this->assertSame($nilai, $segar->{$kolom}, "kolom {$kolom} ikut berubah");
        }
    }

    public function test_tidak_membuat_atau_menghapus_baris(): void
    {
        $this->tamu();

        $this->artisan('tamu:pic --terapkan')->assertSuccessful();

        $this->assertSame(1, Tamu::count());
    }

    public function test_pic_yang_sudah_sesuai_tidak_dihitung_lagi(): void
    {
        $this->tamu(['pic' => 'Naning']);

        $this->artisan('tamu:pic')
            ->expectsOutputToContain('Perlu diisi    : 0')
            ->expectsOutputToContain('Sudah sesuai   : 1')
            ->assertSuccessful();
    }

    public function test_pic_lama_yang_beda_dilaporkan_sebelum_ditimpa(): void
    {
        $this->tamu(['pic' => 'Orang Lain']);

        $this->artisan('tamu:pic')
            ->expectsOutputToContain('PIC lama ditimpa')
            ->expectsOutputToContain('Orang Lain -> Naning')
            ->assertSuccessful();
    }

    public function test_kode_yang_tidak_ada_dilaporkan_bukan_dibuat(): void
    {
        $this->artisan('tamu:pic --terapkan')
            ->expectsOutputToContain('Kode tidak ditemukan')
            ->assertSuccessful();

        $this->assertSame(0, Tamu::count());
    }
}

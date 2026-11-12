<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Perintah tamu:selaraskan menyentuh data yang undangannya sudah dikirim,
 * jadi dua janjinya harus dijaga otomatis: tanpa --terapkan tidak ada yang
 * berubah, dan dengan --terapkan pun kode undangan serta tempat duduk tidak
 * ikut terbawa.
 */
class SelaraskanTamuTest extends TestCase
{
    use RefreshDatabase;

    /** Salah satu kode yang memang ada di daftar perubahan. */
    private const KODE = 'CKSHT2DG';

    private function tamu(): Tamu
    {
        return Tamu::create([
            'acara_id' => Acara::where('aktif', true)->firstOrFail()->id,
            'code' => self::KODE,
            'nama' => 'Nama Lama',
            'lembaga' => 'Lembaga Lama',
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Kategori Lama',
            'sub_kategori' => null,
            'jumlah_orang' => 2,
            'meja' => '7',
            'kursi' => '3, 4',
            'status' => 'belum',
            'rsvp' => 'hadir',
        ]);
    }

    public function test_mode_coba_tidak_mengubah_apa_pun(): void
    {
        $tamu = $this->tamu();

        $this->artisan('tamu:selaraskan')
            ->expectsOutputToContain('MODE COBA')
            ->assertSuccessful();

        $segar = $tamu->fresh();

        $this->assertSame('Nama Lama', $segar->nama);
        $this->assertSame('Kategori Lama', $segar->kategori_penghargaan);
        $this->assertNull($segar->sub_kategori);
    }

    public function test_terapkan_memperbarui_isi_undangan(): void
    {
        $tamu = $this->tamu();

        $this->artisan('tamu:selaraskan --terapkan')->assertSuccessful();

        $segar = $tamu->fresh();

        $this->assertSame('Nezar Patria, S.Fil., M.Sc., M.B.A.', $segar->nama);
        $this->assertSame('Wakil Menteri Komunikasi dan Digital RI', $segar->lembaga);
        $this->assertSame('Innovation in Digital Transformation', $segar->kategori_penghargaan);
        $this->assertSame('Best Innovation in Digital Transformation Policy', $segar->sub_kategori);
    }

    /**
     * "Update Undangan Penerima.xlsx" mengganti enam baris instansi jadi
     * pejabatnya. Satu contohnya dikunci di sini supaya tidak diam-diam
     * kembali ke nama lembaga.
     */
    public function test_baris_instansi_diganti_jadi_pejabatnya(): void
    {
        $tamu = Tamu::create([
            'acara_id' => Acara::where('aktif', true)->firstOrFail()->id,
            'code' => 'QOHXMM74',
            'nama' => 'Pemerintah Kabupaten Pacitan',
            'lembaga' => 'Instansi Pemerintah Daerah',
            'jenis' => 'penerima',
            'jumlah_orang' => 2,
            'status' => 'belum',
            'rsvp' => 'belum',
        ]);

        $this->artisan('tamu:selaraskan --terapkan')->assertSuccessful();

        $segar = $tamu->fresh();

        $this->assertSame('Indrata Nur Bayuaji, S.S.', $segar->nama);
        $this->assertSame('Bupati Pacitan', $segar->lembaga);
    }

    /**
     * Dua baris yang dulu menunggu keputusan sekarang ikut diperbarui, tapi
     * berkas barunya tidak punya kolom kategori - jadi kategori lama harus
     * tetap utuh.
     */
    public function test_baris_bekas_perlu_keputusan_tidak_kehilangan_kategori(): void
    {
        $tamu = Tamu::create([
            'acara_id' => Acara::where('aktif', true)->firstOrFail()->id,
            'code' => 'TE9F98SS',
            'nama' => 'Hj. Jajuk Rendra Kresna, S.E., M.M.',
            'lembaga' => 'Anggota DPRD Provinsi Jawa Timur',
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Woman of The Year',
            'sub_kategori' => null,
            'jumlah_orang' => 2,
            'meja' => '5',
            'kursi' => '1, 2',
            'status' => 'belum',
            'rsvp' => 'belum',
        ]);

        $this->artisan('tamu:selaraskan --terapkan')->assertSuccessful();

        $segar = $tamu->fresh();

        $this->assertSame('Hj. Jajuk Sulistyowati, S.E., M.M.', $segar->nama);
        $this->assertSame('Anggota DPRD Provinsi Jawa Timur', $segar->lembaga);
        $this->assertSame('Woman of The Year', $segar->kategori_penghargaan);
        $this->assertNull($segar->sub_kategori);
        $this->assertSame('5', $segar->meja);
    }

    public function test_kode_tempat_duduk_dan_rsvp_tidak_pernah_disentuh(): void
    {
        $tamu = $this->tamu();

        $this->artisan('tamu:selaraskan --terapkan')->assertSuccessful();

        $segar = $tamu->fresh();

        $this->assertSame(self::KODE, $segar->code);
        $this->assertSame('7', $segar->meja);
        $this->assertSame('3, 4', $segar->kursi);
        $this->assertSame('hadir', $segar->rsvp);
        $this->assertSame('belum', $segar->status);
    }

    public function test_tidak_membuat_atau_menghapus_baris(): void
    {
        $this->tamu();
        $sebelum = Tamu::count();

        $this->artisan('tamu:selaraskan --terapkan')->assertSuccessful();

        $this->assertSame($sebelum, Tamu::count());
    }

    public function test_kode_yang_tidak_ada_dilaporkan_bukan_dibuat(): void
    {
        // Tanpa satu pun tamu, seluruh kode dalam daftar harus dilaporkan
        // hilang - dan tak satu pun baris baru dibuat.
        $this->artisan('tamu:selaraskan --terapkan')
            ->expectsOutputToContain('Kode tidak ditemukan')
            ->assertSuccessful();

        $this->assertSame(0, Tamu::count());
    }

    public function test_baris_yang_sudah_sesuai_tidak_dihitung_berubah(): void
    {
        $tamu = $this->tamu();
        $tamu->update([
            'nama' => 'Nezar Patria, S.Fil., M.Sc., M.B.A.',
            'lembaga' => 'Wakil Menteri Komunikasi dan Digital RI',
            'kategori_penghargaan' => 'Innovation in Digital Transformation',
            'sub_kategori' => 'Best Innovation in Digital Transformation Policy',
        ]);

        $this->artisan('tamu:selaraskan')
            ->expectsOutputToContain('Perlu diubah   : 0')
            ->assertSuccessful();
    }
}

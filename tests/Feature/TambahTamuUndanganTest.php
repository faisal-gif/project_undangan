<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * tamu:tambah membuat baris baru di basis data yang undangannya sudah dikirim,
 * jadi dua hal harus dijaga: mode coba tidak menulis apa pun, dan baris yang
 * sudah ada tidak diubah, tidak dihapus, dan tidak diduplikasi.
 */
class TambahTamuUndanganTest extends TestCase
{
    use RefreshDatabase;

    private const JUMLAH = 36;

    private const JUMLAH_HADIR = 35;

    public function test_mode_coba_tidak_membuat_baris(): void
    {
        $this->artisan('tamu:tambah')
            ->expectsOutputToContain('MODE COBA')
            ->assertSuccessful();

        $this->assertSame(0, Tamu::count());
    }

    public function test_terapkan_membuat_seluruh_tamu_dengan_kode_unik(): void
    {
        $this->artisan('tamu:tambah --terapkan')->assertSuccessful();

        $this->assertSame(self::JUMLAH, Tamu::count());
        $this->assertSame(self::JUMLAH, Tamu::distinct()->pluck('code')->count());
        $this->assertSame(self::JUMLAH_HADIR, Tamu::where('jenis', 'hadir')->count());
        $this->assertSame(1, Tamu::where('jenis', 'penerima')->count());
        $this->assertSame(0, Tamu::whereNotNull('kategori_penghargaan')->count());

        $tamu = Tamu::where('nama', 'Fifi Trisjanti')->firstOrFail();

        $this->assertSame('Dirut Lippo Mall Jatim', $tamu->lembaga);
        $this->assertSame(1, $tamu->jumlah_orang);
        $this->assertSame('Naning', $tamu->pic);
        $this->assertSame('belum', $tamu->rsvp);
        $this->assertSame(8, strlen($tamu->code));
    }

    public function test_nama_sama_lembaga_beda_tetap_jadi_tiga_undangan(): void
    {
        $this->artisan('tamu:tambah --terapkan')->assertSuccessful();

        $this->assertSame(3, Tamu::where('nama', 'Pimpinan')->count());
    }

    public function test_dijalankan_dua_kali_tidak_menduplikasi(): void
    {
        $this->artisan('tamu:tambah --terapkan')->assertSuccessful();

        $this->artisan('tamu:tambah --terapkan')
            ->expectsOutputToContain('Akan ditambah  : 0')
            ->expectsOutputToContain('Sudah ada      : ' . self::JUMLAH)
            ->assertSuccessful();

        $this->assertSame(self::JUMLAH, Tamu::count());
    }

    public function test_tamu_yang_sudah_ada_tidak_disentuh(): void
    {
        $penerima = Tamu::create([
            'acara_id' => Acara::aktif()->id,
            'code' => 'GIFH8YBP',
            'nama' => 'Iwhan Tri Cahyono',
            'lembaga' => 'Public Relation Manager Gudang Garam',
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Innovation in Business Excellence',
            'meja' => '4',
            'kursi' => '1, 2',
            'rsvp' => 'hadir',
        ]);

        $this->artisan('tamu:tambah --terapkan')->assertSuccessful();

        $segar = $penerima->fresh();

        $this->assertSame('GIFH8YBP', $segar->code);
        $this->assertSame('Iwhan Tri Cahyono', $segar->nama);
        $this->assertSame('penerima', $segar->jenis);
        $this->assertSame('4', $segar->meja);
        $this->assertSame('1, 2', $segar->kursi);
        $this->assertSame('hadir', $segar->rsvp);

        $this->assertSame(self::JUMLAH + 1, Tamu::count());
    }

    /**
     * Tujuh baris "Undangan External" tidak punya lembaga. Penjagaan baris
     * ganda membandingkan nama DAN lembaga, dan di SQL "lembaga = null" tidak
     * pernah benar - kalau query builder berhenti menerjemahkannya jadi
     * "lembaga is null", ketujuh baris ini akan terduplikasi tiap dijalankan.
     */
    /**
     * No 40 dari "Update Undangan Penerima.xlsx" adalah satu-satunya
     * penerima di daftar ini. Dia harus lahir sebagai penerima, bukan tamu
     * biasa, dan kategori penghargaannya memang masih kosong.
     */
    public function test_penerima_baru_dibuat_sebagai_penerima(): void
    {
        $this->artisan('tamu:tambah --terapkan')->assertSuccessful();

        $tamu = Tamu::where('nama', 'Dr. H. Abdul Hamid Wahid, M.Ag.')->firstOrFail();

        $this->assertSame('penerima', $tamu->jenis);
        $this->assertSame('Bupati Bondowoso', $tamu->lembaga);
        $this->assertSame(2, $tamu->jumlah_orang);
        $this->assertSame('Hainor', $tamu->pic);
        $this->assertNull($tamu->kategori_penghargaan);
        $this->assertSame(8, strlen($tamu->code));
    }

    public function test_baris_external_tanpa_lembaga_tidak_terduplikasi(): void
    {
        $this->artisan('tamu:tambah --terapkan')->assertSuccessful();
        $this->artisan('tamu:tambah --terapkan')->assertSuccessful();

        $this->assertSame(1, Tamu::where('nama', 'P. Wahyu')->count());
        $this->assertSame(8, Tamu::whereNull('lembaga')->count());

        $wahyu = Tamu::where('nama', 'P. Wahyu')->firstOrFail();

        $this->assertNull($wahyu->lembaga);
        $this->assertNull($wahyu->pic);
        $this->assertSame(1, $wahyu->jumlah_orang);
        $this->assertSame('hadir', $wahyu->jenis);
    }
}

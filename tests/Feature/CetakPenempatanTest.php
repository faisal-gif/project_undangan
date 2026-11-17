<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Lembar cetak penempatan: denah, daftar per meja, dan indeks nama.
 *
 * Yang dijaga di sini adalah janji bahwa kertasnya tidak pernah menyebut
 * susunan yang berbeda dari layar - ia memakai papan() yang sama - dan bahwa
 * indeksnya benar-benar bisa dicari dari arah nama, termasuk untuk undangan
 * yang terbelah ke dua meja.
 */
class CetakPenempatanTest extends TestCase
{
    use RefreshDatabase;

    private Acara $acara;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->acara = Acara::where('aktif', true)->firstOrFail();
        $this->acara->update(['jumlah_meja' => 3, 'kursi_per_meja' => 6, 'kursi_tambahan_meja' => null]);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    private function tamu(string $nama, ?string $lembaga, ?string $meja, ?string $kursi, int $orang = 1): Tamu
    {
        return Tamu::create([
            'acara_id' => $this->acara->id,
            'nama' => $nama,
            'lembaga' => $lembaga,
            'code' => strtoupper(fake()->bothify('????####')),
            'jumlah_orang' => $orang,
            'meja' => $meja,
            'kursi' => $kursi,
            'status' => 'belum',
        ]);
    }

    private function lihat()
    {
        return $this->actingAs($this->admin)->get(route('admin.penempatan.cetak'));
    }

    public function test_lembar_cetak_membawa_denah_dan_keterangan_acara(): void
    {
        $this->acara->update(['tempat' => 'Grand Ballroom']);

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Penempatan/Cetak')
                ->where('acara.tempat', 'Grand Ballroom')
                ->where('acara.jumlah_meja', 3)
                ->where('acara.jumlah_kursi', 18)
                ->has('mejas', 3)
                ->has('letak')
                ->where('orientasi', Acara::DENAH_LANDSCAPE));
    }

    /**
     * Susunan di kertas harus datang dari papan() yang sama dengan halaman
     * penempatan - bukan dibangun ulang dengan aturan sendiri.
     */
    public function test_daftar_per_meja_menyebut_nama_dan_lembaga_tiap_kursi(): void
    {
        $this->tamu('Kepala Dinas Pendidikan', 'Pemprov Jawa Timur', '1', '1, 2', 2);

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('mejas.0.terisi', 2)
                ->where('mejas.0.kursi.0.tamu.nama', 'Kepala Dinas Pendidikan')
                ->where('mejas.0.kursi.0.tamu.lembaga', 'Pemprov Jawa Timur')
                ->where('mejas.0.kursi.1.tamu.nama', 'Kepala Dinas Pendidikan')
                ->where('mejas.0.kursi.2.tamu', null));
    }

    public function test_indeks_urut_abjad_dan_menyebut_tempat_duduk(): void
    {
        $this->tamu('Zainal Arifin', 'Universitas Jember', '2', '1');
        $this->tamu('Ahmad Basuki', 'Pemkab Bondowoso', '1', '3');

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('indeks', 2)
                ->where('indeks.0.nama', 'Ahmad Basuki')
                ->where('indeks.0.lembaga', 'Pemkab Bondowoso')
                ->where('indeks.0.tempat_duduk', 'M1 K3')
                ->where('indeks.1.nama', 'Zainal Arifin')
                ->where('indeks.1.tempat_duduk', 'M2 K1'));
    }

    /**
     * Petugas penerima tamu mencari dari nama. Kalau undangannya terbelah,
     * kedua mejanya harus ikut tertulis - kalau tidak, separuh rombongan
     * diarahkan ke meja yang bukan miliknya.
     */
    public function test_undangan_terbelah_menyebut_kedua_mejanya(): void
    {
        $this->tamu('Kepala Perwakilan', 'Bank Indonesia', '1, 3', '1:4, 3:2', 2);

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('indeks', 1)
                ->where('indeks.0.tempat_duduk', 'M1 K4 · M3 K2'));
    }

    public function test_tamu_tanpa_tempat_duduk_tidak_masuk_indeks(): void
    {
        $this->tamu('Sudah Duduk', null, '1', '1');
        $this->tamu('Belum Duduk', null, null, null);

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('indeks', 1)
                ->where('indeks.0.nama', 'Sudah Duduk'));
    }

    public function test_meja_bertambah_kursi_ikut_tercetak(): void
    {
        $this->acara->update(['kursi_tambahan_meja' => ['3' => 1]]);

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('acara.jumlah_kursi', 19)
                ->where('mejas.0.kapasitas', 6)
                ->where('mejas.2.kapasitas', 7)
                ->has('mejas.2.kursi', 7));
    }

    public function test_tanpa_acara_aktif_halaman_tetap_terbuka(): void
    {
        Acara::query()->update(['aktif' => false]);

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Penempatan/Cetak')
                ->where('acara', null)
                ->has('mejas', 0)
                ->has('indeks', 0));
    }

    public function test_tamu_umum_tidak_bisa_membuka_lembar_cetak(): void
    {
        $this->get(route('admin.penempatan.cetak'))->assertRedirect();
    }
}

<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Daftar admin bisa disaring jadi penerima penghargaan saja atau tamu
 * undangan saja. Dua janji yang dijaga di sini: saringannya tidak pernah
 * menghapus saringan lain (edisi, pencarian), dan angka di tombolnya tetap
 * menghitung kedua jenis walau salah satunya sedang dipilih.
 */
class FilterJenisTamuTest extends TestCase
{
    use RefreshDatabase;

    private Acara $aktif;

    protected function setUp(): void
    {
        parent::setUp();

        $this->aktif = Acara::where('aktif', true)->firstOrFail();

        $this->buat('Penerima Satu', 'penerima', 'Lembaga Alfa');
        $this->buat('Penerima Dua', 'penerima', 'Lembaga Beta');
        $this->buat('Tamu Satu', 'hadir', 'Lembaga Alfa');
    }

    private function buat(string $nama, string $jenis, string $lembaga): Tamu
    {
        return Tamu::create([
            'acara_id' => $this->aktif->id,
            'nama' => $nama,
            'lembaga' => $lembaga,
            'jenis' => $jenis,
            'code' => strtoupper(substr(md5($nama), 0, 8)),
            'status' => 'belum',
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_tanpa_filter_semua_jenis_tampil(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Tamu/Index')
                ->has('tamus.data', 3)
                ->where('filters.jenis', null)
                ->where('jumlahJenis.penerima', 2)
                ->where('jumlahJenis.hadir', 1));
    }

    public function test_filter_penerima_hanya_menampilkan_penerima(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['jenis' => 'penerima']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 2)
                ->where('filters.jenis', 'penerima'));
    }

    public function test_filter_undangan_hanya_menampilkan_tamu_undangan(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['jenis' => 'hadir']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 1)
                ->where('tamus.data.0.nama', 'Tamu Satu'));
    }

    /**
     * Angka di tombolnya menerangkan daftar yang sedang dicari, jadi ikut
     * menyempit oleh pencarian - tapi tidak boleh ikut menyempit oleh jenis
     * yang sedang dipilih, karena tombol lain jadi selalu nol.
     */
    public function test_jumlah_tiap_jenis_tidak_ikut_menyempit_oleh_filternya_sendiri(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['jenis' => 'penerima']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('jumlahJenis.penerima', 2)
                ->where('jumlahJenis.hadir', 1));
    }

    public function test_filter_jenis_dan_pencarian_dipakai_bersama(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['jenis' => 'penerima', 'search' => 'Alfa']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 1)
                ->where('tamus.data.0.nama', 'Penerima Satu')
                ->where('jumlahJenis.penerima', 1)
                ->where('jumlahJenis.hadir', 1));
    }

    public function test_jenis_asing_dianggap_semua_bukan_daftar_kosong(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['jenis' => 'penerima-penghargaan']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 3)
                ->where('filters.jenis', null));
    }

    public function test_filter_jenis_tidak_bocor_ke_edisi_lain(): void
    {
        $lama = Acara::where('aktif', false)->firstOrFail();

        Tamu::create([
            'acara_id' => $lama->id,
            'nama' => 'Penerima Kemarin',
            'lembaga' => 'Lembaga Alfa',
            'jenis' => 'penerima',
            'code' => 'KODELAMA',
            'status' => 'belum',
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['jenis' => 'penerima']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 2)
                ->where('jumlahJenis.penerima', 2));
    }
}

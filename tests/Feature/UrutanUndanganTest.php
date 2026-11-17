<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Daftar undangan: yang terbaru di atas.
 *
 * Diurutkan dari id, bukan created_at. Tamu ditambahkan berombongan lewat
 * perintah impor sehingga puluhan baris berbagi detik yang sama, dan urutan
 * yang seri membuat paginasi mengulang baris di halaman berikutnya atau
 * melewatkannya sama sekali - itu bug yang jauh lebih merepotkan daripada
 * urutan yang terbalik.
 */
class UrutanUndanganTest extends TestCase
{
    use RefreshDatabase;

    private Acara $acara;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->acara = Acara::where('aktif', true)->firstOrFail();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    private function tamu(string $nama, array $tambahan = []): Tamu
    {
        return Tamu::create($tambahan + [
            'acara_id' => $this->acara->id,
            'nama' => $nama,
            'code' => strtoupper(fake()->bothify('????####')),
            'jumlah_orang' => 1,
            'status' => 'belum',
        ]);
    }

    private function lihat(array $kueri = [])
    {
        return $this->actingAs($this->admin)->get(route('admin.tamu.index', $kueri));
    }

    public function test_undangan_terbaru_muncul_paling_atas(): void
    {
        $this->tamu('Paling Lama');
        $this->tamu('Tengah');
        $this->tamu('Paling Baru');

        $this->lihat()
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Tamu/Index')
                ->where('tamus.data.0.nama', 'Paling Baru')
                ->where('tamus.data.1.nama', 'Tengah')
                ->where('tamus.data.2.nama', 'Paling Lama'));
    }

    /**
     * Baris yang dibuat pada detik yang sama - seperti hasil impor - tetap
     * harus punya urutan yang pasti, kalau tidak paginasinya bocor.
     */
    public function test_baris_sewaktu_tetap_berurutan_pasti(): void
    {
        $waktu = now()->subHour();

        foreach (range(1, 15) as $n) {
            $this->tamu('Impor '.$n, ['created_at' => $waktu, 'updated_at' => $waktu]);
        }

        $halaman1 = $this->lihat()->viewData('page')['props']['tamus']['data'];
        $halaman2 = $this->lihat(['page' => 2])->viewData('page')['props']['tamus']['data'];

        $nama1 = array_column($halaman1, 'nama');
        $nama2 = array_column($halaman2, 'nama');

        $this->assertSame('Impor 15', $nama1[0]);
        $this->assertSame('Impor 6', $nama1[9]);
        $this->assertSame('Impor 5', $nama2[0]);

        // Tidak ada satu pun nama yang muncul di kedua halaman.
        $this->assertEmpty(array_intersect($nama1, $nama2));
        $this->assertCount(15, array_unique(array_merge($nama1, $nama2)));
    }

    public function test_urutan_tetap_terbaru_dulu_saat_dicari(): void
    {
        $this->tamu('Pimpinan Lama', ['lembaga' => 'TIMES Indonesia']);
        $this->tamu('Pimpinan Baru', ['lembaga' => 'TIMES Indonesia']);

        $this->lihat(['search' => 'TIMES'])
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 2)
                ->where('tamus.data.0.nama', 'Pimpinan Baru'));
    }

    public function test_urutan_tetap_terbaru_dulu_saat_disaring_jenis(): void
    {
        $this->tamu('Penerima Lama', ['jenis' => 'penerima']);
        $this->tamu('Hadir Saja', ['jenis' => 'hadir']);
        $this->tamu('Penerima Baru', ['jenis' => 'penerima']);

        $this->lihat(['jenis' => 'penerima'])
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 2)
                ->where('tamus.data.0.nama', 'Penerima Baru')
                ->where('tamus.data.1.nama', 'Penerima Lama'));
    }
}

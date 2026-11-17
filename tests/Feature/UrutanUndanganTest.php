<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use App\Models\Winners;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tiga daftar bernomor halaman - Undangan, Buku Tamu, dan Pemenang - dengan
 * yang terbaru di atas.
 *
 * Ketiganya diurutkan dari id, bukan created_at. Barisnya ditambahkan
 * berombongan lewat perintah impor sehingga puluhan baris berbagi detik yang
 * sama, dan urutan yang seri membuat paginasi mengulang baris di halaman
 * berikutnya atau melewatkannya sama sekali - bug yang jauh lebih merepotkan
 * daripada urutan yang terbalik. Sebelumnya tidak satu pun dari ketiganya
 * punya urutan tersurat.
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

    public function test_buku_tamu_juga_terbaru_di_atas(): void
    {
        $this->tamu('Datang Lebih Dulu');
        $this->tamu('Baru Didaftarkan');

        $this->actingAs($this->admin)
            ->get(route('admin.qrScanner'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/QrScanner/Index')
                ->where('tamus.data.0.nama', 'Baru Didaftarkan')
                ->where('tamus.data.1.nama', 'Datang Lebih Dulu'));
    }

    public function test_buku_tamu_tetap_terbaru_dulu_saat_dicari(): void
    {
        $this->tamu('Kepala Lama', ['lembaga' => 'Pemprov Jawa Timur']);
        $this->tamu('Kepala Baru', ['lembaga' => 'Pemprov Jawa Timur']);

        $this->actingAs($this->admin)
            ->get(route('admin.qrScanner', ['search' => 'Pemprov']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tamus.data', 2)
                ->where('tamus.data.0.nama', 'Kepala Baru'));
    }

    public function test_pemenang_juga_terbaru_di_atas(): void
    {
        Winners::create(['nama' => 'Pemenang Lama', 'kategori' => 'Tokoh']);
        Winners::create(['nama' => 'Pemenang Baru', 'kategori' => 'Tokoh']);

        $this->actingAs($this->admin)
            ->get(route('admin.winners.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Winners/Index')
                ->where('winners.data.0.nama', 'Pemenang Baru')
                ->where('winners.data.1.nama', 'Pemenang Lama'));
    }

    public function test_pemenang_tetap_terbaru_dulu_saat_dicari(): void
    {
        Winners::create(['nama' => 'Budi Lama', 'kategori' => 'Tokoh']);
        Winners::create(['nama' => 'Budi Baru', 'kategori' => 'Tokoh']);
        Winners::create(['nama' => 'Sari', 'kategori' => 'Tokoh']);

        $this->actingAs($this->admin)
            ->get(route('admin.winners.index', ['search' => 'Budi']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('winners.data', 2)
                ->where('winners.data.0.nama', 'Budi Baru')
                ->where('winners.data.1.nama', 'Budi Lama'));
    }
}

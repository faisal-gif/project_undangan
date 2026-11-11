<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Penempatan tamu ke meja: jumlah meja diturunkan dari pengaturan, dan nomor
 * kursi dipilihkan sistem supaya tidak bisa salah ketik.
 */
class PenempatanKursiTest extends TestCase
{
    use RefreshDatabase;

    private Acara $acara;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->acara = Acara::where('aktif', true)->firstOrFail();
        $this->acara->update(['jumlah_kursi' => 14, 'kursi_per_meja' => 6]);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    private function tamu(int $orang = 2, string $nama = 'Tamu Uji'): Tamu
    {
        return Tamu::create([
            'acara_id' => $this->acara->id,
            'nama' => $nama,
            'code' => strtoupper(fake()->bothify('????####')),
            'jumlah_orang' => $orang,
            'status' => 'belum',
        ]);
    }

    public function test_jumlah_meja_dihitung_dari_pengaturan(): void
    {
        // 14 kursi, 6 per meja: tiga meja, yang terakhir hanya dua kursi.
        $this->assertSame(3, $this->acara->jumlahMeja());
        $this->assertSame(6, $this->acara->kursiDiMeja(1));
        $this->assertSame(2, $this->acara->kursiDiMeja(3));
        $this->assertSame(0, $this->acara->kursiDiMeja(4));
    }

    public function test_tamu_ditempatkan_di_kursi_kosong_pertama(): void
    {
        $tamu = $this->tamu(2);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 1])
            ->assertRedirect();

        $tamu->refresh();

        $this->assertSame('1', $tamu->meja);
        $this->assertSame('1, 2', $tamu->kursi);
    }

    public function test_tamu_berikutnya_melanjutkan_kursi_yang_tersisa(): void
    {
        $pertama = $this->tamu(2, 'Pertama');
        $kedua = $this->tamu(2, 'Kedua');

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $pertama->id, 'meja' => 1]);
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $kedua->id, 'meja' => 1]);

        $this->assertSame('3, 4', $kedua->fresh()->kursi);
    }

    public function test_meja_yang_sisa_kursinya_kurang_ditolak(): void
    {
        // Meja 3 hanya punya dua kursi; tamu bertiga tidak muat.
        $tamu = $this->tamu(3, 'Bertiga');

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 3])
            ->assertSessionHasErrors('meja');

        $this->assertNull($tamu->fresh()->meja);
    }

    public function test_meja_di_luar_jumlah_meja_ditolak(): void
    {
        $tamu = $this->tamu(1);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 9])
            ->assertSessionHasErrors('meja');
    }

    public function test_tamu_bisa_dikeluarkan_dari_mejanya(): void
    {
        $tamu = $this->tamu(2);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 1]);
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.keluarkan', $tamu));

        $tamu->refresh();

        $this->assertNull($tamu->meja);
        $this->assertNull($tamu->kursi);
    }

    public function test_kursi_yang_dikosongkan_bisa_dipakai_lagi(): void
    {
        $pertama = $this->tamu(2, 'Pertama');
        $kedua = $this->tamu(2, 'Kedua');

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $pertama->id, 'meja' => 1]);
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.keluarkan', $pertama));
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $kedua->id, 'meja' => 1]);

        $this->assertSame('1, 2', $kedua->fresh()->kursi);
    }

    public function test_papan_menampilkan_meja_dan_yang_belum_ditempatkan(): void
    {
        $tamu = $this->tamu(2, 'Sudah Duduk');
        $this->tamu(2, 'Belum Duduk');

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 1]);

        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('acara.jumlah_meja', 3)
                ->where('mejas.0.terisi', 2)
                ->where('mejas.0.kursi.0.tamu.nama', 'Sudah Duduk')
                ->where('belum.0.nama', 'Belum Duduk'));
    }

    public function test_denah_memakai_susunan_yang_sama(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.denah'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('acara.jumlah_meja', 3)
                ->where('mejas.2.kapasitas', 2));
    }

    public function test_letak_meja_jatuh_ke_grid_bila_belum_diatur(): void
    {
        $letak = $this->acara->letakMeja();

        $this->assertCount(3, $letak);
        $this->assertArrayHasKey('x', $letak[1]);
        $this->assertArrayHasKey('y', $letak[1]);
    }

    public function test_letak_meja_bisa_disimpan_dan_dibaca_ulang(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.denah.simpan'), [
                'letak' => [
                    '1' => ['x' => 20.5, 'y' => 80],
                    '2' => ['x' => 60, 'y' => 40],
                ],
            ])
            ->assertRedirect();

        $letak = $this->acara->fresh()->letakMeja();

        $this->assertEqualsWithDelta(20.5, $letak[1]['x'], 0.01);
        $this->assertEqualsWithDelta(80, $letak[1]['y'], 0.01);
    }

    public function test_letak_di_luar_jangkauan_dijepit_dan_meja_asing_diabaikan(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.denah.simpan'), [
                'letak' => [
                    '1' => ['x' => -40, 'y' => 400],
                    '99' => ['x' => 10, 'y' => 10],
                ],
            ]);

        $tersimpan = $this->acara->fresh()->denah;

        $this->assertSame(0.0, (float) $tersimpan['1']['x']);
        $this->assertSame(100.0, (float) $tersimpan['1']['y']);
        $this->assertArrayNotHasKey('99', $tersimpan);
    }

    public function test_susunan_bisa_dikembalikan_ke_grid(): void
    {
        $this->acara->update(['denah' => ['1' => ['x' => 5, 'y' => 5]]]);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.denah.reset'))
            ->assertRedirect();

        $this->assertNull($this->acara->fresh()->denah);
    }

    public function test_orientasi_menentukan_jumlah_kolom_grid(): void
    {
        $this->acara->update(['jumlah_kursi' => 144, 'meja_per_baris' => null]);

        $this->acara->update(['orientasi_denah' => Acara::DENAH_LANDSCAPE]);
        $melebar = $this->acara->fresh()->kolomGrid();

        $this->acara->update(['orientasi_denah' => Acara::DENAH_POTRET]);
        $memanjang = $this->acara->fresh()->kolomGrid();

        // Ruangan memanjang harus punya baris yang lebih pendek.
        $this->assertGreaterThan($memanjang, $melebar);
    }

    public function test_orientasi_bisa_diubah_dan_menghapus_letak_lama(): void
    {
        $this->acara->update(['denah' => ['1' => ['x' => 10, 'y' => 10]]]);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.denah.grid'), ['orientasi' => Acara::DENAH_POTRET])
            ->assertRedirect();

        $segar = $this->acara->fresh();

        $this->assertSame(Acara::DENAH_POTRET, $segar->orientasiDenah());
        $this->assertNull($segar->denah);
    }

    public function test_mengubah_orientasi_tidak_menghapus_meja_per_baris(): void
    {
        $this->acara->update(['meja_per_baris' => 4]);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.denah.grid'), ['orientasi' => Acara::DENAH_POTRET]);

        $this->assertSame(4, (int) $this->acara->fresh()->meja_per_baris);
    }

    public function test_orientasi_asing_ditolak(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.denah.grid'), ['orientasi' => 'diagonal'])
            ->assertSessionHasErrors('orientasi');
    }

    public function test_denah_membawa_orientasi(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.denah'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('orientasi', Acara::DENAH_LANDSCAPE));
    }
}

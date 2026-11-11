<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tempat duduk tamu: tersimpan, sampai ke undangan, dan satu kursi tidak
 * pernah ditempati dua orang.
 */
class KursiTamuTest extends TestCase
{
    use RefreshDatabase;

    private Acara $aktif;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->aktif = Acara::where('aktif', true)->firstOrFail();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    private function tamu(array $ubah = []): Tamu
    {
        return Tamu::create(array_merge([
            'acara_id' => $this->aktif->id,
            'nama' => 'Tamu Uji',
            'code' => strtoupper(fake()->bothify('????####')),
            'status' => 'belum',
        ], $ubah));
    }

    public function test_meja_dan_kursi_tersimpan_saat_tamu_dibuat(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.tamu.store'), [
                'nama' => 'Budi',
                'jenis' => 'hadir',
                'jumlah_orang' => 2,
                'meja' => '5',
                'kursi' => '3, 4',
            ])
            ->assertRedirect();

        $tamu = Tamu::where('nama', 'Budi')->firstOrFail();

        $this->assertSame('5', $tamu->meja);
        $this->assertSame('3, 4', $tamu->kursi);
    }

    public function test_kursi_yang_sudah_dipakai_ditolak(): void
    {
        $this->tamu(['nama' => 'Sudah Duduk', 'meja' => '5', 'kursi' => '3, 4']);

        $this->actingAs($this->admin)
            ->post(route('admin.tamu.store'), [
                'nama' => 'Datang Belakangan',
                'jenis' => 'hadir',
                'meja' => '5',
                'kursi' => '4',
            ])
            ->assertSessionHasErrors('kursi');

        $this->assertDatabaseMissing('tamus', ['nama' => 'Datang Belakangan']);
    }

    public function test_kursi_sama_di_meja_lain_boleh(): void
    {
        $this->tamu(['nama' => 'Meja Lima', 'meja' => '5', 'kursi' => '3']);

        $this->actingAs($this->admin)
            ->post(route('admin.tamu.store'), [
                'nama' => 'Meja Enam',
                'jenis' => 'hadir',
                'meja' => '6',
                'kursi' => '3',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('tamus', ['nama' => 'Meja Enam', 'meja' => '6']);
    }

    public function test_nama_meja_tidak_peka_huruf_besar_kecil(): void
    {
        $this->tamu(['nama' => 'Tamu VIP', 'meja' => 'VIP 1', 'kursi' => '2']);

        $this->actingAs($this->admin)
            ->post(route('admin.tamu.store'), [
                'nama' => 'Penyusup',
                'jenis' => 'hadir',
                'meja' => 'vip 1',
                'kursi' => '2',
            ])
            ->assertSessionHasErrors('kursi');
    }

    public function test_tamu_boleh_menyimpan_ulang_kursinya_sendiri(): void
    {
        $tamu = $this->tamu(['nama' => 'Tetap', 'meja' => '5', 'kursi' => '3, 4']);

        $this->actingAs($this->admin)
            ->post(route('admin.tamu.update', $tamu), [
                '_method' => 'put',
                'nama' => 'Tetap',
                'jenis' => 'hadir',
                'jumlah_orang' => 2,
                'meja' => '5',
                'kursi' => '3, 4',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('3, 4', $tamu->fresh()->kursi);
    }

    public function test_meja_kosong_tidak_pernah_dianggap_bentrok(): void
    {
        $this->tamu(['nama' => 'Belum Ditempatkan A']);

        $this->actingAs($this->admin)
            ->post(route('admin.tamu.store'), [
                'nama' => 'Belum Ditempatkan B',
                'jenis' => 'hadir',
            ])
            ->assertSessionHasNoErrors();
    }

    /**
     * Tempat duduk urusan penerima tamu, bukan tamu. Nilainya tidak boleh ikut
     * terkirim ke halaman undangan - kalau ikut, tamu bisa membacanya dari
     * sumber halaman meski tidak ditampilkan di mana pun.
     */
    public function test_undangan_tidak_membocorkan_tempat_duduk(): void
    {
        $tamu = $this->tamu(['nama' => 'Tamu Duduk', 'meja' => '7', 'kursi' => '1, 2']);

        $balasan = $this->get(route('undangan', [$tamu->code, 'tamu-duduk']))->assertOk();

        $balasan->assertInertia(fn ($page) => $page
            ->missing('tamu.meja')
            ->missing('tamu.kursi'));

        $this->assertStringNotContainsString('Meja 7', $balasan->getContent());
    }

    public function test_pemindaian_qr_menyebutkan_tempat_duduk(): void
    {
        $tamu = $this->tamu(['nama' => 'Tamu Pindai', 'meja' => '9', 'kursi' => '6']);

        $this->actingAs($this->admin)
            ->from(route('admin.qrScanner'))
            ->get(route('admin.attendance', $tamu->code))
            ->assertRedirect()
            ->assertSessionHas('duduk', 'Meja 9 - Kursi 6');
    }

    public function test_nomor_kursi_di_luar_kapasitas_meja_ditolak(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.tamu.store'), [
                'nama' => 'Salah Ketik',
                'jenis' => 'hadir',
                'jumlah_orang' => 1,
                'meja' => '3',
                'kursi' => '8',
            ])
            ->assertSessionHasErrors('kursi');

        $this->assertDatabaseMissing('tamus', ['nama' => 'Salah Ketik']);
    }

    public function test_jumlah_kursi_harus_sama_dengan_jumlah_orang(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.tamu.store'), [
                'nama' => 'Kurang Kursi',
                'jenis' => 'hadir',
                'jumlah_orang' => 2,
                'meja' => '3',
                'kursi' => '1',
            ])
            ->assertSessionHasErrors('kursi');

        $this->assertDatabaseMissing('tamus', ['nama' => 'Kurang Kursi']);
    }
}

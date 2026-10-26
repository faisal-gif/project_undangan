<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Menyalin daftar tamu dari edisi sebelumnya ke edisi yang sedang aktif.
 */
class SalinTamuTest extends TestCase
{
    use RefreshDatabase;

    private Acara $aktif;
    private Acara $lama;

    protected function setUp(): void
    {
        parent::setUp();

        $this->aktif = Acara::where('aktif', true)->firstOrFail();
        $this->lama = Acara::where('aktif', false)->firstOrFail();

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function tamuLama(array $atribut = []): Tamu
    {
        return Tamu::create($atribut + [
            'acara_id' => $this->lama->id,
            'nama' => 'Tamu Kemarin',
            'lembaga' => 'Lembaga Kemarin',
            'pic' => 'Panitia',
            'jumlah_orang' => 2,
            'code' => strtoupper(substr(md5(uniqid('', true)), 0, 8)),
            'qr_code' => 'qrcodes/99.png',
            'status' => 'datang',
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_tamu_terpilih_tersalin_ke_edisi_aktif(): void
    {
        $asal = $this->tamuLama();

        $this->actingAs($this->admin())
            ->post(route('admin.tamu.salin'), ['tamu_ids' => [$asal->id]])
            ->assertRedirect(route('admin.tamu.index'));

        $salinan = Tamu::edisi($this->aktif)->firstOrFail();

        $this->assertSame('Tamu Kemarin', $salinan->nama);
        $this->assertSame('Lembaga Kemarin', $salinan->lembaga);
        $this->assertSame(2, (int) $salinan->jumlah_orang);
        // Baris baru, bukan dipindah: yang lama harus tetap di edisinya.
        $this->assertNotSame($asal->id, $salinan->id);
        $this->assertSame($this->lama->id, $asal->fresh()->acara_id);
    }

    public function test_status_dan_kode_tidak_ikut_tersalin(): void
    {
        $asal = $this->tamuLama();

        $this->actingAs($this->admin())
            ->post(route('admin.tamu.salin'), ['tamu_ids' => [$asal->id]]);

        $salinan = Tamu::edisi($this->aktif)->firstOrFail();

        $this->assertSame('belum', $salinan->status);
        $this->assertNotSame($asal->code, $salinan->code);
        $this->assertNull($salinan->qr_code);
    }

    public function test_nama_yang_sudah_ada_dilewati(): void
    {
        $asal = $this->tamuLama();
        // Nama sama, hanya beda spasi dan huruf besar.
        Tamu::create([
            'acara_id' => $this->aktif->id,
            'nama' => '  tamu   kemarin ',
            'code' => 'SUDAHADA',
            'status' => 'belum',
        ]);

        $this->actingAs($this->admin())
            ->post(route('admin.tamu.salin'), ['tamu_ids' => [$asal->id]]);

        $this->assertSame(1, Tamu::edisi($this->aktif)->count());
    }

    public function test_menyalin_dua_kali_tidak_menggandakan(): void
    {
        $asal = $this->tamuLama();

        foreach (range(1, 2) as $kali) {
            $this->actingAs($this->admin())
                ->post(route('admin.tamu.salin'), ['tamu_ids' => [$asal->id]]);
        }

        $this->assertSame(1, Tamu::edisi($this->aktif)->count());
    }

    public function test_tanpa_pilihan_ditolak(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.tamu.salin'), ['tamu_ids' => []])
            ->assertSessionHasErrors('tamu_ids');
    }

    public function test_halaman_salin_menandai_tamu_yang_sudah_ada(): void
    {
        $this->tamuLama(['nama' => 'Sudah Diundang']);
        $this->tamuLama(['nama' => 'Belum Diundang']);
        Tamu::create([
            'acara_id' => $this->aktif->id,
            'nama' => 'Sudah Diundang',
            'code' => 'ADA12345',
            'status' => 'belum',
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.tamu.salinForm'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Tamu/Salin')
                ->where('tujuan.id', $this->aktif->id)
                ->where('sumber.id', $this->lama->id)
                ->has('tamus', 2)
                // Daftar diurut nama: "Belum Diundang" lebih dulu.
                ->where('tamus.0.sudah_ada', false)
                ->where('tamus.1.sudah_ada', true));
    }
}

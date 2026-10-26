<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * QR dibuat saat diminta, tidak disimpan sebagai berkas, dan berisi kode acak
 * milik tamu - bukan nomor id yang bisa ditebak.
 */
class QrTamuTest extends TestCase
{
    use RefreshDatabase;

    private Acara $aktif;
    private Acara $lama;

    protected function setUp(): void
    {
        parent::setUp();

        $this->aktif = Acara::where('aktif', true)->firstOrFail();
        $this->lama = Acara::where('aktif', false)->firstOrFail();
    }

    private function tamu(Acara $acara, string $kode, string $nama = 'Tamu'): Tamu
    {
        return Tamu::create([
            'acara_id' => $acara->id,
            'nama' => $nama,
            'code' => $kode,
            'status' => 'belum',
        ]);
    }

    public function test_qr_disajikan_sebagai_svg_tanpa_berkas_tersimpan(): void
    {
        $this->tamu($this->aktif, 'KODEAKTF');

        $respons = $this->get(route('tamu.qr', 'KODEAKTF'));

        $respons->assertOk()->assertHeader('Content-Type', 'image/svg+xml');
        $this->assertStringContainsString('<svg', $respons->getContent());
    }

    public function test_kode_tidak_dikenal_menghasilkan_404(): void
    {
        $this->get(route('tamu.qr', 'TIDAKADA'))->assertNotFound();
    }

    public function test_check_in_memakai_kode_acak(): void
    {
        $tamu = $this->tamu($this->aktif, 'KODEAKTF');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.attendance', 'KODEAKTF'));

        $this->assertSame('datang', $tamu->fresh()->status);
    }

    public function test_kode_edisi_lama_ditolak(): void
    {
        $tamu = $this->tamu($this->lama, 'KODELAMA');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.attendance', 'KODELAMA'));

        $this->assertSame('belum', $tamu->fresh()->status);
    }

    public function test_qr_lama_berisi_nomor_id_masih_dikenali(): void
    {
        // QR edisi 2025 yang sudah beredar berisi angka; harus tetap ketemu
        // orangnya supaya pesannya "QR edisi lain", bukan "tidak ditemukan".
        $tamu = $this->tamu($this->lama, 'KODELAMA');

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.attendance', (string) $tamu->id))
            ->assertRedirect();

        $this->assertSame('belum', $tamu->fresh()->status);
    }
}

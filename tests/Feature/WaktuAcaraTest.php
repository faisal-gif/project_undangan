<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Jam acara diketik admin dalam WIB, disimpan dalam UTC, dan harus kembali
 * sebagai jam yang sama persis. Sebelum ini setiap penyimpanan menggeser
 * jamnya 7 jam ke depan.
 */
class WaktuAcaraTest extends TestCase
{
    use RefreshDatabase;

    private function simpan(array $ubahan): Acara
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
        $acara = Acara::aktif();

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->put(route('admin.acara.update', $acara->id), $ubahan + [
                'nama' => 'Anugerah TIMES Indonesia',
            ])
            ->assertRedirect();

        return $acara->fresh();
    }

    public function test_jam_yang_diketik_kembali_sama_setelah_disimpan(): void
    {
        $acara = $this->simpan([
            'mulai' => '2026-11-27T19:30',
            'selesai' => '2026-11-27T22:15',
        ]);

        $bagi = $acara->toShare();

        $this->assertSame('19:30 - 22:15 WIB', $bagi['jam_label']);
        $this->assertSame('Jumat, 27 November 2026', $bagi['tanggal_label']);
        $this->assertSame('2026-11-27T19:30:00+07:00', $bagi['mulai_iso']);
    }

    public function test_form_admin_menampilkan_jam_yang_sama(): void
    {
        $this->simpan(['mulai' => '2026-11-27T19:30']);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.acara.edit'))
            ->assertInertia(fn ($page) => $page->where('acara.mulai', '2026-11-27T19:30'));
    }

    public function test_disimpan_dalam_utc_di_basis_data(): void
    {
        $acara = $this->simpan(['mulai' => '2026-11-27T19:30']);

        // 19:30 WIB = 12:30 UTC
        $this->assertStringStartsWith(
            '2026-11-27 12:30',
            DB::table('acaras')->where('id', $acara->id)->value('mulai')
        );
    }

    public function test_menyimpan_berulang_tidak_menggeser_jam(): void
    {
        $acara = Acara::aktif();
        $awal = $acara->toShare()['jam_label'];

        // Simpan ulang nilai yang sudah ada, tiga kali.
        foreach (range(1, 3) as $kali) {
            $sekarang = Acara::aktif();
            $this->simpan([
                'mulai' => $sekarang->mulai->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'selesai' => $sekarang->selesai?->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
            ]);
        }

        $this->assertSame($awal, Acara::aktif()->toShare()['jam_label']);
    }

    public function test_jam_selesai_boleh_dikosongkan(): void
    {
        $acara = $this->simpan(['mulai' => '2026-11-27T19:30', 'selesai' => '']);

        $this->assertNull($acara->selesai);
        $this->assertSame('19:30 WIB', $acara->toShare()['jam_label']);
    }
}

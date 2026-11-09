<?php

namespace Tests\Feature;

use App\Models\Acara;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * API baca-saja /api/v1/acara untuk situs lain: dikunci kunci statis di
 * header, isinya info acara aktif plus hitung mundur siap pakai.
 */
class AcaraApiTest extends TestCase
{
    use RefreshDatabase;

    private const KUNCI = 'kunci-uji-12345';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.ati_api.key', self::KUNCI);
    }

    private function minta(array $header = ['x-api-key' => self::KUNCI]): TestResponse
    {
        return $this->withHeaders($header)->getJson('/api/v1/acara');
    }

    public function test_kunci_benar_mendapat_info_acara_aktif(): void
    {
        $this->minta()
            ->assertOk()
            ->assertJsonPath('data.nama', Acara::aktif()->nama);
    }

    public function test_isi_balasan_lengkap_tanpa_medan_internal(): void
    {
        $this->minta()
            ->assertJsonStructure([
                'data' => [
                    'nama', 'tahun', 'mulai_iso', 'selesai_iso', 'tanggal_label',
                    'tanggal_singkat', 'jam_label', 'tempat', 'alamat', 'peta_url',
                    'video_embed', 'status', 'detik_tersisa', 'sekarang',
                ],
            ])
            // Medan internal tidak boleh ikut keluar.
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.aktif')
            ->assertJsonMissingPath('data.video_url');
    }

    public function test_tanpa_kunci_ditolak(): void
    {
        $this->minta([])
            ->assertStatus(401)
            ->assertExactJson(['error' => 'Kunci API tidak sah atau tidak dikirim.', 'status' => 401]);
    }

    public function test_kunci_salah_ditolak(): void
    {
        $this->minta(['x-api-key' => 'salah'])
            ->assertStatus(401)
            ->assertExactJson(['error' => 'Kunci API tidak sah atau tidak dikirim.', 'status' => 401]);
    }

    public function test_kunci_belum_disetel_menutup_api(): void
    {
        // Gagal tertutup: kunci kosong tidak boleh cocok dengan apa pun.
        config()->set('services.ati_api.key', null);

        $this->minta()
            ->assertStatus(503)
            ->assertExactJson(['error' => 'API belum dikonfigurasi di server.', 'status' => 503]);
    }

    public function test_tanpa_acara_aktif_balas_404(): void
    {
        Acara::query()->update(['aktif' => false]);

        $this->minta()
            ->assertStatus(404)
            ->assertExactJson(['error' => 'Belum ada acara aktif.', 'status' => 404]);
    }

    public function test_status_akan_datang_beserta_sisa_detik(): void
    {
        $this->travelTo(Acara::aktif()->mulai->copy()->subHours(2));

        $this->minta()
            ->assertJsonPath('data.status', 'akan datang')
            ->assertJsonPath('data.detik_tersisa', 7200);
    }

    public function test_status_berlangsung_saat_acara_jalan(): void
    {
        $this->travelTo(Acara::aktif()->mulai->copy()->addMinutes(30));

        $this->minta()
            ->assertJsonPath('data.status', 'berlangsung')
            ->assertJsonPath('data.detik_tersisa', 0);
    }

    public function test_status_selesai_setelah_acara(): void
    {
        $this->travelTo(Acara::aktif()->selesai->copy()->addMinute());

        $this->minta()
            ->assertJsonPath('data.status', 'selesai')
            ->assertJsonPath('data.detik_tersisa', 0);
    }

    public function test_jam_dikirim_dalam_wib(): void
    {
        $acara = Acara::aktif();
        $acara->update(['mulai' => '2026-11-27T19:30', 'selesai' => '2026-11-27T22:15']);

        $balasan = $this->minta();

        $balasan->assertJsonPath('data.mulai_iso', '2026-11-27T19:30:00+07:00');
        $balasan->assertJsonPath('data.jam_label', '19:30 - 22:15 WIB');
        $this->assertStringEndsWith('+07:00', $balasan->json('data.sekarang'));
    }

    public function test_balasan_membawa_header_cache(): void
    {
        $this->minta()->assertHeader('Cache-Control', 'max-age=60, public');
    }

    public function test_galat_rute_api_tetap_json(): void
    {
        // Sengaja tanpa Accept: application/json - pemanggil dari server
        // umumnya tidak mengirimnya, dan balasannya tetap harus JSON.
        $balasan = $this->get('/api/v1/tidak-ada');

        $balasan->assertNotFound();
        $this->assertStringContainsString('application/json', $balasan->headers->get('content-type'));
    }
}

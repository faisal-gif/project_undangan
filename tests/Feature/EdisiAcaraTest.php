<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tamu dipisahkan per edisi acara: daftar admin, pencarian, check-in, dan
 * tautan undangan tidak boleh bocor antar edisi.
 */
class EdisiAcaraTest extends TestCase
{
    use RefreshDatabase;

    private Acara $aktif;
    private Acara $lama;
    private Tamu $tamuAktif;
    private Tamu $tamuLama;

    protected function setUp(): void
    {
        parent::setUp();

        // Kedua edisi dibuat oleh migrasi: 2026 aktif, 2025 arsip.
        $this->aktif = Acara::where('aktif', true)->firstOrFail();
        $this->lama = Acara::where('aktif', false)->firstOrFail();

        $this->tamuAktif = Tamu::create([
            'acara_id' => $this->aktif->id,
            'nama' => 'Tamu Sekarang',
            'lembaga' => 'Lembaga Sekarang',
            'code' => 'KODEBARU',
            'status' => 'belum',
        ]);

        $this->tamuLama = Tamu::create([
            'acara_id' => $this->lama->id,
            'nama' => 'Tamu Kemarin',
            'lembaga' => 'Lembaga Kemarin',
            'code' => 'KODELAMA',
            'status' => 'belum',
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_daftar_tamu_hanya_menampilkan_edisi_aktif(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Tamu/Index')
                ->where('acaraDilihat.id', $this->aktif->id)
                ->has('tamus.data', 1)
                ->where('tamus.data.0.nama', 'Tamu Sekarang'));
    }

    public function test_edisi_lain_bisa_dilihat_lewat_query_string(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['acara' => $this->lama->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('acaraDilihat.aktif', false)
                ->has('tamus.data', 1)
                ->where('tamus.data.0.nama', 'Tamu Kemarin'));
    }

    public function test_pencarian_tidak_bocor_ke_edisi_lain(): void
    {
        // Kata ini hanya ada di kolom lembaga milik tamu edisi lama. Tanpa
        // grup OR, baris itu ikut lolos meski filter edisinya 2026.
        $this->actingAs($this->admin())
            ->get(route('admin.tamu.index', ['search' => 'Kemarin']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('tamus.data', 0));
    }

    public function test_tamu_baru_masuk_edisi_aktif(): void
    {
        // store() membuat QR PNG lewat BaconQrCode yang butuh ekstensi imagick.
        if (! extension_loaded('imagick')) {
            $this->markTestSkipped('Ekstensi imagick tidak tersedia di lingkungan ini.');
        }

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

        $this->actingAs($this->admin())
            ->post(route('admin.tamu.store'), [
                'nama' => 'Tamu Baru',
                'lembaga' => 'Lembaga Baru',
                'alamat' => 'Malang',
                'jumlah_orang' => 2,
                'pic' => 'Panitia',
            ])
            ->assertRedirect(route('admin.tamu.index'));

        $this->assertSame(
            $this->aktif->id,
            Tamu::where('nama', 'Tamu Baru')->value('acara_id')
        );
    }

    public function test_check_in_menolak_qr_edisi_lain(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.attendance', $this->tamuLama->id))
            ->assertRedirect();

        $this->assertSame('belum', $this->tamuLama->fresh()->status);
    }

    public function test_check_in_menerima_tamu_edisi_aktif(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.attendance', $this->tamuAktif->id));

        $this->assertSame('datang', $this->tamuAktif->fresh()->status);
    }

    public function test_undangan_edisi_lama_menampilkan_halaman_tertutup(): void
    {
        $this->get(route('undangan', [$this->tamuLama->code, 'tamu-kemarin']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Guest/Undangan/Selesai')
                ->where('nama', 'Tamu Kemarin'));
    }

    public function test_undangan_edisi_aktif_tetap_hidup(): void
    {
        $this->get(route('undangan', [$this->tamuAktif->code, 'tamu-sekarang']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Guest/Undangan/Index'));
    }

    public function test_undangan_id_tidak_dikenal_menghasilkan_404(): void
    {
        $this->get(route('undangan', ['KODEASING', 'x']))->assertNotFound();

        // Tautan lama bernomor hanya boleh membuka undangan edisi yang lewat.
        $this->get(route('undangan', [$this->tamuLama->id, 'x']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Guest/Undangan/Selesai'));

        // Undangan edisi aktif tidak boleh bisa dibuka lewat nomor id.
        $this->get(route('undangan', [$this->tamuAktif->id, 'x']))->assertNotFound();
    }

    public function test_rute_massal_butuh_login(): void
    {
        $this->get(route('admin.tamu.loopEmail'))->assertRedirect(route('login'));
        $this->get(route('admin.tamu.salinForm'))->assertRedirect(route('login'));
    }
}

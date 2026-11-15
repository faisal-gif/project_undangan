<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Halaman rincian tamu sebelumnya sisa dari aplikasi lain: ia membaca kolom
 * seperti bukti_pembayaran dan ukuran_jersey yang tidak pernah ada di tabel
 * tamus, lalu halamannya gagal dirender sama sekali. Tes ini mengunci bahwa
 * yang dikirim ke halaman itu hanya kolom yang memang dimiliki tamu.
 */
class DetailTamuTest extends TestCase
{
    use RefreshDatabase;

    private Acara $acara;

    protected function setUp(): void
    {
        parent::setUp();

        $this->acara = Acara::where('aktif', true)->firstOrFail();
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function tamu(array $ubah = []): Tamu
    {
        return Tamu::create(array_merge([
            'acara_id' => $this->acara->id,
            'code' => 'KODEUJI1',
            'nama' => 'Dr. Uji Rinci',
            'lembaga' => 'Lembaga Uji',
            'jenis' => 'penerima',
            'kategori_penghargaan' => 'Innovation in Education',
            'sub_kategori' => 'Best Innovation in Testing',
            'pic' => 'Hainor',
            'jumlah_orang' => 2,
            'meja' => '7',
            'kursi' => '3, 4',
            'status' => 'belum',
            'rsvp' => 'hadir',
        ], $ubah));
    }

    public function test_halaman_rincian_terbuka_dan_membawa_kolom_tamu(): void
    {
        $tamu = $this->tamu();

        $this->actingAs($this->admin())
            ->get(route('admin.tamu.show', $tamu->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Tamu/Show')
                ->where('tamu.nama', 'Dr. Uji Rinci')
                ->where('tamu.lembaga', 'Lembaga Uji')
                ->where('tamu.code', 'KODEUJI1')
                ->where('tamu.tempat_duduk', 'Meja 7 - Kursi 3, 4')
                ->where('tamu.kategori_penghargaan', 'Innovation in Education')
                ->where('tamu.rsvp', 'hadir')
                ->where('tamu.status', 'belum')
                ->has('qr')
                ->has('edisi'));
    }

    /**
     * Kolom milik aplikasi lain tidak boleh muncul lagi - itulah yang dulu
     * membuat halamannya kosong.
     */
    public function test_tidak_mengirim_kolom_milik_aplikasi_lain(): void
    {
        $tamu = $this->tamu();

        $this->actingAs($this->admin())
            ->get(route('admin.tamu.show', $tamu->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->missing('participant')
                ->missing('tamu.bukti_pembayaran')
                ->missing('tamu.ukuran_jersey')
                ->missing('tamu.golongan_darah'));
    }

    public function test_tamu_tanpa_tempat_duduk_tetap_terbuka(): void
    {
        $tamu = $this->tamu(['meja' => null, 'kursi' => null, 'jenis' => 'hadir']);

        $this->actingAs($this->admin())
            ->get(route('admin.tamu.show', $tamu->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('tamu.tempat_duduk', null)
                ->where('tamu.jenis', 'hadir'));
    }

    public function test_tamu_tanpa_kode_tidak_membuat_tautan_qr(): void
    {
        $tamu = $this->tamu(['code' => null]);

        $this->actingAs($this->admin())
            ->get(route('admin.tamu.show', $tamu->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('qr', null));
    }

    public function test_tamu_belum_terkonfirmasi_tidak_punya_tanggal_rsvp(): void
    {
        $tamu = $this->tamu(['rsvp' => 'belum', 'rsvp_pada' => null]);

        $this->actingAs($this->admin())
            ->get(route('admin.tamu.show', $tamu->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('tamu.rsvp', 'belum')
                ->where('tamu.rsvp_pada', null));
    }
}

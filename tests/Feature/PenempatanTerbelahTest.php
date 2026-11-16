<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Satu undangan boleh terbelah ke beberapa meja: kuota 2 bisa diisi satu orang
 * di meja 1 dan satu lagi di meja 2.
 *
 * Yang paling penting di berkas ini bukan pembelahannya, melainkan dua janji
 * yang mengelilinginya. Pertama, penempatan yang tidak terbelah harus tetap
 * tersimpan persis seperti sebelum fitur ini ada - undangannya sudah terkirim
 * dengan nomor itu. Kedua, kursi yang dipakai separuh rombongan harus tetap
 * terbaca terpakai oleh seluruh sisa sistem; kursi yang terlewat adalah kursi
 * yang nanti dipesan dua kali.
 */
class PenempatanTerbelahTest extends TestCase
{
    use RefreshDatabase;

    private Acara $acara;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->acara = Acara::where('aktif', true)->firstOrFail();
        $this->acara->update(['jumlah_meja' => 3, 'kursi_per_meja' => 6]);
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

    private function dudukkan(Tamu $tamu, int $meja, ?int $jumlah = null)
    {
        return $this->actingAs($this->admin)->post(route('admin.penempatan.tempatkan'), array_filter([
            'tamu_id' => $tamu->id,
            'meja' => $meja,
            'jumlah' => $jumlah,
        ]));
    }

    public function test_separuh_rombongan_bisa_duduk_di_meja_lain(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 1)->assertRedirect();
        $this->dudukkan($tamu, 2, 1)->assertRedirect();

        $tamu->refresh();

        $this->assertSame('1, 2', $tamu->meja);
        $this->assertSame('1:1, 2:1', $tamu->kursi);
        $this->assertSame(0, $tamu->sisaKursi());
    }

    /**
     * Penempatan yang tidak terbelah tidak boleh ikut berubah bentuk. Baris
     * lama ditulis "1" dan "1, 2", dan harus tetap begitu.
     */
    public function test_satu_meja_tetap_tersimpan_dalam_bentuk_lama(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 1, 1);

        $tamu->refresh();

        $this->assertSame('1', $tamu->meja);
        $this->assertSame('1, 2', $tamu->kursi);
    }

    public function test_tamu_yang_baru_sebagian_duduk_tetap_di_daftar_belum(): void
    {
        $tamu = $this->tamu(3, 'Bertiga');

        $this->dudukkan($tamu, 1, 1);

        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('belum.0.nama', 'Bertiga')
                ->where('belum.0.sudah', 1)
                ->where('belum.0.sisa', 2));
    }

    public function test_tamu_yang_sudah_penuh_hilang_dari_daftar_belum(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 2, 1);

        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('belum', 0));
    }

    public function test_papan_menampilkan_tamu_yang_sama_di_dua_meja(): void
    {
        $tamu = $this->tamu(2, 'Terbelah');

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 3, 1);

        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('mejas.0.terisi', 1)
                ->where('mejas.0.kursi.0.tamu.nama', 'Terbelah')
                ->where('mejas.0.tamus.0.terbelah', true)
                ->where('mejas.1.terisi', 0)
                ->where('mejas.2.terisi', 1)
                ->where('mejas.2.kursi.0.tamu.nama', 'Terbelah'));
    }

    /**
     * Inti keamanannya: kursi 1 meja 1 dipakai separuh rombongan yang kolom
     * mejanya berbunyi "1, 2". Pencocokan teks utuh akan melewatkannya, dan
     * tamu berikutnya akan ditawari kursi yang sudah ada orangnya.
     */
    public function test_kursi_milik_tamu_terbelah_tidak_ditawarkan_lagi(): void
    {
        $terbelah = $this->tamu(2, 'Terbelah');

        $this->dudukkan($terbelah, 1, 1);
        $this->dudukkan($terbelah, 2, 1);

        $berikutnya = $this->tamu(2, 'Berikutnya');
        $this->dudukkan($berikutnya, 1);

        $this->assertSame('2, 3', $berikutnya->fresh()->kursi);
    }

    public function test_menempatkan_melebihi_kuota_ditolak(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 2);
        $this->dudukkan($tamu, 2, 1)->assertSessionHasErrors('meja');

        $this->assertSame('1', $tamu->fresh()->meja);
    }

    /**
     * Meminta lebih banyak daripada sisanya tidak menggelembungkan jatahnya -
     * ia dijepit ke sisa, bukan ditolak.
     */
    public function test_jumlah_melebihi_sisa_dijepit(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 2, 9)->assertSessionHasNoErrors();

        $this->assertSame('1:1, 2:1', $tamu->fresh()->kursi);
    }

    public function test_tanpa_jumlah_seluruh_sisanya_yang_ditempatkan(): void
    {
        $tamu = $this->tamu(3);

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 2);

        $tamu->refresh();

        $this->assertSame('1:1, 2:1, 2:2', $tamu->kursi);
        $this->assertSame(0, $tamu->sisaKursi());
    }

    public function test_keluarkan_dari_satu_meja_menyisakan_meja_lainnya(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 3, 1);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.keluarkan', $tamu), ['meja' => 3])
            ->assertRedirect();

        $tamu->refresh();

        // Tinggal satu meja, jadi bentuknya kembali ke bentuk lama.
        $this->assertSame('1', $tamu->meja);
        $this->assertSame('1', $tamu->kursi);
        $this->assertSame(1, $tamu->sisaKursi());
    }

    public function test_keluarkan_tanpa_meja_mengosongkan_semuanya(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 3, 1);

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.keluarkan', $tamu))
            ->assertRedirect();

        $tamu->refresh();

        $this->assertNull($tamu->meja);
        $this->assertNull($tamu->kursi);
    }

    public function test_tempat_duduk_terbaca_untuk_penempatan_terbelah(): void
    {
        $tamu = $this->tamu(3);

        $this->dudukkan($tamu, 1, 2);
        $this->dudukkan($tamu, 3, 1);

        $this->assertSame('Meja 1 - Kursi 1, 2; Meja 3 - Kursi 1', $tamu->fresh()->tempatDuduk());
    }

    public function test_tempat_duduk_satu_meja_tidak_berubah_bunyinya(): void
    {
        $tamu = $this->tamu(2);
        $tamu->update(['meja' => '5', 'kursi' => '3, 4']);

        $this->assertSame('Meja 5 - Kursi 3, 4', $tamu->tempatDuduk());
    }

    /**
     * Meja yang hanya ditempati separuh rombongan tetap harus mengunci jumlah
     * meja - kalau tidak, admin bisa memotong denah di bawah tamu yang sudah
     * terlanjur dikirimi nomornya.
     */
    public function test_meja_milik_tamu_terbelah_ikut_mengunci_jumlah_meja(): void
    {
        $tamu = $this->tamu(2);

        $this->dudukkan($tamu, 1, 1);
        $this->dudukkan($tamu, 3, 1);

        $this->assertSame(3, $this->acara->fresh()->mejaTerpakai());

        $this->actingAs($this->admin)
            ->put(route('admin.acara.update', $this->acara->id), [
                'nama' => $this->acara->nama,
                'mulai' => $this->acara->mulai->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'jumlah_meja' => 2,
                'kursi_per_meja' => 6,
            ])
            ->assertSessionHasErrors('jumlah_meja');
    }

    /**
     * Admin masih boleh mengetik tempat duduk sendiri lewat formulir tamu.
     * Bentrokannya harus dinilai per meja - kursi 1 di meja 1 bukan kursi 1
     * di meja 2.
     */
    public function test_ketikan_manual_yang_bentrok_di_satu_meja_ditolak(): void
    {
        $penghuni = $this->tamu(1, 'Lebih Dulu');
        $this->dudukkan($penghuni, 1, 1);

        $tamu = $this->tamu(2, 'Mengetik');

        $this->actingAs($this->admin)
            ->put(route('admin.tamu.update', $tamu), [
                'nama' => 'Mengetik',
                'jenis' => 'hadir',
                'jumlah_orang' => 2,
                'meja' => '1, 2',
                'kursi' => '1:1, 2:1',
            ])
            ->assertSessionHasErrors('kursi');
    }

    public function test_ketikan_manual_terbelah_yang_tidak_bentrok_diterima(): void
    {
        $penghuni = $this->tamu(1, 'Lebih Dulu');
        $this->dudukkan($penghuni, 1, 1);

        $tamu = $this->tamu(2, 'Mengetik');

        $this->actingAs($this->admin)
            ->put(route('admin.tamu.update', $tamu), [
                'nama' => 'Mengetik',
                'jenis' => 'hadir',
                'jumlah_orang' => 2,
                'meja' => '1, 2',
                'kursi' => '1:2, 2:1',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('1, 2', $tamu->fresh()->meja);
    }

    /**
     * Nama meja boleh huruf dan beda besar-kecilnya, mis. "VIP 1" dan "vip 1".
     */
    public function test_meja_bernama_huruf_tetap_satu_meja(): void
    {
        $tamu = $this->tamu(2);
        $tamu->update(['meja' => 'VIP 1, vip 1', 'kursi' => 'VIP 1:1, vip 1:2']);

        $this->assertSame(['VIP 1'], $tamu->mejaDitempati());
        $this->assertSame(['1', '2'], $tamu->kursiDi('vip 1'));
        $this->assertSame(0, $tamu->sisaKursi());
    }
}

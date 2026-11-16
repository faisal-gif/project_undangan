<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Kursi tambahan: sisa undangan yang tidak pas membagi habis.
 *
 * 27 meja berisi 6 menghasilkan 162 kursi untuk 163 undangan. Kursi ke-163
 * disisipkan di meja terakhir, bukan dengan menaikkan isi semua meja jadi 7
 * (yang menambah 27 kursi sekaligus) atau mengarang meja ke-28.
 *
 * Konsekuensinya kapasitas meja tidak lagi seragam, dan itulah yang paling
 * perlu dijaga di sini: penjaga penyusutan tidak boleh lagi menilai dari satu
 * nomor kursi tertinggi, sebab kursi 7 yang sah di meja terakhir akan memaksa
 * seluruh meja berisi tujuh.
 */
class KursiTambahanTest extends TestCase
{
    use RefreshDatabase;

    private Acara $acara;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->acara = Acara::where('aktif', true)->firstOrFail();
        $this->acara->update(['jumlah_meja' => 3, 'kursi_per_meja' => 6, 'kursi_tambahan' => 0]);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    private function tamu(int $orang, string $nama = 'Tamu Uji'): Tamu
    {
        return Tamu::create([
            'acara_id' => $this->acara->id,
            'nama' => $nama,
            'code' => strtoupper(fake()->bothify('????####')),
            'jumlah_orang' => $orang,
            'status' => 'belum',
        ]);
    }

    private function simpan(array $ubahan)
    {
        return $this->actingAs($this->admin)
            ->put(route('admin.acara.update', $this->acara->id), $ubahan + [
                'nama' => $this->acara->nama,
                'mulai' => $this->acara->mulai->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
            ]);
    }

    /**
     * Angka sungguhan yang memunculkan kebutuhan ini.
     */
    public function test_satu_kursi_tambahan_jatuh_di_meja_terakhir(): void
    {
        $this->acara->update(['jumlah_meja' => 27, 'kursi_per_meja' => 6, 'kursi_tambahan' => 1]);
        $segar = $this->acara->fresh();

        $this->assertSame(163, $segar->jumlahKursi());
        $this->assertSame(7, $segar->kursiDiMeja(27));
        $this->assertSame(6, $segar->kursiDiMeja(26));
        $this->assertSame(6, $segar->kursiDiMeja(1));
        $this->assertSame([27], $segar->mejaBerkursiTambahan());
    }

    public function test_tanpa_tambahan_semua_meja_tetap_sama(): void
    {
        $this->assertSame(18, $this->acara->jumlahKursi());

        foreach ([1, 2, 3] as $meja) {
            $this->assertSame(6, $this->acara->kursiDiMeja($meja));
        }

        $this->assertSame([], $this->acara->mejaBerkursiTambahan());
    }

    /**
     * Beberapa kursi tambahan diisi dari belakang, satu per meja.
     */
    public function test_tambahan_diisi_mundur_dari_meja_terakhir(): void
    {
        $this->acara->update(['kursi_tambahan' => 2]);
        $segar = $this->acara->fresh();

        $this->assertSame(20, $segar->jumlahKursi());
        $this->assertSame(6, $segar->kursiDiMeja(1));
        $this->assertSame(7, $segar->kursiDiMeja(2));
        $this->assertSame(7, $segar->kursiDiMeja(3));
        $this->assertSame([2, 3], $segar->mejaBerkursiTambahan());
    }

    /**
     * Tambahan yang melebihi jumlah meja memberi satu putaran penuh lebih
     * dulu, lalu sisanya kembali diisi dari belakang.
     */
    public function test_tambahan_lebih_banyak_dari_meja_berputar(): void
    {
        $this->acara->update(['kursi_tambahan' => 4]);
        $segar = $this->acara->fresh();

        $this->assertSame(22, $segar->jumlahKursi());
        $this->assertSame(7, $segar->kursiDiMeja(1));
        $this->assertSame(7, $segar->kursiDiMeja(2));
        $this->assertSame(8, $segar->kursiDiMeja(3));
    }

    public function test_meja_di_luar_jangkauan_tetap_nol(): void
    {
        $this->acara->update(['kursi_tambahan' => 2]);
        $segar = $this->acara->fresh();

        $this->assertSame(0, $segar->kursiDiMeja(0));
        $this->assertSame(0, $segar->kursiDiMeja(4));
    }

    public function test_kursi_tambahan_bisa_diatur_lewat_formulir(): void
    {
        $this->simpan(['jumlah_meja' => 27, 'kursi_per_meja' => 6, 'kursi_tambahan' => 1])
            ->assertSessionHasNoErrors();

        $this->assertSame(163, $this->acara->fresh()->jumlahKursi());
    }

    public function test_formulir_membawa_kursi_tambahan(): void
    {
        $this->acara->update(['kursi_tambahan' => 1]);

        $this->actingAs($this->admin)
            ->get(route('admin.acara.edit'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Acara/Edit')
                ->where('acara.kursi_tambahan', 1));
    }

    public function test_kursi_tambahan_benar_benar_bisa_diduduki(): void
    {
        $this->acara->update(['kursi_tambahan' => 1]);

        $tamu = $this->tamu(7, 'Bertujuh');

        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 3])
            ->assertSessionHasNoErrors();

        $this->assertSame('1, 2, 3, 4, 5, 6, 7', $tamu->fresh()->kursi);
    }

    public function test_meja_tanpa_tambahan_tetap_menolak_kursi_ketujuh(): void
    {
        $this->acara->update(['kursi_tambahan' => 1]);

        $tamu = $this->tamu(7, 'Bertujuh');

        // Meja 1 tidak kebagian tambahan, jadi tetap berisi enam.
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 1])
            ->assertSessionHasErrors('meja');
    }

    public function test_denah_menggambar_meja_terakhir_dengan_kursi_lebih(): void
    {
        $this->acara->update(['kursi_tambahan' => 1]);

        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.denah'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('acara.jumlah_kursi', 19)
                ->where('mejas.0.kapasitas', 6)
                ->where('mejas.2.kapasitas', 7));
    }

    /**
     * Inti perubahan penjaganya. Kursi 7 cuma ada di meja terakhir, jadi ia
     * tidak boleh memaksa kursi per meja ikut naik jadi 7. Sebelum penjaganya
     * diperiksa per kursi, menyimpan ulang nilai yang sama pun akan ditolak.
     */
    public function test_kursi_ketujuh_di_meja_terakhir_tidak_mengunci_kursi_per_meja(): void
    {
        $this->acara->update(['kursi_tambahan' => 1]);

        $tamu = $this->tamu(7, 'Bertujuh');
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 3]);

        $this->assertSame(7, $this->acara->fresh()->kursiTerpakai());

        $this->simpan(['jumlah_meja' => 3, 'kursi_per_meja' => 6, 'kursi_tambahan' => 1])
            ->assertSessionHasNoErrors();
    }

    public function test_menghapus_kursi_tambahan_yang_sedang_diduduki_ditolak(): void
    {
        $this->acara->update(['kursi_tambahan' => 1]);

        $tamu = $this->tamu(7, 'Bertujuh');
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 3]);

        $this->simpan(['jumlah_meja' => 3, 'kursi_per_meja' => 6, 'kursi_tambahan' => 0])
            ->assertSessionHasErrors('kursi_per_meja');

        $this->assertSame(1, (int) $this->acara->fresh()->kursi_tambahan);
    }

    /**
     * Penjaganya menilai kapasitas meja yang diusulkan, bukan satu angka
     * global - jadi menambah tambahan boleh walaupun kursi per mejanya
     * dipangkas, selama tiap kursi yang sudah diduduki tetap ada.
     */
    public function test_penjaga_menilai_kapasitas_tiap_meja_bukan_angka_global(): void
    {
        $this->acara->update(['kursi_tambahan' => 2]);

        $tamu = $this->tamu(7, 'Bertujuh');
        $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => 3]);

        $this->assertSame(7, $this->acara->fresh()->kursiDiMeja(3));

        // Kursi per meja turun ke 4, tapi 9 tambahan memberi meja 3
        // 4 + 3 putaran = 7 kursi - tepat memuat tamunya, jadi diterima.
        $this->simpan(['jumlah_meja' => 3, 'kursi_per_meja' => 4, 'kursi_tambahan' => 9])
            ->assertSessionHasNoErrors();

        // Satu tambahan lebih sedikit membuat meja 3 berisi 4 + 2 + 1 = 7
        // juga - masih pas.
        $this->simpan(['jumlah_meja' => 3, 'kursi_per_meja' => 4, 'kursi_tambahan' => 7])
            ->assertSessionHasNoErrors();

        // Tapi tanpa tambahan sama sekali ia tinggal 4, dan kursi 5 sampai 7
        // kehilangan tempatnya.
        $this->simpan(['jumlah_meja' => 3, 'kursi_per_meja' => 4, 'kursi_tambahan' => 0])
            ->assertSessionHasErrors('kursi_per_meja');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Jumlah kursi tiap meja boleh digeser sendiri-sendiri, naik maupun turun.
 *
 * Jumlah undangan jarang pas membagi habis - 27 meja berisi 6 menghasilkan
 * 162 kursi untuk 163 undangan - dan ruangan sungguhan tidak seragam: meja di
 * dekat pintu cuma muat lima, meja di pojok muat delapan. Jadi kursi bisa
 * dicabut di satu meja lalu dipasang di meja lain, dan begitu keduanya saling
 * meniadakan jumlah kursi seluruhnya kembali seperti semula.
 *
 * Konsekuensinya kapasitas meja tidak seragam, dan itulah yang paling perlu
 * dijaga: penjaga penyusutan tidak boleh menilai dari satu nomor kursi
 * tertinggi, sebab kursi 7 yang sah di satu meja akan memaksa seluruh meja
 * berisi tujuh.
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
        $this->acara->update(['jumlah_meja' => 3, 'kursi_per_meja' => 6, 'kursi_tambahan_meja' => null]);
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

    private function atur(int $meja, int $jumlah)
    {
        return $this->actingAs($this->admin)
            ->post(route('admin.penempatan.kursi-tambahan'), ['meja' => $meja, 'jumlah' => $jumlah]);
    }

    private function dudukkan(Tamu $tamu, int $meja)
    {
        return $this->actingAs($this->admin)
            ->post(route('admin.penempatan.tempatkan'), ['tamu_id' => $tamu->id, 'meja' => $meja]);
    }

    private function simpanAcara(array $ubahan)
    {
        return $this->actingAs($this->admin)
            ->put(route('admin.acara.update', $this->acara->id), $ubahan + [
                'nama' => $this->acara->nama,
                'mulai' => $this->acara->mulai->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
            ]);
    }

    /**
     * Angka sungguhan yang memunculkan kebutuhan ini - dan mejanya dipilih,
     * bukan selalu yang terakhir.
     */
    public function test_satu_kursi_disisipkan_di_meja_pilihan_admin(): void
    {
        $this->acara->update(['jumlah_meja' => 27, 'kursi_tambahan_meja' => ['12' => 1]]);
        $segar = $this->acara->fresh();

        $this->assertSame(163, $segar->jumlahKursi());
        $this->assertSame(7, $segar->kursiDiMeja(12));
        $this->assertSame(6, $segar->kursiDiMeja(27));
        $this->assertSame(6, $segar->kursiDiMeja(1));
        $this->assertSame([['meja' => 12, 'kursi' => 7]], $segar->mejaKhusus());
    }

    public function test_tanpa_ubahan_semua_meja_tetap_sama(): void
    {
        $this->assertSame(18, $this->acara->jumlahKursi());

        foreach ([1, 2, 3] as $meja) {
            $this->assertSame(6, $this->acara->kursiDiMeja($meja));
        }

        $this->assertSame([], $this->acara->mejaKhusus());
        $this->assertSame(0, $this->acara->selisihKursi());
    }

    public function test_beberapa_meja_boleh_diubah_sekaligus(): void
    {
        $this->acara->update(['kursi_tambahan_meja' => ['1' => 2, '3' => 1]]);
        $segar = $this->acara->fresh();

        $this->assertSame(21, $segar->jumlahKursi());
        $this->assertSame(8, $segar->kursiDiMeja(1));
        $this->assertSame(6, $segar->kursiDiMeja(2));
        $this->assertSame(7, $segar->kursiDiMeja(3));
        $this->assertSame(3, $segar->selisihKursi());
    }

    /**
     * Inti permintaannya: kursi dicabut di satu meja, dipasang di meja lain,
     * dan jumlah kursi seluruhnya tidak berubah.
     */
    public function test_kursi_dicabut_di_satu_meja_dan_dipasang_di_meja_lain(): void
    {
        $this->atur(1, -2)->assertSessionHasNoErrors();
        $this->atur(3, 2)->assertSessionHasNoErrors();

        $segar = $this->acara->fresh();

        $this->assertSame(4, $segar->kursiDiMeja(1));
        $this->assertSame(6, $segar->kursiDiMeja(2));
        $this->assertSame(8, $segar->kursiDiMeja(3));

        // 4 + 6 + 8 = 18, sama persis dengan 3 x 6 sebelum keduanya digeser.
        $this->assertSame(18, $segar->jumlahKursi());
        $this->assertSame(0, $segar->selisihKursi());
    }

    public function test_mengurangi_kursi_mengecilkan_jumlah_kursi(): void
    {
        $this->atur(2, -3)->assertSessionHasNoErrors();

        $segar = $this->acara->fresh();

        $this->assertSame(3, $segar->kursiDiMeja(2));
        $this->assertSame(15, $segar->jumlahKursi());
        $this->assertSame(-3, $segar->selisihKursi());
        $this->assertSame([['meja' => 2, 'kursi' => 3]], $segar->mejaKhusus());
    }

    /**
     * Meja boleh dikosongkan sama sekali - meja hadiah, meja panitia - tapi
     * tidak boleh berisi kursi berjumlah minus.
     */
    public function test_kursi_meja_dijepit_di_nol(): void
    {
        $this->atur(2, -20)->assertSessionHasNoErrors();

        $segar = $this->acara->fresh();

        $this->assertSame(0, $segar->kursiDiMeja(2));
        $this->assertSame(12, $segar->jumlahKursi());
    }

    /**
     * Jumlah meja boleh dikecilkan setelahnya. Ubahan di meja yang sudah
     * tidak ada harus berhenti dihitung sendiri - kalau tidak, jumlah kursi
     * menghitung kursi di meja yang tidak digambar di denah mana pun.
     */
    public function test_ubahan_di_meja_yang_sudah_tidak_ada_diabaikan(): void
    {
        $this->acara->update(['kursi_tambahan_meja' => ['2' => 1, '9' => 4]]);
        $segar = $this->acara->fresh();

        $this->assertSame(19, $segar->jumlahKursi());
        $this->assertSame([['meja' => 2, 'kursi' => 7]], $segar->mejaKhusus());
        $this->assertSame(0, $segar->kursiDiMeja(9));
    }

    public function test_meja_di_luar_jangkauan_tetap_nol(): void
    {
        $this->acara->update(['kursi_tambahan_meja' => ['3' => 2]]);
        $segar = $this->acara->fresh();

        $this->assertSame(0, $segar->kursiDiMeja(0));
        $this->assertSame(0, $segar->kursiDiMeja(4));
    }

    public function test_admin_bisa_menambah_kursi_di_satu_meja(): void
    {
        $this->atur(2, 1)->assertRedirect()->assertSessionHasNoErrors();

        $segar = $this->acara->fresh();

        $this->assertSame(7, $segar->kursiDiMeja(2));
        $this->assertSame(6, $segar->kursiDiMeja(1));
        $this->assertSame(19, $segar->jumlahKursi());
    }

    public function test_menyetel_ke_nol_mengembalikan_ke_isi_baku(): void
    {
        $this->atur(2, 2);
        $this->assertSame(8, $this->acara->fresh()->kursiDiMeja(2));

        $this->atur(2, 0)->assertSessionHasNoErrors();

        $segar = $this->acara->fresh();

        $this->assertSame(6, $segar->kursiDiMeja(2));
        $this->assertSame([], $segar->mejaKhusus());
        $this->assertNull($segar->kursi_tambahan_meja);
    }

    public function test_mengubah_kursi_di_meja_asing_ditolak(): void
    {
        $this->atur(9, 1)->assertSessionHasErrors('meja');

        $this->assertSame([], $this->acara->fresh()->mejaKhusus());
    }

    public function test_papan_membawa_ubahan_tiap_meja(): void
    {
        $this->atur(1, -1);
        $this->atur(3, 1);

        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('acara.jumlah_kursi', 18)
                ->where('mejas.0.ubahan', -1)
                ->where('mejas.0.kapasitas', 5)
                ->has('mejas.0.kursi', 5)
                ->where('mejas.1.ubahan', 0)
                ->where('mejas.2.ubahan', 1)
                ->where('mejas.2.kapasitas', 7)
                ->has('mejas.2.kursi', 7));
    }

    public function test_kursi_tambahan_benar_benar_bisa_diduduki(): void
    {
        $this->atur(3, 1);

        $tamu = $this->tamu(7, 'Bertujuh');
        $this->dudukkan($tamu, 3)->assertSessionHasNoErrors();

        $this->assertSame('1, 2, 3, 4, 5, 6, 7', $tamu->fresh()->kursi);
    }

    public function test_meja_tanpa_tambahan_tetap_menolak_kursi_ketujuh(): void
    {
        $this->atur(3, 1);

        $tamu = $this->tamu(7, 'Bertujuh');

        $this->dudukkan($tamu, 1)->assertSessionHasErrors('meja');
    }

    public function test_meja_yang_dikurangi_menolak_rombongan_yang_tidak_muat(): void
    {
        $this->atur(1, -2);

        $tamu = $this->tamu(5, 'Berlima');

        $this->dudukkan($tamu, 1)->assertSessionHasErrors('meja');
        $this->assertNull($tamu->fresh()->meja);
    }

    /**
     * Mencabut kursi yang sedang diduduki membuang tempat duduk yang nomornya
     * sudah dikirim di undangan.
     */
    public function test_mencabut_kursi_yang_diduduki_ditolak(): void
    {
        $this->atur(3, 1);

        $tamu = $this->tamu(7, 'Bertujuh');
        $this->dudukkan($tamu, 3);

        $this->atur(3, 0)->assertSessionHasErrors('meja');

        $this->assertSame(7, $this->acara->fresh()->kursiDiMeja(3));
    }

    public function test_mengurangi_di_bawah_kursi_terpakai_ditolak(): void
    {
        $tamu = $this->tamu(5, 'Berlima');
        $this->dudukkan($tamu, 2);

        $this->atur(2, -2)->assertSessionHasErrors('meja');

        $this->assertSame(6, $this->acara->fresh()->kursiDiMeja(2));
    }

    public function test_mengurangi_sampai_batas_yang_terpakai_masih_boleh(): void
    {
        $tamu = $this->tamu(4, 'Berempat');
        $this->dudukkan($tamu, 2);

        // Kursi tertinggi yang dipakai 4, dan 6 - 2 = 4 - masih pas.
        $this->atur(2, -2)->assertSessionHasNoErrors();

        $this->assertSame(4, $this->acara->fresh()->kursiDiMeja(2));
    }

    public function test_denah_menggambar_meja_sesuai_kursinya_masing_masing(): void
    {
        $this->atur(1, -1);
        $this->atur(3, 1);

        $this->actingAs($this->admin)
            ->get(route('admin.penempatan.denah'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('acara.jumlah_kursi', 18)
                ->where('mejas.0.kapasitas', 5)
                ->where('mejas.2.kapasitas', 7));
    }

    /**
     * Inti penjaga di formulir acara. Kursi 7 cuma ada di meja yang ditambahi,
     * jadi ia tidak boleh memaksa kursi per meja ikut naik jadi 7 - sebelum
     * penjaganya diperiksa per kursi, menyimpan ulang nilai yang sama pun
     * akan ditolak.
     */
    public function test_kursi_ketujuh_tidak_mengunci_kursi_per_meja(): void
    {
        $this->atur(3, 1);

        $tamu = $this->tamu(7, 'Bertujuh');
        $this->dudukkan($tamu, 3);

        $this->assertSame(7, $this->acara->fresh()->kursiTerpakai());

        $this->simpanAcara(['jumlah_meja' => 3, 'kursi_per_meja' => 6])
            ->assertSessionHasNoErrors();
    }

    public function test_formulir_acara_melaporkan_ubahan_tanpa_menyentuhnya(): void
    {
        $this->atur(1, 2);
        $this->atur(3, -1);

        $this->actingAs($this->admin)
            ->get(route('admin.acara.edit'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Acara/Edit')
                ->where('acara.selisih_kursi', 1)
                ->where('acara.meja_khusus', [
                    ['meja' => 1, 'kursi' => 8],
                    ['meja' => 3, 'kursi' => 5],
                ]));

        // Menyimpan formulir acara tidak boleh menyentuh jumlah kursi meja.
        $this->simpanAcara(['jumlah_meja' => 3, 'kursi_per_meja' => 6])
            ->assertSessionHasNoErrors();

        $this->assertSame(['1' => 2, '3' => -1], $this->acara->fresh()->ubahanKursiMeja());
    }

    public function test_tamu_umum_tidak_bisa_mengubah_kursi_meja(): void
    {
        $this->post(route('admin.penempatan.kursi-tambahan'), ['meja' => 1, 'jumlah' => 1])
            ->assertRedirect();

        $this->assertSame([], $this->acara->fresh()->mejaKhusus());
    }
}

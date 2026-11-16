<?php

namespace Tests\Feature;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Yang diketik admin adalah jumlah MEJA; jumlah kursi dihitung dari situ.
 *
 * Bagian terpenting di berkas ini bukan hitungannya, melainkan penjaganya:
 * mengecilkan tata letak akan membuang tempat duduk yang nomornya sudah
 * terlanjur dikirim di undangan. Tamunya tidak terhapus, tapi kursinya jadi
 * di luar denah - hilang dari papan penempatan tanpa peringatan apa pun.
 */
class JumlahMejaAcaraTest extends TestCase
{
    use RefreshDatabase;

    private Acara $acara;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->acara = Acara::where('aktif', true)->firstOrFail();
        $this->acara->update(['jumlah_meja' => 10, 'kursi_per_meja' => 6]);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function duduk(string $meja, string $kursi): Tamu
    {
        return Tamu::create([
            'acara_id' => $this->acara->id,
            'nama' => 'Tamu di meja '.$meja,
            'code' => strtoupper(fake()->bothify('????####')),
            'jumlah_orang' => 1,
            'meja' => $meja,
            'kursi' => $kursi,
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

    public function test_jumlah_kursi_adalah_hasil_kali_meja_dan_isinya(): void
    {
        $this->assertSame(10, $this->acara->jumlahMeja());
        $this->assertSame(60, $this->acara->jumlahKursi());
        $this->assertSame(6, $this->acara->kursiDiMeja(10));
        $this->assertSame(0, $this->acara->kursiDiMeja(11));
    }

    public function test_semua_meja_berisi_sama_banyak(): void
    {
        $this->acara->update(['jumlah_meja' => 3, 'kursi_per_meja' => 4]);
        $segar = $this->acara->fresh();

        $this->assertSame(12, $segar->jumlahKursi());

        foreach ([1, 2, 3] as $meja) {
            $this->assertSame(4, $segar->kursiDiMeja($meja));
        }
    }

    public function test_jumlah_meja_bisa_diubah_lewat_formulir(): void
    {
        $this->simpan(['jumlah_meja' => 18, 'kursi_per_meja' => 8])
            ->assertRedirect();

        $segar = $this->acara->fresh();

        $this->assertSame(18, $segar->jumlahMeja());
        $this->assertSame(144, $segar->jumlahKursi());
    }

    public function test_menambah_meja_selalu_boleh(): void
    {
        $this->duduk('10', '6');

        $this->simpan(['jumlah_meja' => 20, 'kursi_per_meja' => 6])
            ->assertSessionHasNoErrors();

        $this->assertSame(20, $this->acara->fresh()->jumlahMeja());
    }

    public function test_mengurangi_meja_di_bawah_yang_terpakai_ditolak(): void
    {
        $this->duduk('9', '1, 2');

        $this->simpan(['jumlah_meja' => 5, 'kursi_per_meja' => 6])
            ->assertSessionHasErrors('jumlah_meja');

        $this->assertSame(10, $this->acara->fresh()->jumlahMeja());
    }

    public function test_mengurangi_kursi_per_meja_di_bawah_yang_terpakai_ditolak(): void
    {
        $this->duduk('2', '5, 6');

        $this->simpan(['jumlah_meja' => 10, 'kursi_per_meja' => 4])
            ->assertSessionHasErrors('kursi_per_meja');

        $this->assertSame(6, $this->acara->fresh()->kursiPerMeja());
    }

    public function test_mengurangi_sampai_batas_yang_terpakai_masih_boleh(): void
    {
        $this->duduk('6', '1, 2');

        $this->simpan(['jumlah_meja' => 6, 'kursi_per_meja' => 2])
            ->assertSessionHasNoErrors();

        $segar = $this->acara->fresh();

        $this->assertSame(6, $segar->jumlahMeja());
        $this->assertSame(2, $segar->kursiPerMeja());
    }

    /**
     * Nomor meja boleh berupa huruf, mis. "VIP 2". Yang begitu memang di luar
     * denah bernomor, jadi tidak boleh ikut mengunci jumlah meja.
     */
    public function test_meja_bernama_huruf_tidak_mengunci_jumlah_meja(): void
    {
        $this->duduk('VIP 2', '1');

        $this->simpan(['jumlah_meja' => 3, 'kursi_per_meja' => 6])
            ->assertSessionHasNoErrors();

        $this->assertSame(3, $this->acara->fresh()->jumlahMeja());
    }

    public function test_tamu_tanpa_tempat_duduk_tidak_mengunci_apa_pun(): void
    {
        Tamu::create([
            'acara_id' => $this->acara->id,
            'nama' => 'Belum Duduk',
            'code' => 'BELUMDUD',
            'jumlah_orang' => 2,
            'status' => 'belum',
        ]);

        $this->simpan(['jumlah_meja' => 1, 'kursi_per_meja' => 1])
            ->assertSessionHasNoErrors();

        $this->assertSame(1, $this->acara->fresh()->jumlahMeja());
    }

    public function test_batas_terpakai_dikirim_ke_formulir(): void
    {
        $this->duduk('7', '3, 4');

        $this->actingAs($this->admin)
            ->get(route('admin.acara.edit'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Acara/Edit')
                ->where('acara.jumlah_meja', 10)
                ->where('acara.meja_terpakai', 7)
                ->where('acara.kursi_terpakai', 4));
    }

    public function test_edisi_baru_tidak_terkunci_oleh_tamu_edisi_lain(): void
    {
        $this->duduk('10', '6');

        $this->actingAs($this->admin)
            ->post(route('admin.acara.store'), [
                'nama' => 'Anugerah TIMES Indonesia',
                'mulai' => '2027-11-27T19:00',
                'jumlah_meja' => 2,
                'kursi_per_meja' => 4,
            ])
            ->assertSessionHasNoErrors();

        $baru = Acara::where('aktif', false)->latest('id')->firstOrFail();

        $this->assertSame(2, $baru->jumlahMeja());
        $this->assertSame(8, $baru->jumlahKursi());
    }
}

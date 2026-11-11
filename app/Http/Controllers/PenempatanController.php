<?php

namespace App\Http\Controllers;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Penempatan tamu ke meja dan kursi.
 *
 * Meja tidak punya tabel sendiri: nomornya 1..N hasil bagi jumlah kursi dengan
 * isi per meja, dan siapa menempati apa sudah tercatat di kolom meja/kursi
 * milik tamu. Jadi mengubah tata letak di pengaturan acara langsung mengubah
 * papan ini, tanpa perlu membuat ulang baris meja mana pun.
 */
class PenempatanController extends Controller
{
    public function index()
    {
        $acara = Acara::aktif();

        if (! $acara) {
            return Inertia::render('Admin/Penempatan/Index', [
                'acara' => null,
                'mejas' => [],
                'belum' => [],
            ]);
        }

        $tamus = $acara->tamus()->orderBy('nama')->get();

        return Inertia::render('Admin/Penempatan/Index', [
            'acara' => [
                'label' => $acara->label(),
                'jumlah_kursi' => (int) $acara->jumlah_kursi,
                'kursi_per_meja' => $acara->kursiPerMeja(),
                'jumlah_meja' => $acara->jumlahMeja(),
            ],
            'mejas' => $this->papan($acara, $tamus),
            'belum' => $tamus->filter(fn (Tamu $t) => blank($t->meja))
                ->map(fn (Tamu $t) => [
                    'id' => $t->id,
                    'nama' => $t->nama,
                    'lembaga' => $t->lembaga,
                    'jumlah_orang' => (int) ($t->jumlah_orang ?: 1),
                ])->values(),
        ]);
    }

    /**
     * Denah ruangan: meja bundar dengan kursi mengelilinginya.
     *
     * Memakai papan() yang sama dengan halaman penempatan - satu sumber, jadi
     * denah tidak pernah menampilkan susunan yang berbeda dari daftarnya.
     */
    public function denah()
    {
        $acara = Acara::aktif();

        if (! $acara) {
            return Inertia::render('Admin/Penempatan/Denah', ['acara' => null, 'mejas' => []]);
        }

        return Inertia::render('Admin/Penempatan/Denah', [
            'acara' => [
                'label' => $acara->label(),
                'tempat' => $acara->tempat,
                'jumlah_kursi' => (int) $acara->jumlah_kursi,
                'kursi_per_meja' => $acara->kursiPerMeja(),
                'jumlah_meja' => $acara->jumlahMeja(),
            ],
            'mejas' => $this->papan($acara, $acara->tamus()->orderBy('nama')->get()),
            'letak' => $acara->letakMeja(),
            'kolom' => $acara->kolomGrid(),
            'baris' => $acara->barisGrid(),
            'meja_per_baris' => $acara->meja_per_baris,
            'orientasi' => $acara->orientasiDenah(),
            'rasio_lantai' => $acara->rasioLantai(),
        ]);
    }

    /**
     * Simpan letak meja hasil geseran admin.
     *
     * Hanya meja yang benar-benar ada yang disimpan, dan nilainya dijepit ke
     * 0-100: denah datang dari papan di layar, jadi tidak boleh dipercaya
     * membawa nomor meja atau koordinat di luar jangkauan.
     */
    public function simpanDenah(Request $request)
    {
        $acara = Acara::aktif();
        abort_unless($acara, 404);

        $data = $request->validate([
            'letak' => 'required|array',
            'letak.*.x' => 'required|numeric',
            'letak.*.y' => 'required|numeric',
        ]);

        $bersih = [];

        foreach ($data['letak'] as $nomor => $titik) {
            $n = (int) $nomor;

            if ($n < 1 || $n > $acara->jumlahMeja()) {
                continue;
            }

            $bersih[(string) $n] = [
                'x' => round(max(0, min(100, (float) $titik['x'])), 2),
                'y' => round(max(0, min(100, (float) $titik['y'])), 2),
            ];
        }

        $acara->update(['denah' => $bersih]);

        return back()->with('success', 'Susunan meja disimpan.');
    }

    /**
     * Ubah bentuk denah: orientasi ruangan dan berapa meja dalam satu baris.
     */
    public function aturGrid(Request $request)
    {
        $acara = Acara::aktif();
        abort_unless($acara, 404);

        $data = $request->validate([
            'meja_per_baris' => 'nullable|integer|min:1|max:50',
            'orientasi' => 'nullable|in:' . Acara::DENAH_LANDSCAPE . ',' . Acara::DENAH_POTRET,
        ]);

        // Letak geseran ikut dihapus. Koordinat yang disusun di ruangan
        // melebar tidak berarti apa-apa di ruangan memanjang, dan grid baru
        // tidak ada gunanya kalau meja tetap di tempat lamanya.
        // Hanya medan yang benar-benar dikirim yang diubah. Aturan "nullable"
        // tidak menambahkan kunci bila medannya tidak ada, jadi membacanya
        // langsung akan menabrak - dan menganggapnya null akan diam-diam
        // menghapus pengaturan yang tidak sedang disentuh.
        $ubahan = ['denah' => null];

        if (array_key_exists('meja_per_baris', $data)) {
            $ubahan['meja_per_baris'] = $data['meja_per_baris'] ?: null;
        }

        if (array_key_exists('orientasi', $data) && $data['orientasi']) {
            $ubahan['orientasi_denah'] = $data['orientasi'];
        }

        $acara->update($ubahan);

        return back()->with('success', 'Susunan denah diperbarui.');
    }

    /**
     * Kembalikan ke susunan grid otomatis.
     */
    public function resetDenah()
    {
        $acara = Acara::aktif();
        abort_unless($acara, 404);

        $acara->update(['denah' => null]);

        return back()->with('success', 'Susunan meja dikembalikan ke grid.');
    }

    /**
     * Susunan tiap meja beserta penghuninya, kursi demi kursi.
     */
    private function papan(Acara $acara, $tamus): array
    {
        $perMeja = $tamus->filter(fn (Tamu $t) => filled($t->meja))
            ->groupBy(fn (Tamu $t) => (string) $t->meja);

        $papan = [];

        for ($nomor = 1; $nomor <= $acara->jumlahMeja(); $nomor++) {
            $kapasitas = $acara->kursiDiMeja($nomor);
            $penghuni = $perMeja->get((string) $nomor, collect());

            // Kursi 1..kapasitas, masing-masing kosong atau berisi satu nama.
            $kursi = [];
            for ($k = 1; $k <= $kapasitas; $k++) {
                $kursi[$k] = null;
            }

            foreach ($penghuni as $tamu) {
                foreach ($tamu->nomorKursi() as $n) {
                    // array_key_exists, bukan isset: kursi kosong bernilai null
                    // dan isset() menganggap kunci bernilai null itu tidak ada,
                    // sehingga tidak satu pun kursi pernah terisi.
                    if (array_key_exists((int) $n, $kursi)) {
                        $kursi[(int) $n] = ['id' => $tamu->id, 'nama' => $tamu->nama];
                    }
                }
            }

            $papan[] = [
                'nomor' => $nomor,
                'kapasitas' => $kapasitas,
                'terisi' => count(array_filter($kursi)),
                'kursi' => array_map(
                    fn ($n) => ['nomor' => $n, 'tamu' => $kursi[$n]],
                    array_keys($kursi)
                ),
                'tamus' => $penghuni->map(fn (Tamu $t) => [
                    'id' => $t->id,
                    'nama' => $t->nama,
                    'kursi' => $t->kursi,
                ])->values(),
            ];
        }

        return $papan;
    }

    /**
     * Tempatkan satu tamu di meja tertentu.
     *
     * Nomor kursinya dipilihkan, bukan diketik: admin cukup menunjuk mejanya
     * dan sistem mengambil kursi kosong pertama sebanyak orang yang diundang.
     * Itu menghapus seluruh kelas kesalahan ketik sekaligus - kursi ganda,
     * kursi di luar kapasitas, jumlah kursi tak sesuai jumlah orang.
     */
    public function tempatkan(Request $request)
    {
        $data = $request->validate([
            'tamu_id' => 'required|exists:tamus,id',
            'meja' => 'required|integer|min:1',
        ]);

        $acara = Acara::aktif();
        abort_unless($acara, 404);

        $tamu = Tamu::findOrFail($data['tamu_id']);

        if ($tamu->acara_id !== $acara->id) {
            throw ValidationException::withMessages([
                'tamu_id' => 'Tamu ini bukan bagian dari ' . $acara->label() . '.',
            ]);
        }

        $meja = (int) $data['meja'];
        $kapasitas = $acara->kursiDiMeja($meja);

        if ($kapasitas < 1) {
            throw ValidationException::withMessages([
                'meja' => 'Meja ' . $meja . ' tidak ada. Acara ini punya ' . $acara->jumlahMeja() . ' meja.',
            ]);
        }

        $butuh = (int) ($tamu->jumlah_orang ?: 1);
        $kosong = $this->kursiKosong($acara, $meja, $tamu->id);

        if (count($kosong) < $butuh) {
            throw ValidationException::withMessages([
                'meja' => 'Meja ' . $meja . ' tinggal ' . count($kosong) . ' kursi, '
                    . 'sedangkan ' . $tamu->nama . ' butuh ' . $butuh . '.',
            ]);
        }

        $tamu->update([
            'meja' => (string) $meja,
            'kursi' => implode(', ', array_slice($kosong, 0, $butuh)),
        ]);

        return back()->with('success', $tamu->nama . ' ditempatkan di meja ' . $meja . '.');
    }

    public function keluarkan(Tamu $tamu)
    {
        $tamu->update(['meja' => null, 'kursi' => null]);

        return back()->with('success', $tamu->nama . ' dikeluarkan dari mejanya.');
    }

    /**
     * Nomor kursi yang masih kosong di satu meja, berurutan.
     */
    private function kursiKosong(Acara $acara, int $meja, ?int $kecuali = null): array
    {
        $terpakai = Tamu::where('acara_id', $acara->id)
            ->whereRaw('TRIM(meja) = ?', [(string) $meja])
            ->when($kecuali, fn ($q, $id) => $q->whereKeyNot($id))
            ->get()
            ->flatMap(fn (Tamu $t) => $t->nomorKursi())
            ->map(fn ($n) => (int) $n)
            ->all();

        return array_values(array_diff(range(1, $acara->kursiDiMeja($meja)), $terpakai));
    }
}

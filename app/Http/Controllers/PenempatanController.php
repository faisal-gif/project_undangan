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
                'jumlah_kursi' => $acara->jumlahKursi(),
                'kursi_per_meja' => $acara->kursiPerMeja(),
                'jumlah_meja' => $acara->jumlahMeja(),
            ],
            'mejas' => $this->papan($acara, $tamus),
            // Tamu yang baru sebagian duduk tetap di daftar ini sampai seluruh
            // kuotanya kebagian kursi - tanpa itu, orang keduanya hilang dari
            // layar begitu orang pertamanya ditempatkan.
            'belum' => $tamus->filter(fn (Tamu $t) => $t->sisaKursi() > 0)
                ->map(fn (Tamu $t) => [
                    'id' => $t->id,
                    'nama' => $t->nama,
                    'lembaga' => $t->lembaga,
                    'jumlah_orang' => (int) ($t->jumlah_orang ?: 1),
                    'sudah' => $t->kursiTerisi(),
                    'sisa' => $t->sisaKursi(),
                ])->values(),
        ]);
    }

    /**
     * Denah ruangan: meja bundar dengan kursi mengelilinginya.
     *
     * Memakai papan() yang sama dengan halaman penempatan - satu sumber, jadi
     * denah tidak pernah menampilkan susunan yang berbeda dari daftarnya.
     */
    public function denah(Request $request)
    {
        $acara = Acara::aktif();

        if (! $acara) {
            return Inertia::render('Admin/Penempatan/Denah', ['acara' => null, 'mejas' => []]);
        }

        return Inertia::render('Admin/Penempatan/Denah', [
            'acara' => [
                'label' => $acara->label(),
                'tempat' => $acara->tempat,
                'jumlah_kursi' => $acara->jumlahKursi(),
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
            // Mode monitor: tanpa menu, tanpa tombol, dan menyegarkan diri.
            'layar' => $request->boolean('layar'),
        ]);
    }

    /**
     * Lembar cetak: denah ruangan, daftar penghuni tiap meja, dan indeks nama.
     *
     * Ketiganya dari papan() yang sama dengan halaman penempatan dan denah -
     * satu sumber, jadi kertas yang dibawa panitia keliling ruangan tidak
     * pernah menyebut susunan yang berbeda dari layarnya.
     *
     * Indeks namanya disusun di sini, bukan di peramban: urutan abjad Indonesia
     * ikut aturan basis data yang sama dengan daftar tamu di tempat lain, dan
     * petugas penerima tamu mencari nama di situ - bukan nomor meja.
     */
    public function cetak()
    {
        $acara = Acara::aktif();

        if (! $acara) {
            return Inertia::render('Admin/Penempatan/Cetak', [
                'acara' => null,
                'mejas' => [],
                'indeks' => [],
            ]);
        }

        $tamus = $acara->tamus()->orderBy('nama')->get();

        return Inertia::render('Admin/Penempatan/Cetak', [
            'acara' => [
                'label' => $acara->label(),
                'nama' => $acara->nama,
                'tempat' => $acara->tempat,
                'waktu' => $acara->mulai?->timezone(Acara::ZONA)->format('d/m/Y H:i'),
                'jumlah_kursi' => $acara->jumlahKursi(),
                'jumlah_meja' => $acara->jumlahMeja(),
            ],
            'mejas' => $this->papan($acara, $tamus),
            'letak' => $acara->letakMeja(),
            'kolom' => $acara->kolomGrid(),
            'baris' => $acara->barisGrid(),
            'orientasi' => $acara->orientasiDenah(),
            'indeks' => $tamus->filter(fn (Tamu $t) => $t->kursiTerisi() > 0)
                ->map(fn (Tamu $t) => [
                    'id' => $t->id,
                    'nama' => $t->nama,
                    'lembaga' => $t->lembaga,
                    'tempat_duduk' => $this->tempatRingkas($t),
                ])->values(),
        ]);
    }

    /**
     * Tempat duduk sependek mungkin untuk indeks di kertas: "M12 K3,4".
     *
     * Bukan tempatDuduk() yang panjang itu. Indeksnya tiga kolom dan ratusan
     * baris; "Meja 12 - Kursi 3, 4" memaksa tiap baris jadi dua baris, dan
     * undangan yang terbelah ke dua meja jadi tiga. Kuncinya ditulis sekali
     * di kepala lembarnya.
     */
    private function tempatRingkas(Tamu $tamu): string
    {
        $bagian = [];

        foreach ($tamu->dudukPerMeja() as $meja => $nomor) {
            $bagian[] = 'M'.$meja.($nomor ? ' K'.implode(',', $nomor) : '');
        }

        return implode(' · ', $bagian);
    }

    /**
     * Atur berapa kursi tambahan di satu meja.
     *
     * Diatur dari sini, bukan dari formulir acara: yang tahu meja mana yang
     * masih muat kursi ketujuh adalah orang yang sedang melihat papan ini -
     * meja mana yang penuh, siapa yang masih berdiri - bukan orang yang
     * sedang mengisi tanggal dan tempat acara.
     */
    public function aturKursiTambahan(Request $request)
    {
        $data = $request->validate([
            'meja' => 'required|integer|min:1',
            'jumlah' => 'required|integer|min:0|max:20',
        ]);

        $acara = Acara::aktif();
        abort_unless($acara, 404);

        $meja = (int) $data['meja'];
        $jumlah = (int) $data['jumlah'];

        if ($meja > $acara->jumlahMeja()) {
            throw ValidationException::withMessages([
                'meja' => 'Meja '.$meja.' tidak ada. Acara ini punya '
                    .$acara->jumlahMeja().' meja.',
            ]);
        }

        // Mengurangi kursi tambahan membuang kursi yang nomornya sudah
        // terlanjur dikirim di undangan. Ditolak, bukan diperingatkan.
        $kapasitas = $acara->kursiPerMeja() + $jumlah;
        $tertinggi = $this->kursiTertinggiDi($acara, $meja);

        if ($tertinggi > $kapasitas) {
            throw ValidationException::withMessages([
                'meja' => 'Kursi '.$tertinggi.' di meja '.$meja.' masih ada tamunya, '
                    .'jadi meja ini tidak bisa kurang dari '.$tertinggi.' kursi. '
                    .'Pindahkan tamunya lebih dulu.',
            ]);
        }

        $peta = $acara->kursiTambahanMeja();

        if ($jumlah > 0) {
            $peta[(string) $meja] = $jumlah;
        } else {
            unset($peta[(string) $meja]);
        }

        $acara->update(['kursi_tambahan_meja' => $peta ?: null]);

        return back()->with(
            'success',
            $jumlah > 0
                ? 'Meja '.$meja.' sekarang berisi '.$kapasitas.' kursi.'
                : 'Kursi tambahan di meja '.$meja.' dihapus.'
        );
    }

    /**
     * Nomor kursi tertinggi yang sedang dipakai di satu meja.
     *
     * Disaring di PHP, bukan SQL: kolom meja boleh memuat beberapa meja
     * sekaligus ("3, 7") sejak satu undangan boleh terbelah.
     */
    private function kursiTertinggiDi(Acara $acara, int $meja): int
    {
        return (int) Tamu::where('acara_id', $acara->id)
            ->whereNotNull('meja')
            ->get()
            ->flatMap(fn (Tamu $t) => $t->kursiDi($meja))
            ->map(fn ($n) => ctype_digit((string) $n) ? (int) $n : 0)
            ->max();
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
            'orientasi' => 'nullable|in:'.Acara::DENAH_LANDSCAPE.','.Acara::DENAH_POTRET,
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
        // Dikelompokkan per penempatan, bukan per tamu: satu undangan boleh
        // terbelah ke beberapa meja, jadi tamu yang sama bisa muncul di dua
        // kelompok dengan nomor kursi yang berbeda-beda.
        $perMeja = [];

        foreach ($tamus as $tamu) {
            foreach ($tamu->dudukPerMeja() as $meja => $nomor) {
                $perMeja[(string) $meja][] = ['tamu' => $tamu, 'kursi' => $nomor];
            }
        }

        $papan = [];

        for ($nomor = 1; $nomor <= $acara->jumlahMeja(); $nomor++) {
            $kapasitas = $acara->kursiDiMeja($nomor);
            $penghuni = $perMeja[(string) $nomor] ?? [];

            // Kursi 1..kapasitas, masing-masing kosong atau berisi satu nama.
            $kursi = [];
            for ($k = 1; $k <= $kapasitas; $k++) {
                $kursi[$k] = null;
            }

            foreach ($penghuni as $isi) {
                foreach ($isi['kursi'] as $n) {
                    // array_key_exists, bukan isset: kursi kosong bernilai null
                    // dan isset() menganggap kunci bernilai null itu tidak ada,
                    // sehingga tidak satu pun kursi pernah terisi.
                    if (array_key_exists((int) $n, $kursi)) {
                        $kursi[(int) $n] = [
                            'id' => $isi['tamu']->id,
                            'nama' => $isi['tamu']->nama,
                            'lembaga' => $isi['tamu']->lembaga,
                        ];
                    }
                }
            }

            $papan[] = [
                'nomor' => $nomor,
                'kapasitas' => $kapasitas,
                'tambahan' => $acara->kursiTambahanDi($nomor),
                'terisi' => count(array_filter($kursi)),
                'kursi' => array_map(
                    fn ($n) => ['nomor' => $n, 'tamu' => $kursi[$n]],
                    array_keys($kursi)
                ),
                'tamus' => array_map(fn ($isi) => [
                    'id' => $isi['tamu']->id,
                    'nama' => $isi['tamu']->nama,
                    'lembaga' => $isi['tamu']->lembaga,
                    'kursi' => implode(', ', $isi['kursi']),
                    // Ditandai supaya daftar penghuni bisa menyebut bahwa
                    // sisa rombongannya duduk di meja lain.
                    'terbelah' => count($isi['tamu']->mejaDitempati()) > 1,
                ], $penghuni),
            ];
        }

        return $papan;
    }

    /**
     * Tempatkan sebagian atau seluruh rombongan satu undangan di satu meja.
     *
     * Nomor kursinya dipilihkan, bukan diketik: admin cukup menunjuk mejanya
     * dan sistem mengambil kursi kosong pertama. Itu menghapus seluruh kelas
     * kesalahan ketik sekaligus - kursi ganda, kursi di luar kapasitas,
     * jumlah kursi tak sesuai jumlah orang.
     *
     * Yang ditempatkan tidak harus satu rombongan penuh. Undangan berkuota 2
     * boleh diisi satu orang di meja ini dan satu lagi di meja lain; tanpa
     * "jumlah", seluruh sisanya yang ditempatkan sekaligus - itu yang paling
     * sering dipakai.
     */
    public function tempatkan(Request $request)
    {
        $data = $request->validate([
            'tamu_id' => 'required|exists:tamus,id',
            'meja' => 'required|integer|min:1',
            'jumlah' => 'nullable|integer|min:1',
        ]);

        $acara = Acara::aktif();
        abort_unless($acara, 404);

        $tamu = Tamu::findOrFail($data['tamu_id']);

        if ($tamu->acara_id !== $acara->id) {
            throw ValidationException::withMessages([
                'tamu_id' => 'Tamu ini bukan bagian dari '.$acara->label().'.',
            ]);
        }

        $meja = (int) $data['meja'];
        $kapasitas = $acara->kursiDiMeja($meja);

        if ($kapasitas < 1) {
            throw ValidationException::withMessages([
                'meja' => 'Meja '.$meja.' tidak ada. Acara ini punya '.$acara->jumlahMeja().' meja.',
            ]);
        }

        $sisa = $tamu->sisaKursi();

        if ($sisa < 1) {
            throw ValidationException::withMessages([
                'meja' => $tamu->nama.' sudah mendapat '.$tamu->kursiTerisi()
                    .' kursi, sebanyak kuota undangannya.',
            ]);
        }

        $butuh = min((int) ($data['jumlah'] ?? $sisa), $sisa);
        $kosong = $this->kursiKosong($acara, $meja);

        if (count($kosong) < $butuh) {
            throw ValidationException::withMessages([
                'meja' => 'Meja '.$meja.' tinggal '.count($kosong).' kursi, '
                    .'sedangkan '.$tamu->nama.' perlu '.$butuh.'.',
            ]);
        }

        $peta = $tamu->dudukPerMeja();
        $peta[(string) $meja] = array_merge(
            $peta[(string) $meja] ?? [],
            array_map('strval', array_slice($kosong, 0, $butuh))
        );

        $this->simpanTempat($tamu, $peta);

        $tersisa = $tamu->fresh()->sisaKursi();

        return back()->with('success', $tamu->nama.': '.$butuh.' kursi di meja '.$meja.'.'
            .($tersisa > 0 ? ' Masih ada '.$tersisa.' orang yang belum dapat kursi.' : ''));
    }

    /**
     * Keluarkan tamu dari satu meja saja, atau dari seluruh mejanya.
     */
    public function keluarkan(Request $request, Tamu $tamu)
    {
        $meja = trim((string) $request->input('meja'));

        if ($meja === '') {
            $tamu->update(['meja' => null, 'kursi' => null]);

            return back()->with('success', $tamu->nama.' dikeluarkan dari mejanya.');
        }

        $peta = $tamu->dudukPerMeja();
        unset($peta[Tamu::kunciMeja($meja)]);

        $this->simpanTempat($tamu, $peta);

        return back()->with('success', $tamu->nama.' dikeluarkan dari meja '.$meja.'.');
    }

    /**
     * Tulis peta meja => kursi kembali ke kolom tamu.
     *
     * Kolomnya varchar(50). Tanpa penjagaan ini, penempatan yang terpencar ke
     * banyak meja akan terpotong diam-diam di tengah nomor kursi - dan kursi
     * yang terpotong berarti kursi yang nanti dipesan dua kali.
     */
    private function simpanTempat(Tamu $tamu, array $peta): void
    {
        $kolom = Tamu::rangkaiTempat($peta);

        foreach ($kolom as $isi) {
            if (mb_strlen((string) $isi) > 50) {
                throw ValidationException::withMessages([
                    'meja' => 'Penempatan '.$tamu->nama.' terpencar di terlalu banyak '
                        .'meja untuk dicatat. Kumpulkan di meja yang lebih sedikit.',
                ]);
            }
        }

        $tamu->update($kolom);
    }

    /**
     * Nomor kursi yang masih kosong di satu meja, berurutan.
     *
     * Disaring di PHP, bukan SQL: kolom meja boleh memuat beberapa meja
     * sekaligus ("3, 7"), jadi pencocokan teks utuh akan melewatkan tamu yang
     * terbelah - dan kursi yang terlewat adalah kursi yang dipesan dua kali.
     */
    private function kursiKosong(Acara $acara, int $meja): array
    {
        $terpakai = Tamu::where('acara_id', $acara->id)
            ->whereNotNull('meja')
            ->get()
            ->flatMap(fn (Tamu $t) => $t->kursiDi($meja))
            ->map(fn ($n) => (int) $n)
            ->all();

        return array_values(array_diff(range(1, $acara->kursiDiMeja($meja)), $terpakai));
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Acara;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AcaraController extends Controller
{
    public function edit(Request $request)
    {
        $acara = Acara::dilihat($request->integer('acara') ?: null);

        return Inertia::render('Admin/Acara/Edit', [
            'acara' => $acara ? [
                'id' => $acara->id,
                'nama' => $acara->nama,
                // Nilai untuk <input type="datetime-local">, dalam WIB
                'mulai' => $acara->mulai?->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'selesai' => $acara->selesai?->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'tempat' => $acara->tempat,
                'alamat' => $acara->alamat,
                'peta_url' => $acara->peta_url,
                'video_url' => $acara->video_url,
                'musik_url' => $acara->musik_url,
                'jumlah_meja' => $acara->jumlah_meja,
                'kursi_per_meja' => $acara->kursi_per_meja,
                // Hanya untuk diberitahukan, bukan diubah di sini - kursi
                // tambahan diatur per meja lewat halaman Penempatan Kursi.
                'kursi_tambahan' => $acara->kursiTambahan(),
                'meja_bertambah' => $acara->mejaBerkursiTambahan(),
                // Dipakai formulir untuk memperingatkan sebelum tata letaknya
                // disusutkan, bukan untuk ditampilkan apa adanya.
                'meja_terpakai' => $acara->mejaTerpakai(),
                'kursi_terpakai' => $acara->kursiTerpakai(),
                'aktif' => $acara->aktif,
            ] : null,
            'acaras' => Acara::withCount('tamus')->orderByDesc('mulai')->get()
                ->map(fn (Acara $a) => [
                    'id' => $a->id,
                    'label' => $a->label(),
                    'jumlah' => $a->tamus_count,
                    'aktif' => $a->aktif,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        // Edisi baru sengaja dibuat tidak aktif: membuat dan menayangkan
        // adalah dua keputusan yang berbeda.
        // Edisi baru belum punya tamu, jadi tidak ada yang bisa tergusur.
        $acara = Acara::create($this->data($request) + ['aktif' => false]);

        return redirect()->route('admin.acara.edit', ['acara' => $acara->id])
            ->with('success', 'Edisi baru dibuat. Klik "Jadikan Aktif" bila sudah siap.');
    }

    public function update(Request $request, Acara $acara)
    {
        $acara->update($this->data($request, $acara));

        return back()->with('success', 'Data acara diperbarui.');
    }

    /**
     * Pindahkan status aktif ke satu edisi. Dalam transaksi supaya tidak
     * pernah ada dua baris aktif - Acara::aktif() harus selalu tidak ambigu.
     */
    public function aktifkan(Acara $acara)
    {
        DB::transaction(function () use ($acara) {
            Acara::where('aktif', true)->update(['aktif' => false]);
            $acara->update(['aktif' => true]);
        });

        return back()->with('success', $acara->label().' sekarang menjadi acara aktif.');
    }

    private function data(Request $request, ?Acara $acara = null): array
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'mulai' => 'required|date',
            'selesai' => 'nullable|date|after:mulai',
            'tempat' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:1000',
            'peta_url' => 'nullable|url|max:255',
            'video_url' => 'nullable|string|max:255',
            'musik_url' => 'nullable|string|max:255',
            'jumlah_meja' => 'nullable|integer|min:0|max:500',
            'kursi_per_meja' => 'nullable|integer|min:1|max:50',
        ], [
            'nama.required' => 'Nama acara wajib diisi.',
            'mulai.required' => 'Tanggal dan jam mulai wajib diisi.',
            'mulai.date' => 'Tanggal mulai tidak valid.',
            'selesai.after' => 'Jam selesai harus setelah jam mulai.',
            'peta_url.url' => 'Tautan peta harus berupa URL lengkap.',
            'kursi_per_meja.min' => 'Satu meja minimal punya satu kursi.',
            'jumlah_meja.min' => 'Jumlah meja tidak boleh negatif.',
        ]);

        $this->tolakBilaMenggusurTamu($data, $acara);

        // Terima bentuk tautan YouTube apa pun, tolak yang bukan YouTube.
        if (filled($data['video_url'] ?? null) && ! Acara::idYoutube($data['video_url'])) {
            throw ValidationException::withMessages([
                'video_url' => 'Tautan video harus dari YouTube, misalnya https://www.youtube.com/watch?v=xxxxxxxxxxx',
            ]);
        }

        // Yang diketik admin adalah waktu WIB; model yang mengubahnya ke UTC.
        // Kolom opsional tidak selalu ikut terkirim, jadi jangan diakses langsung.
        $data['selesai'] = $data['selesai'] ?? null;

        return $data;
    }

    /**
     * Mengecilkan tata letak akan membuang tempat duduk yang sudah dipakai -
     * dan undangannya sudah dikirim lengkap dengan nomor meja dan kursinya.
     * Tamu tidak akan terhapus, tapi kursinya jadi berada di luar denah:
     * hilang dari papan penempatan tanpa satu pun peringatan.
     *
     * Karena itu penyusutan ditolak di sini, bukan sekadar diperingatkan di
     * layar. Admin harus memindahkan tamunya lebih dulu.
     *
     * Diperiksa kursi demi kursi, bukan lewat nomor tertinggi: sejak ada
     * kursi tambahan, kapasitas tiap meja tidak lagi sama. Kursi nomor 7 yang
     * sah di meja terakhir tidak boleh memaksa seluruh meja berisi tujuh.
     */
    private function tolakBilaMenggusurTamu(array $data, ?Acara $acara): void
    {
        if (! $acara) {
            return;
        }

        // Tata letak yang diusulkan, belum disimpan. Kapasitas tiap mejanya
        // ditanyakan lewat rumus yang sama persis dengan yang nanti berlaku,
        // jadi penjaga ini tidak bisa berselisih dengan hasil akhirnya.
        $calon = $acara->replicate();

        foreach (['jumlah_meja', 'kursi_per_meja'] as $kolom) {
            if (array_key_exists($kolom, $data)) {
                $calon->{$kolom} = (int) $data[$kolom];
            }
        }

        $pesan = [];

        foreach ($acara->tamus()->whereNotNull('meja')->get() as $tamu) {
            foreach ($tamu->dudukPerMeja() as $meja => $nomor) {
                // Meja bernama huruf ("VIP 2") memang di luar denah bernomor.
                if (! ctype_digit((string) $meja)) {
                    continue;
                }

                $meja = (int) $meja;

                if ($meja > $calon->jumlahMeja()) {
                    $pesan['jumlah_meja'] = "Meja {$meja} masih ada tamunya ({$tamu->nama}), jadi jumlah meja tidak bisa kurang dari {$meja}. Pindahkan tamunya lebih dulu lewat Penempatan Kursi.";

                    continue;
                }

                $kapasitas = $calon->kursiDiMeja($meja);

                foreach ($nomor as $k) {
                    if (ctype_digit((string) $k) && (int) $k > $kapasitas) {
                        $pesan['kursi_per_meja'] = "Kursi {$k} di meja {$meja} masih dipakai {$tamu->nama}, sedangkan tata letak baru cuma memberi meja itu {$kapasitas} kursi. Pindahkan tamunya lebih dulu lewat Penempatan Kursi.";
                    }
                }
            }
        }

        if ($pesan) {
            throw ValidationException::withMessages($pesan);
        }
    }
}

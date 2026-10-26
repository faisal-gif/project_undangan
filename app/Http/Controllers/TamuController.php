<?php

namespace App\Http\Controllers;

use App\Jobs\SendTicketJob;
use App\Mail\TicketMail;
use App\Models\Acara;
use App\Models\EmailLog;
use App\Models\Tamu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Typography\FontFactory;

class TamuController extends Controller
{

    /**
     * Gambar QR untuk satu tamu, dibuat saat diminta - tidak ada berkas yang
     * disimpan. Isinya kode acak milik tamu, bukan nomor id, supaya QR tamu
     * lain tidak bisa ditebak. SVG dipilih karena tidak butuh ekstensi imagick
     * dan tetap tajam di layar maupun cetak.
     */
    public function qr(string $kode)
    {
        $tamu = Tamu::where('code', $kode)->firstOrFail();

        $svg = QrCode::format('svg')->size(300)->margin(1)->generate($tamu->code);

        return response((string) $svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $acara = Acara::dilihat($request->integer('acara') ?: null);

        $tamus = Tamu::query()
            ->edisi($acara)
            ->when($request->input('search'), function ($query, $search) {
                // Grup OR wajib: tanpa closure, AND mengikat lebih kuat dan
                // baris edisi lain ikut lolos lewat lembaga/pic.
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                        ->orWhere('lembaga', 'like', "%{$search}%")
                        ->orWhere('pic', 'like', "%{$search}%");
                });
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Tamu/Index', [
            'tamus' => $tamus,
            'filters' => $request->only(['search', 'acara']),
            'acaras' => $this->daftarEdisi(),
            'acaraDilihat' => $acara ? [
                'id' => $acara->id,
                'label' => $acara->label(),
                'aktif' => $acara->aktif,
            ] : null,
        ]);
    }

    /**
     * Halaman untuk menyalin tamu dari edisi sebelumnya ke edisi aktif.
     */
    public function salinForm(Request $request)
    {
        $tujuan = Acara::aktif();
        $sumberLain = Acara::where('id', '!=', $tujuan?->id)->orderByDesc('mulai')->get();
        $sumber = $sumberLain->firstWhere('id', $request->integer('dari')) ?? $sumberLain->first();

        // Nama yang sudah ada di edisi tujuan, untuk menandai baris yang akan dilewati.
        $sudahAda = $tujuan
            ? Tamu::edisi($tujuan)->pluck('nama')->map(fn ($n) => $this->kunciNama($n))->filter()->flip()
            : collect();

        return Inertia::render('Admin/Tamu/Salin', [
            'tujuan' => $tujuan ? ['id' => $tujuan->id, 'label' => $tujuan->label()] : null,
            'sumber' => $sumber ? ['id' => $sumber->id, 'label' => $sumber->label()] : null,
            'sumberTersedia' => $sumberLain->map(fn (Acara $a) => [
                'id' => $a->id,
                'label' => $a->label(),
                'jumlah' => $a->tamus()->count(),
            ]),
            'tamus' => $sumber
                ? Tamu::edisi($sumber)->orderBy('nama')->get()
                    ->map(fn (Tamu $t) => [
                        'id' => $t->id,
                        'nama' => $t->nama,
                        'lembaga' => $t->lembaga,
                        'pic' => $t->pic,
                        'jumlah_orang' => $t->jumlah_orang,
                        'status' => $t->status,
                        'sudah_ada' => $sudahAda->has($this->kunciNama($t->nama)),
                    ])
                : [],
        ]);
    }

    /**
     * Salin tamu terpilih ke edisi aktif. Yang disalin hanya datanya: status
     * kembali ke "belum" dan QR dibuat ulang, karena kodenya baru.
     */
    public function salin(Request $request)
    {
        $request->validate([
            'tamu_ids' => 'required|array|min:1',
            'tamu_ids.*' => 'integer|exists:tamus,id',
        ], [
            'tamu_ids.required' => 'Pilih dulu tamu yang mau disalin.',
        ]);

        $tujuan = Acara::aktif();

        if (! $tujuan) {
            return back()->with('error', 'Belum ada acara aktif.');
        }

        $sudahAda = Tamu::edisi($tujuan)->pluck('nama')
            ->map(fn ($n) => $this->kunciNama($n))->filter()->flip();

        $disalin = 0;
        $dilewati = 0;

        foreach (Tamu::whereIn('id', $request->tamu_ids)->where('acara_id', '!=', $tujuan->id)->get() as $asal) {
            $kunci = $this->kunciNama($asal->nama);

            if ($kunci !== '' && $sudahAda->has($kunci)) {
                $dilewati++;
                continue;
            }

            Tamu::create([
                'acara_id' => $tujuan->id,
                'nama' => $asal->nama,
                'lembaga' => $asal->lembaga,
                'alamat' => $asal->alamat,
                'pic' => $asal->pic,
                'jumlah_orang' => $asal->jumlah_orang,
                'code' => $this->kodeUnik(),
                'status' => 'belum',
            ]);

            $sudahAda->put($kunci, true);
            $disalin++;
        }

        $pesan = $disalin . ' tamu disalin ke ' . $tujuan->label() . '.';

        if ($dilewati > 0) {
            $pesan .= ' ' . $dilewati . ' dilewati karena namanya sudah ada.';
        }

        $pesan .= ' Jalankan "Generate Qr Code" untuk membuat QR-nya.';

        return redirect()->route('admin.tamu.index')->with('success', $pesan);
    }

    /**
     * Kode undangan acak yang belum dipakai tamu mana pun.
     */
    private function kodeUnik(): string
    {
        do {
            $kode = strtoupper(Str::random(8));
        } while (Tamu::where('code', $kode)->exists());

        return $kode;
    }

    /**
     * Nama yang disamakan bentuknya, untuk mendeteksi tamu yang sama.
     */
    private function kunciNama(?string $nama): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) $nama)));
    }

    /**
     * Semua edisi acara beserta jumlah tamunya, untuk pemilih edisi.
     */
    private function daftarEdisi()
    {
        return Acara::withCount('tamus')->orderByDesc('mulai')->get()
            ->map(fn (Acara $a) => [
                'id' => $a->id,
                'label' => $a->label(),
                'jumlah' => $a->tamus_count,
                'aktif' => $a->aktif,
            ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Tamu/Create', [
            'acaraAktif' => Acara::aktif()?->label(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:255',
            'lembaga' => 'nullable|string|max:255',
            'jumlah_orang' => 'nullable|integer|min:1',
            'pic' => 'nullable|string|max:255',
        ]);

        $tamu = Tamu::create([
            // Tamu baru selalu masuk edisi yang sedang aktif.
            'acara_id' => Acara::aktif()?->id,
            'nama' => $request->nama,
            'alamat' => $request->alamat,
            'lembaga' => $request->lembaga,
            'pic' => $request->pic,
            'jumlah_orang' => $request->jumlah_orang,
            'code' => $this->kodeUnik(),
        ]);

        return redirect()->route('admin.tamu.index')->with('success', 'Tamu berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tamu $tamu)
    {
        $tamu->qrcode = $tamu->qrcode
            ? asset($tamu->qrcode)
            : null;

        return Inertia::render('Admin/Tamu/Show', [
            'participant' => $tamu,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tamu $tamu)
    {
        return Inertia::render('Admin/Tamu/Edit', [
            'tamu' => $tamu->load('acara'),
            'edisi' => $tamu->acara?->label(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tamu $tamu)
    {

        $request->validate([
            'nama' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:255',
            'lembaga' => 'nullable|string|max:255',
            'jumlah_orang' => 'nullable|integer|min:1',
            'pic' => 'nullable|string|max:255',
        ]);

        $tamu->update([
            'nama' => $request->nama,
            'alamat' => $request->alamat,
            'lembaga' => $request->lembaga,
            'jumlah_orang' => $request->jumlah_orang,
            'pic' => $request->pic,
        ]);

        return redirect()->route('admin.tamu.index')->with('success', 'Tamu berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tamu $tamu)
    {
        $tamu->delete();

        return redirect()->route('admin.tamu.index')->with('success', 'Tamu berhasil dihapus.');
    }

    public function getTamu($id)
    {
        $tamu = Tamu::find($id);

        return json_decode($tamu);
    }

    public function qrScanner(Request $request)
    {
        // Sengaja edisi aktif, bukan yang sedang dilihat: check-in adalah
        // operasi acara yang berlangsung, tamu arsip tidak boleh muncul di sini.
        $tamus = Tamu::query()
            ->edisi(Acara::aktif())
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                        ->orWhere('lembaga', 'like', "%{$search}%")
                        ->orWhere('pic', 'like', "%{$search}%");
                });
            })
            ->paginate(10)
            ->withQueryString();


        return Inertia::render('Admin/QrScanner/Index', [
            'tamus' => $tamus,
            'filters' => $request->only(['search'])
        ]);
    }

    public function loopSendEmail()
    {
        $acara = Acara::aktif();

        if (! $acara) {
            return back()->with('error', 'Belum ada acara aktif.');
        }

        Tamu::edisi($acara)->chunkById(10, function ($tamus) {
            foreach ($tamus as $tamu) {
                dispatch(new SendTicketJob($tamu->id));
            }
        });

        return back()->with('success', 'Email untuk ' . $acara->label() . ' sedang dikirim.');
    }

    public function sendEmail($id)
    {
        $tamu = Tamu::find($id);

        if (! $tamu) {
            return back()->with('error', 'Tamu tidak ditemukan.');
        }

        if ($tamu->acara_id !== Acara::aktif()?->id) {
            return back()->with('error', 'Tamu ini dari edisi lain, email tidak dikirim.');
        }

        if ($tamu->email) {
            $qrcodePath = storage_path('app/public/' . str_replace('storage/', '', $tamu->qrcode));

            try {
                Mail::to($tamu->email)->send(new TicketMail($tamu, $qrcodePath));

                // jika berhasil
                EmailLog::create([
                    'tamu_id' => $tamu->id,
                    'email'   => $tamu->email,
                    'status'  => 'success',
                    'message' => 'Email berhasil dikirim',
                ]);
            } catch (\Exception $e) {
                // jika gagal
                EmailLog::create([
                    'tamu_id' => $tamu->id,
                    'email'   => $tamu->email,
                    'status'  => 'failed',
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return redirect()->back()->with('success', "Email {$tamu->nama} Sedang Dikirim!");
    }

    public function attendance(string $kode)
    {
        // QR sekarang berisi kode acak. Nomor id masih dicoba sebagai cadangan
        // supaya QR lama tetap dikenali - lalu ditolak gerbang edisi di bawah
        // dengan pesan yang jelas.
        $tamu = Tamu::with('acara')->where('code', $kode)->first()
            ?? (ctype_digit($kode) ? Tamu::with('acara')->find($kode) : null);

        if (!$tamu) {
            return back()->with('error', 'Undangan Tidak ditemukan');
        }

        $acara = Acara::aktif();

        // Sebelum pemeriksaan status, supaya tamu edisi lama yang sudah datang
        // tahun lalu tidak dikira pemindaian ganda.
        if (! $acara || $tamu->acara_id !== $acara->id) {
            return back()->with(
                'error',
                'QR ini untuk ' . ($tamu->acara?->label() ?? 'acara lain')
                    . ', bukan ' . ($acara?->label() ?? 'acara yang sedang berlangsung') . '.'
            );
        }

        if ($tamu->status === 'datang') {

            return back()->with('error', 'Undangan Sudah Digunakan');
        }

        $tamu->status = 'datang';
        $tamu->save();

        return back()->with('success', 'Selamat datang ' . $tamu->nama);
    }

    public function update_status(Request $request, $id)
    {
        $tamu = Tamu::find($id);

        if (! $tamu) {
            return back()->with('error', 'Tamu tidak ditemukan.');
        }

        $tamu->status = $request->status;
        $tamu->save();

        return redirect()->route('admin.qrScanner')->with('success', 'Racepack atas nama: ' . $tamu->nama . ' sudah diambil');
    }



}

<?php

namespace App\Http\Controllers;

use App\Models\Acara;
use App\Models\Tamu;
use App\Models\Winners;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class HomeController extends Controller
{

    protected $apiUrl;
    protected $apiKey;

    public function __construct()
    {
        // Inisialisasi nilai config satu kali di sini
        $this->apiUrl = config('services.tin_api.url');
        $this->apiKey = config('services.tin_api.key');
    }

    public function dashboard()
    {
        // Angka tamu selalu untuk edisi yang sedang aktif; pemenang tetap
        // dihitung lintas tahun karena punya kolom tahun sendiri.
        $acara = Acara::aktif();
        $tamus = fn() => Tamu::edisi($acara);

        return Inertia::render('Dashboard', [
            'edisi' => $acara?->label(),
            'totalTamu' => $tamus()->count(),
            'totalTamuDatang' => $tamus()->where('status', 'datang')->count(),
            'totalTamuBelumDatang' => $tamus()->where('status', 'belum')->count(),
            'totalTamuUndangan' => $tamus()->sum('jumlah_orang'),
            'totalWinners' => Winners::count(),
        ]);
    }

    /**
     * Meta untuk perayap. Tag <Head> milik Inertia hanya dirender di browser,
     * jadi WhatsApp, Facebook, dan Google membaca yang dari Blade ini.
     */
    private function meta(string $judul, string $keterangan, bool $indeks = true): array
    {
        return [
            'ogTitle' => $judul,
            'ogDescription' => $keterangan,
            'ogUrl' => url()->current(),
            'robots' => $indeks ? 'index, follow' : 'noindex, nofollow',
        ];
    }

    /**
     * "Anugerah TIMES Indonesia 2026" dari acara aktif.
     */
    private function namaAcara(): string
    {
        $acara = Acara::aktif();

        return trim(($acara?->nama ?: config('app.name')) . ' ' . ($acara?->mulai?->timezone(Acara::ZONA)->year ?? ''));
    }

    public function index()
    {

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey
        ])->get($this->apiUrl, [
            'news_type' => 'focus',
            'cat_id'    => 351,
            'offset'    => 0,
            'limit'     => 9
        ]);

        $data = $response->successful() ? $response->json() : null;

        $acara = Acara::aktif()?->toShare();
        $kapan = $acara ? "{$acara['tanggal_label']}, {$acara['jam_label']}" . ($acara['tempat'] ? " di {$acara['tempat']}" : '') . '. ' : '';

        return Inertia::render('Guest/Welcome/Index', ['apiData' => $data['data'] ?? []])
            ->withViewData($this->meta(
                $this->namaAcara(),
                $kapan . 'Merayakan pencapaian luar biasa dan memberikan penghargaan kepada insan inspiratif yang membawa dampak positif bagi banyak orang.'
            ));
    }

    public function news(Request $request)
    {
        $page = $request->get('page', 1);
        $limit = 9;
        $offset = ($page - 1) * $limit;

        // Tidak perlu memanggil config() lagi, langsung gunakan $this
        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey
        ])->get($this->apiUrl, [
            'news_type' => 'focus',
            'cat_id'    => 351,
            'offset'    => $offset,
            'limit'     => $limit,
        ]);

        $data = $response->successful() ? $response->json() : null;

        return Inertia::render('Guest/News/Index', [
            'items'      => $data['data'] ?? [], // isi berita
            'page'       => $page,
            'limit'      => $limit,
        ])->withViewData($this->meta(
            'Berita Seputar ATI - ' . config('app.name'),
            'Kabar terbaru seputar Anugerah TIMES Indonesia dan para penerimanya.'
        ));
    }


    public function winners()
    {
        $winners = Winners::orderBy('tahun', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('tahun');

        // Konversi ke format yang lebih mudah digunakan di frontend
        $groupedWinners = $winners->map(function ($yearWinners, $year) {
            return [
                'year' => $year,
                'winners' => $yearWinners->values()
            ];
        })->values();

        return Inertia::render('Guest/Winners/Index', [
            'winnersByYear' => $groupedWinners
        ])->withViewData($this->meta(
            'Para Peraih Anugerah TIMES Indonesia',
            'Daftar peraih Anugerah TIMES Indonesia dari tahun ke tahun, penghormatan bagi individu dan lembaga yang menorehkan kontribusi luar biasa.'
        ));
    }



    public function widget()
    {
        return Inertia::render('Guest/Widget/Index')
            ->withViewData($this->meta(
                'Hitung Mundur ' . $this->namaAcara(),
                'Hitung mundur menuju malam ' . $this->namaAcara() . '.',
                indeks: false
            ));
    }

    public function undangan($id, $nama)
    {
        $tamu = Tamu::with('acara')->findOrFail($id);
        $acara = Acara::aktif();

        // Undangan edisi lama ditutup: isinya (hitung mundur, QR, rundown)
        // hanya benar untuk acara yang sedang aktif.
        if (! $acara || $tamu->acara_id !== $acara->id) {
            return Inertia::render('Guest/Undangan/Selesai', [
                'nama' => $tamu->nama,
                // Bukan 'acara': nama itu akan menimpa prop bersama dari middleware.
                'edisi' => $tamu->acara?->toShare(),
            ])->withViewData($this->meta(
                'Acara Sudah Berlalu - ' . config('app.name'),
                'Undangan ini berlaku untuk acara yang sudah berlangsung.',
                indeks: false
            ));
        }

        return Inertia::render('Guest/Undangan/Index', [
            'tamu' => $tamu,
        ])->withViewData($this->meta(
            'Undangan untuk ' . $tamu->nama,
            'Kami menantikan kehadiran Anda di malam ' . $this->namaAcara() . '.',
            // Undangan memuat nama tamu, jangan sampai terindeks mesin pencari.
            indeks: false
        ));
    }
}

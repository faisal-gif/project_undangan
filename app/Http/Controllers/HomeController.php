<?php

namespace App\Http\Controllers;

use App\Models\Tamu;
use App\Models\Winners;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function dashboard()
    {
        $totalTamu = Tamu::count();
        $totalTamuDatang = Tamu::where('status', 'datang')->count();
        $totalTamuUndangan = Tamu::sum('jumlah_orang');
       
        $totalTamuBelumDatang = Tamu::where('status', 'belum')->count();
        $totalWinners = Winners::count();


        return Inertia::render('Dashboard', [
            'totalTamu' => $totalTamu,
            'totalTamuDatang' => $totalTamuDatang,
            'totalTamuBelumDatang' => $totalTamuBelumDatang,
            'totalTamuUndangan' => $totalTamuUndangan,
            'totalWinners' => $totalWinners,
        ]);
    }

    public function index()
    {

        $response = Http::get('https://api.tin.co.id/v1/all_news/?key=NyEIwDL51eeaoVhYGPaF&news_type=focus&cat_id=351&offset=0&limit=9');
        $data = null;

        if ($response->successful()) {
            $data = $response->json();
        } else {
            $data = null;
        }

        return Inertia::render('Guest/Welcome/Index', ['apiData' => $data['data']]);
    }

public function news(Request $request)
{
    $page = $request->get('page', 1); // default page 1
    $limit = 9;
    $offset = ($page - 1) * $limit;

    $response = Http::get('https://api.tin.co.id/v1/all_news/', [
        'key' => 'NyEIwDL51eeaoVhYGPaF',
        'news_type' => 'focus',
        'cat_id' => 351,
        'offset' => $offset,
        'limit' => $limit,
    ]);

    $data = $response->json();

    return Inertia::render('Guest/News/Index', [
        'items'      => $data['data'],       // isi berita
        'page'       => $page,
        'limit'      => $limit,
    ]);
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
        ]);
    }



    public function widget()
    {
        return Inertia::render('Guest/Widget/Index');
    }

    public function undangan($id, $nama)
    {
        $tamu = Tamu::find($id);

        return Inertia::render('Guest/Undangan/Index', [
            'tamu' => $tamu,
        ])->withViewData([
            'ogTitle' => 'Kepada ' . $tamu->nama,
            'ogDescription' => 'Kami menantikan kehadiran Anda di malam Anugerah TIMES Indonesia',
            'ogUrl' => url()->current(),
        ]);;
    }
}

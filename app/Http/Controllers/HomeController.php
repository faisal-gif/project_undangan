<?php

namespace App\Http\Controllers;

use App\Models\Tamu;
use App\Models\Winners;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {

        $response = Http::get('https://api.tin.co.id/v1/all_news/?key=NyEIwDL51eeaoVhYGPaF&news_type=focus&cat_id=344&offset=0&limit=9');
        $data = null;

        if ($response->successful()) {
            $data = $response->json();
        } else {
            $data = null;
        }

        return Inertia::render('Guest/Welcome/Index', ['apiData' => $data['data']]);
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

    public function undangan($code, $nama)
    {
        $tamu = Tamu::where('code', $code)->first();

        return Inertia::render('Guest/Undangan/Index', [
            'tamu' => $tamu,
        ])->withViewData([
            'ogTitle' => 'Kepada '.$tamu->nama,
            'ogDescription' => 'Kami mengundang anda sekalian untuk menghadiri acara penganugrahan Anugerah Times Indonesia',
            'ogUrl' => url()->current(),
        ]);;
    }
}

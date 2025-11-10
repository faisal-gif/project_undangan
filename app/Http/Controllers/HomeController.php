<?php

namespace App\Http\Controllers;

use App\Models\Winners;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Guest/Welcome/Index');
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
}

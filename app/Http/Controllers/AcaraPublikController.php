<?php

namespace App\Http\Controllers;

use App\Models\Acara;
use Illuminate\Http\JsonResponse;

/**
 * API baca-saja untuk situs lain. Jangan tertukar dengan ApiController, yang
 * arahnya keluar: itu klien untuk mengambil berita dari API TIMES.
 */
class AcaraPublikController extends Controller
{
    /**
     * Info acara aktif: hitung mundur, tanggal, dan lokasi. Tanpa data tamu
     * maupun pemenang.
     */
    public function __invoke(): JsonResponse
    {
        $acara = Acara::aktif();

        if (! $acara) {
            return response()->json([
                'error' => 'Belum ada acara aktif.',
                'status' => 404,
            ], 404);
        }

        return response()->json(['data' => $acara->toApi()]);
    }
}

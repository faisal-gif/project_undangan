<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ApiController extends Controller
{

    protected $apiUrl;
    protected $apiKey;

    public function __construct()
    {
        // Inisialisasi nilai config satu kali di sini
        $this->apiUrl = config('services.tin_api.url');
        $this->apiKey = config('services.tin_api.key');
    }

    public function fetchData()
    {
        // Menggunakan header dan mengambil URL dari property class
        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey
        ])->get($this->apiUrl, [
            'news_type' => 'focus',
            'cat_id'    => 344, // Perhatikan: ini 344 sesuai kode Anda sebelumnya
            'offset'    => 0,
            'limit'     => 9
        ]);

        if ($response->successful()) {
            $data = $response->json();

            return view('data.show', ['apiData' => $data]);
        } else {
            // Penanganan error tetap dipertahankan
            return response()->json([
                'error'  => 'Gagal mengambil data dari API eksternal.',
                'status' => $response->status()
            ], $response->status());
        }
    }
}

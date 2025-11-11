<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ApiController extends Controller
{
    public function fetchData()
    {
        $response = Http::get('https://api.tin.co.id/v1/all_news/?key=NyEIwDL51eeaoVhYGPaF&news_type=focus&cat_id=344&offset=0&limit=9');

        if ($response->successful()) {
            $data = $response->json();

            return view('data.show', ['apiData' => $data]);
            
        } else {
            return response()->json([
                'error' => 'Gagal mengambil data dari API eksternal.',
                'status' => $response->status()
            ], $response->status());
        }
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiKey
{
    /**
     * Kunci statis di header x-api-key untuk /api/*.
     *
     * Sengaja tidak memakai abort() seperti IsAdmin dan IsUser: abort merender
     * HTML bagi klien yang tidak mengirim Accept: application/json, padahal
     * pemakai API ini memanggil dari server, bukan dari browser.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $kunci = (string) config('services.ati_api.key');

        // Tutup rapat kalau server belum dikonfigurasi. Tanpa cabang ini kunci
        // kosong akan cocok dengan header kosong dan API jadi terbuka lebar.
        if ($kunci === '') {
            return response()->json([
                'error' => 'API belum dikonfigurasi di server.',
                'status' => 503,
            ], 503);
        }

        // hash_equals membandingkan dalam waktu tetap, supaya kunci tidak bisa
        // ditebak huruf demi huruf dari selisih waktu balasan.
        if (! hash_equals($kunci, (string) $request->header('x-api-key'))) {
            return response()->json([
                'error' => 'Kunci API tidak sah atau tidak dikirim.',
                'status' => 401,
            ], 401);
        }

        return $next($request);
    }
}

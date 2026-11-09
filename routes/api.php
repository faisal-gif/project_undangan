<?php

use App\Http\Controllers\AcaraPublikController;
use Illuminate\Support\Facades\Route;

/**
 * Satu titik baca untuk situs lain (mis. timesindonesia.co.id) yang ingin
 * menampilkan hitung mundur, tanggal, dan lokasi ATI. Hanya acara aktif,
 * hanya baca, dikunci kunci statis di header x-api-key - konvensi yang sama
 * dengan yang dipakai situs ini saat memanggil API TIMES.
 *
 * Jangan ganti 'throttle:60,1' menjadi 'throttle:api': proyek ini tidak punya
 * RateLimiter::for('api'), dan middleware-nya akan melempar galat 500.
 */
Route::get('/v1/acara', AcaraPublikController::class)
    ->middleware(['api.key', 'throttle:60,1', 'cache.headers:public;max_age=60'])
    ->name('api.acara');

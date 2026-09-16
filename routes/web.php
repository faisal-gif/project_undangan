<?php

use App\Http\Controllers\AcaraController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TamuController;
use App\Http\Controllers\WinnersController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/news', [HomeController::class, 'news'])->name('news');
Route::get('/winners', [HomeController::class, 'winners'])->name('winners');
Route::get('/widget', [HomeController::class, 'widget'])->name('widget');
Route::get('/undangan/{id}/{name}', [HomeController::class, 'undangan'])->name('undangan');

Route::get('/dashboard', [HomeController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    // Wajib sebelum Route::resource: /admin/tamu/{tamu} akan menelan path dua
    // segmen seperti /admin/tamu/loop-qr.
    Route::get('/tamu/loop-qr', [TamuController::class, 'loopQr'])->name('tamu.loopQr');
    Route::get('/tamu/loop-email', [TamuController::class, 'loopSendEmail'])->name('tamu.loopEmail');

    Route::resource('tamu', TamuController::class);
    Route::resource('winners', WinnersController::class);

    Route::get('/tamu/{id}/email', [TamuController::class, 'sendEmail'])->name('tamu.sendEmail');
    Route::get('/tamu/{id}/pdf', [TamuController::class, 'generatePdf'])->name('tamu.undangan');

    Route::get('/pdf/{id}', [TamuController::class, 'generatePdf'])->name('pdf');
    Route::get('/attendance/{id}', [TamuController::class, 'attendance'])->name('attendance');
    Route::put('/participants/update-status/{id}', [TamuController::class, 'update_status'])->name('participants.update-status');
    Route::get('/qrScanner', [TamuController::class, 'qrScanner'])->name('qrScanner');
    Route::get('/tamu/data/{id}', [TamuController::class, 'getTamu'])->name('tamu.data');
    Route::get('/acara', [AcaraController::class, 'edit'])->name('acara.edit');
    Route::post('/acara', [AcaraController::class, 'store'])->name('acara.store');
    Route::put('/acara/{acara}', [AcaraController::class, 'update'])->name('acara.update');
    Route::put('/acara/{acara}/aktifkan', [AcaraController::class, 'aktifkan'])->name('acara.aktifkan');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

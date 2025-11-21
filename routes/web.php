<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TamuController;
use App\Http\Controllers\WinnersController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/winners', [HomeController::class, 'winners'])->name('winners');
Route::get('/widget', [HomeController::class, 'widget'])->name('widget');
Route::get('/undangan/{id}/{name}', [HomeController::class, 'undangan'])->name('undangan');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::resource('tamu', TamuController::class);
    Route::resource('winners', WinnersController::class);
    Route::get('/pdf/{id}', [TamuController::class, 'generatePdf'])->name('pdf');
    Route::get('/attendance/{id}', [TamuController::class, 'attendance'])->name('attendance');
    Route::put('/participants/update-status/{id}', [TamuController::class, 'update_status'])->name('participants.update-status');
    Route::get('/qrScanner', [TamuController::class, 'qrScanner'])->name('qrScanner');
    Route::post('/qr/validate', [TamuController::class, 'qrValidate'])->name('qrValidate');
    Route::get('/tamu/data/{id}', [TamuController::class, 'getTamu'])->name('tamu.data');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/sendEmail/{id}',[TamuController::class, 'sendEmail'])->name('sendEmail');
Route::get('/loop', [TamuController::class, 'loopQr'])->name('loop');
Route::get('/loopSendEmail', [TamuController::class, 'loopSendEmail'])->name('loopEmail');
Route::get('undanganDigital/{id}', [TamuController::class, 'generatePdf'])->name('tickets.undangan');
Route::get('/bubble', [TamuController::class, 'bubble'])->name('bubble');

require __DIR__ . '/auth.php';

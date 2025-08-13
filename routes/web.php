<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TamuController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::resource('tamu', TamuController::class);
    Route::get('/pdf/{id}', [TamuController::class, 'generatePdf'])->name('pdf');
    Route::get('/qrScanner', [TamuController::class, 'qrScanner'])->name('qrScanner');
    Route::post('/qr/validate', [TamuController::class, 'qrValidate'])->name('qrValidate');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::get('/loop', [TamuController::class, 'loopQr'])->name('loop');
Route::get('undangan/{id}', [TamuController::class, 'generatePdf'])->name('tickets.undangan');
Route::get('/bubble', [TamuController::class, 'bubble'])->name('bubble');

require __DIR__ . '/auth.php';

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Letak tiap meja di ruangan, disimpan sebagai {"1":{"x":12.5,"y":30},...}.
 *
 * Nilainya persen terhadap lebar dan tinggi ruangan, bukan piksel: denah yang
 * sama harus terbaca benar di layar admin maupun di monitor besar sebelah meja
 * penerima tamu, yang ukurannya jauh berbeda.
 *
 * Tetap tanpa tabel meja tersendiri. Letak hanyalah lapisan tampilan di atas
 * meja 1..N yang sudah diturunkan dari jumlah kursi; meja yang belum pernah
 * digeser jatuh ke susunan grid otomatis, dan kunci yang tertinggal setelah
 * jumlah meja dikurangi diabaikan begitu saja.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->json('denah')->nullable()->after('kursi_per_meja');
        });
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('denah');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tempat duduk tamu: nomor meja dan nomor kursi.
 *
 * Keduanya teks, bukan angka, karena penomoran meja di ballroom kerap bukan
 * bilangan murni - "VIP 2", "A3". Kursi juga menampung lebih dari satu nomor
 * sekaligus ("3, 4"), sebab satu undangan berlaku untuk beberapa orang.
 *
 * Boleh kosong: penempatan biasanya baru selesai mendekati hari-H, dan
 * undangan harus tetap bisa dikirim sebelum itu.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->string('meja', 50)->nullable()->after('jumlah_orang');
            $table->string('kursi', 50)->nullable()->after('meja');
        });
    }

    public function down(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropColumn(['meja', 'kursi']);
        });
    }
};

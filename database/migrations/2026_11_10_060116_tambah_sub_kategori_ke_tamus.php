<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nama penghargaan yang spesifik, mis. "Best Innovation in Basic Education
 * Transformation", sebagai pelengkap kategori umumnya ("Innovation in
 * Education"). Boleh kosong: tidak semua tamu penerima punya sub kategori,
 * dan tamu biasa sama sekali tidak memakainya.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->string('sub_kategori')->nullable()->after('kategori_penghargaan');
        });
    }

    public function down(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropColumn('sub_kategori');
        });
    }
};

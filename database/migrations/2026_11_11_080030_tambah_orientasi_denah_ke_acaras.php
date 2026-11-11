<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bentuk ruangan pada denah: melebar (landscape) atau memanjang (potret).
 *
 * Ballroom tidak selalu lebih lebar daripada dalam. Tanpa pilihan ini, ruangan
 * sempit-dalam terpaksa digambar melebar, dan mejanya berdesakan secara
 * vertikal supaya denah tetap muat satu layar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->string('orientasi_denah', 12)->default('landscape')->after('meja_per_baris');
        });
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('orientasi_denah');
        });
    }
};

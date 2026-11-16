<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kursi tambahan di luar hitungan meja x kursi per meja.
 *
 * Jumlah undangan jarang pas membagi habis. 27 meja berisi 6 menghasilkan 162
 * kursi, sementara undangannya 163 - satu orang tidak kebagian. Menaikkan
 * kursi per meja jadi 7 akan menambah 27 kursi sekaligus, dan menambah meja
 * ke-28 berarti mengarang meja yang tidak ada di ruangan.
 *
 * Jadi sisanya disimpan terpisah dan dibagikan satu kursi per meja dari meja
 * TERAKHIR mundur ke depan. Meja di depan panggung tetap serapi rencana, dan
 * kursi sempitnya jatuh di belakang.
 *
 * Bawaannya 0, jadi acara yang sudah berjalan tidak berubah sedikit pun.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->unsignedSmallInteger('kursi_tambahan')->default(0)->after('kursi_per_meja');
        });
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('kursi_tambahan');
        });
    }
};

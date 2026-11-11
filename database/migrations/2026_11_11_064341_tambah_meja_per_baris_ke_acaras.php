<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Berapa meja dalam satu baris pada susunan grid denah.
 *
 * Kosong berarti dihitung sendiri dari jumlah meja. Diisi bila bentuk
 * ruangannya tidak seperti dugaan - ruangan memanjang butuh baris yang lebih
 * panjang, ruangan kotak butuh yang lebih pendek.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->unsignedTinyInteger('meja_per_baris')->nullable()->after('kursi_per_meja');
        });
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('meja_per_baris');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tata letak kursi per edisi acara.
 *
 * Jumlah mejanya tidak disimpan: ia hasil bagi dua angka ini, jadi tidak bisa
 * berselisih dengan keduanya. Daftar meja dan kursi pun tidak dibuatkan tabel
 * sendiri - meja 1..N dengan kursi 1..M seluruhnya bisa diturunkan, dan siapa
 * menempati apa sudah tercatat di kolom meja/kursi milik tamu.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->unsignedSmallInteger('jumlah_kursi')->nullable()->after('alamat');
            $table->unsignedTinyInteger('kursi_per_meja')->default(6)->after('jumlah_kursi');
        });
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn(['jumlah_kursi', 'kursi_per_meja']);
        });
    }
};

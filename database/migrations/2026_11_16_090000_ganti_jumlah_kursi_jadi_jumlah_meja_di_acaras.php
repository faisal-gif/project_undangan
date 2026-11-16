<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Yang diketik admin sekarang jumlah MEJA, bukan jumlah kursi.
 *
 * Dulu: jumlah_kursi + kursi_per_meja -> jumlah meja dihitung.
 * Kini: jumlah_meja  + kursi_per_meja -> jumlah kursi dihitung.
 *
 * Pengisiannya memakai rumus lama persis - ceil(kursi / per meja) - supaya
 * acara yang sudah berjalan tidak berubah jumlah mejanya sedetik pun. Itu
 * penting: undangannya sudah dikirim lengkap dengan nomor meja.
 *
 * Pembulatan ke atas membuat kapasitas hanya bisa tetap atau bertambah,
 * tidak pernah menyusut. Contoh 100 kursi dengan 6 per meja: dulu 17 meja
 * (yang terakhir diisi 4), sekarang 17 meja penuh = 102 kursi. Dua kursi
 * bertambah; tidak ada tamu yang kehilangan tempat.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->unsignedInteger('jumlah_meja')->nullable()->after('alamat');
        });

        foreach (DB::table('acaras')->select('id', 'jumlah_kursi', 'kursi_per_meja')->get() as $acara) {
            $kursi = (int) $acara->jumlah_kursi;
            $per = max(1, (int) ($acara->kursi_per_meja ?: 6));

            DB::table('acaras')
                ->where('id', $acara->id)
                ->update(['jumlah_meja' => $kursi > 0 ? (int) ceil($kursi / $per) : 0]);
        }

        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('jumlah_kursi');
        });
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->unsignedInteger('jumlah_kursi')->nullable()->after('alamat');
        });

        foreach (DB::table('acaras')->select('id', 'jumlah_meja', 'kursi_per_meja')->get() as $acara) {
            $meja = (int) $acara->jumlah_meja;
            $per = max(1, (int) ($acara->kursi_per_meja ?: 6));

            DB::table('acaras')
                ->where('id', $acara->id)
                ->update(['jumlah_kursi' => $meja * $per]);
        }

        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('jumlah_meja');
        });
    }
};

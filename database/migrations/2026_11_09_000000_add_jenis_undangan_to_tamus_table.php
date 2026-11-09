<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Undangan punya dua versi: tamu yang hadir, dan penerima penghargaan.
     * Semua tamu yang sudah ada dianggap "hadir" - penerima ditandai manual
     * oleh admin, karena statusnya berbeda tiap edisi.
     */
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->enum('jenis', ['hadir', 'penerima'])->default('hadir')->after('acara_id');
            // Mis. "Positive News Maker". Kosong berarti tidak ditampilkan.
            $table->string('kategori_penghargaan')->nullable()->after('jenis');
        });
    }

    public function down(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropColumn(['jenis', 'kategori_penghargaan']);
        });
    }
};

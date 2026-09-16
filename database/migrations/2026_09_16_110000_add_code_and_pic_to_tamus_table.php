<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `code` dan `pic` sudah ada di basis data yang berjalan tapi tidak pernah
     * masuk migrasi, sehingga migrate:fresh menghasilkan skema yang membuat
     * TamuController::store dan daftar tamu rusak. Dijaga hasColumn supaya
     * tidak berbuat apa-apa di basis data yang sudah punya kolomnya.
     */
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            if (! Schema::hasColumn('tamus', 'code')) {
                $table->string('code')->nullable()->after('acara_id');
            }

            if (! Schema::hasColumn('tamus', 'pic')) {
                $table->string('pic')->nullable()->after('qr_code');
            }
        });
    }

    public function down(): void
    {
        // Sengaja tidak menghapus: kolomnya lebih tua dari migrasi ini dan
        // berisi data yang dipakai kode.
    }
};

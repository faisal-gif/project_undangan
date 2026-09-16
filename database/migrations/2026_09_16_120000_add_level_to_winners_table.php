<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom `level` (mis. NASIONAL, Kota Batu) dipakai data produksi tapi tidak
     * pernah masuk migrasi, sama seperti `code` dan `pic` di tabel tamus.
     */
    public function up(): void
    {
        Schema::table('winners', function (Blueprint $table) {
            if (! Schema::hasColumn('winners', 'level')) {
                $table->string('level')->nullable()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('winners', function (Blueprint $table) {
            if (Schema::hasColumn('winners', 'level')) {
                $table->dropColumn('level');
            }
        });
    }
};

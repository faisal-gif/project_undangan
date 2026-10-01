<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Video sorotan di halaman depan sebelumnya ditulis di dalam komponen
     * GuestHero. Dipindah ke data acara supaya bisa diganti dari admin.
     */
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('peta_url');
        });

        // Video yang selama ini tampil di hero.
        DB::table('acaras')
            ->where('aktif', true)
            ->update(['video_url' => 'https://www.youtube.com/watch?v=dv9VYYepFLo']);
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('video_url');
        });
    }
};

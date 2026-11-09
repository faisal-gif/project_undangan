<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Undangan kini bisa menerima konfirmasi kehadiran dari tamu, dan acara
     * bisa punya musik latar yang diputar saat undangan dibuka.
     */
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            // Terpisah dari kolom `status`, yang mencatat kehadiran sungguhan
            // saat QR dipindai di pintu masuk.
            $table->enum('rsvp', ['belum', 'hadir', 'berhalangan'])->default('belum')->after('status');
            $table->dateTime('rsvp_pada')->nullable()->after('rsvp');
        });

        Schema::table('acaras', function (Blueprint $table) {
            $table->string('musik_url')->nullable()->after('video_url');
        });
    }

    public function down(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropColumn(['rsvp', 'rsvp_pada']);
        });

        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('musik_url');
        });
    }
};

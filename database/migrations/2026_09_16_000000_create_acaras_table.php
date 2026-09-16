<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Satu baris acara aktif menggantikan tanggal & lokasi yang selama ini
     * ditulis tangan di halaman depan, undangan, widget, dan kartu QR.
     */
    public function up(): void
    {
        // Tiga tabel kerangka yang tidak pernah dipakai
        Schema::dropIfExists('tanggal_acaras');
        Schema::dropIfExists('undangans');
        Schema::dropIfExists('landings');

        Schema::create('acaras', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->default('Anugerah TIMES Indonesia');
            $table->dateTime('mulai');
            $table->dateTime('selesai')->nullable();
            $table->string('tempat')->nullable();
            $table->text('alamat')->nullable();
            $table->string('peta_url')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });

        DB::table('acaras')->insert([
            'nama' => 'Anugerah TIMES Indonesia',
            'mulai' => Carbon::parse('2026-11-27 18:00:00', 'Asia/Jakarta')->utc(),
            'selesai' => Carbon::parse('2026-11-27 21:00:00', 'Asia/Jakarta')->utc(),
            'tempat' => 'Grand Ballroom',
            'alamat' => 'Grand Mercure Malang Mirama, Jl. Raden Panji Suroso No.7, Purwodadi, Kec. Blimbing, Kota Malang, Jawa Timur 65126',
            'peta_url' => 'https://maps.app.goo.gl/3sfP2FmW4SqXBiWw5',
            'aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('acaras');

        foreach (['tanggal_acaras', 'undangans', 'landings'] as $name) {
            Schema::create($name, function (Blueprint $table) use ($name) {
                $table->id();
                if ($name === 'tanggal_acaras') {
                    $table->date('tanggal');
                }
                $table->timestamps();
            });
        }
    }
};

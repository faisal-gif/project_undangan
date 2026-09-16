<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tamu dipisahkan per edisi acara. Kolom, baris edisi 2025, dan pengisian
     * mundur harus satu berkas: hanya di jendela ini setiap acara_id yang NULL
     * pasti milik data lama.
     */
    public function up(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            // ponytail: nullable demi kelenturan; tamu ber-acara_id NULL tidak
            // muncul di daftar mana pun. Jadikan NOT NULL kalau pernah ada baris
            // NULL yang lolos.
            $table->foreignId('acara_id')->nullable()->after('id')
                ->constrained('acaras')->restrictOnDelete();
        });

        // Edisi 2025 yang sudah berlalu, tempatnya sama dengan edisi berikutnya.
        $acaraAda = DB::table('acaras')->orderBy('id')->first();

        $id2025 = DB::table('acaras')->insertGetId([
            'nama' => $acaraAda->nama ?? 'Anugerah TIMES Indonesia',
            'mulai' => Carbon::parse('2025-11-27 18:00:00', 'Asia/Jakarta')->utc(),
            'selesai' => Carbon::parse('2025-11-27 21:00:00', 'Asia/Jakarta')->utc(),
            'tempat' => $acaraAda->tempat ?? 'Grand Ballroom',
            'alamat' => $acaraAda->alamat ?? null,
            'peta_url' => $acaraAda->peta_url ?? null,
            'aktif' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tamus')->whereNull('acara_id')->update(['acara_id' => $id2025]);
    }

    public function down(): void
    {
        Schema::table('tamus', function (Blueprint $table) {
            $table->dropForeign(['acara_id']);
            $table->dropColumn('acara_id');
        });

        DB::table('acaras')->whereBetween('mulai', [
            Carbon::parse('2025-11-27 00:00:00', 'Asia/Jakarta')->utc(),
            Carbon::parse('2025-11-28 00:00:00', 'Asia/Jakarta')->utc(),
        ])->delete();
    }
};

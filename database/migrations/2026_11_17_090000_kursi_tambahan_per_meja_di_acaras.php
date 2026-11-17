<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Kursi tambahan sekarang ditentukan per meja, bukan sebagai satu angka.
 *
 * Dulu: kursi_tambahan = 3, dibagikan sendiri oleh sistem dari meja terakhir
 * mundur ke depan. Kini: {"5": 1, "12": 2}, yaitu meja mana persisnya yang
 * ditambahi dan sebanyak apa - karena yang tahu meja mana yang muat kursi
 * ketujuh adalah orang yang melihat ruangannya, bukan rumus.
 *
 * Pengisiannya memakai rumus lama persis, jadi acara yang sudah diatur tidak
 * berubah sedetik pun: kalau sebelumnya meja 27 yang berisi tujuh, sesudah
 * ini tetap meja 27. Itu penting - undangannya sudah dikirim dengan nomor
 * kursi, dan kursi ketujuh yang berpindah meja berarti satu tamu kehilangan
 * tempat duduknya.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->json('kursi_tambahan_meja')->nullable()->after('kursi_per_meja');
        });

        foreach (DB::table('acaras')->select('id', 'jumlah_meja', 'kursi_tambahan')->get() as $acara) {
            $peta = $this->bagikan((int) $acara->jumlah_meja, (int) $acara->kursi_tambahan);

            DB::table('acaras')
                ->where('id', $acara->id)
                ->update(['kursi_tambahan_meja' => $peta ? json_encode($peta) : null]);
        }

        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('kursi_tambahan');
        });
    }

    public function down(): void
    {
        Schema::table('acaras', function (Blueprint $table) {
            $table->unsignedSmallInteger('kursi_tambahan')->default(0)->after('kursi_per_meja');
        });

        // Arah sebaliknya kehilangan keterangan meja mana - satu angka memang
        // tidak bisa memuatnya. Yang dipertahankan jumlah totalnya, supaya
        // jumlah kursinya tetap sama walau pembagiannya kembali ke rumus.
        foreach (DB::table('acaras')->select('id', 'kursi_tambahan_meja')->get() as $acara) {
            $peta = json_decode((string) $acara->kursi_tambahan_meja, true) ?: [];

            DB::table('acaras')
                ->where('id', $acara->id)
                ->update(['kursi_tambahan' => array_sum(array_map('intval', $peta))]);
        }

        Schema::table('acaras', function (Blueprint $table) {
            $table->dropColumn('kursi_tambahan_meja');
        });
    }

    /**
     * Rumus lama: satu kursi per meja dari meja terakhir mundur ke depan,
     * dengan putaran penuh lebih dulu bila tambahannya melebihi jumlah meja.
     */
    private function bagikan(int $jumlahMeja, int $tambahan): array
    {
        if ($jumlahMeja < 1 || $tambahan < 1) {
            return [];
        }

        $putaran = intdiv($tambahan, $jumlahMeja);
        $sisa = $tambahan % $jumlahMeja;
        $peta = [];

        for ($meja = 1; $meja <= $jumlahMeja; $meja++) {
            $jumlah = $putaran + ($meja > $jumlahMeja - $sisa ? 1 : 0);

            if ($jumlah > 0) {
                $peta[(string) $meja] = $jumlah;
            }
        }

        return $peta;
    }
};

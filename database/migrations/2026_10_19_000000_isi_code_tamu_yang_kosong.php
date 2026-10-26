<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Tautan undangan sekarang memakai kolom `code`, jadi tamu tanpa kode tidak
     * punya tautan sama sekali. Isi yang masih kosong dengan kode acak unik.
     */
    public function up(): void
    {
        $terpakai = DB::table('tamus')->whereNotNull('code')->pluck('code')->flip();

        DB::table('tamus')->whereNull('code')->orWhere('code', '')->orderBy('id')
            ->each(function ($tamu) use (&$terpakai) {
                do {
                    $kode = strtoupper(Str::random(8));
                } while ($terpakai->has($kode));

                $terpakai->put($kode, true);

                DB::table('tamus')->where('id', $tamu->id)->update(['code' => $kode]);
            });
    }

    public function down(): void
    {
        // Kode yang sudah diisi tidak dikosongkan lagi: tautan undangan
        // bergantung padanya.
    }
};

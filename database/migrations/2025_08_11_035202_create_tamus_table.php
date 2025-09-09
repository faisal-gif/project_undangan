<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tamus', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->nullable();
            $table->text('alamat')->nullable();
            $table->string('telepon')->nullable();
            $table->string('email')->nullable();
            $table->string('tempat_tanggal_lahir')->nullable();
            $table->string('kartu_identitas')->nullable();
            $table->string('no_kartu_identitas')->nullable();
            $table->string('golongan_darah')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('nomor_kontak_darurat')->nullable();
            $table->string('nama_kontak_darurat')->nullable();
            $table->string('hubungan_kontak_darurat')->nullable();
            $table->string('nama_komunitas')->nullable();
            $table->string('penyakit')->nullable();
            $table->string('term')->nullable();
            $table->string('bukti_pembayaran')->nullable();
            $table->string('atas_nama')->nullable();
            $table->string('ukuran_jersey')->nullable();
            $table->string('apakah_penyandang_disabilitas')->nullable();
            $table->string('qrcode')->nullable();
            $table->enum('status', ['ambil', 'belum'])->default('belum');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tamus');
    }
};

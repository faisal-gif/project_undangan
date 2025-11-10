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
            $table->string('lembaga')->nullable();
            $table->text('alamat')->nullable();
            $table->string('is_register')->nullable();
            $table->string('telepon')->nullable();
            $table->integer('jumlah_orang')->nullable();
            $table->string('qr_code')->nullable();
            $table->enum('status', ['datang', 'belum'])->default('belum');
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

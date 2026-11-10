<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // firstOrCreate, bukan create: seeder ini dijalankan berulang di atas
        // basis data yang sudah berisi. Kata sandi yang ada tidak ditimpa -
        // hanya dipakai saat akun admin memang belum ada.
        User::firstOrCreate(
            ['email' => 'admin@times.com'],
            [
                'name' => 'Admin',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ]
        );

        // Sepuluh pengguna contoh hanya untuk basis data yang masih kosong.
        // Tanpa penjaga ini, tiap kali seeder dijalankan akan menumpuk sepuluh
        // akun palsu lagi di daftar pengguna yang sebenarnya.
        if (User::count() <= 1) {
            User::factory(10)->create();
        }

        // Data nyata dari produksi; semuanya aman dijalankan berulang.
        $this->call([
            WinnersSeeder::class,
            TamuSeeder::class,
            PemenangUndanganSeeder::class,
        ]);
    }
}

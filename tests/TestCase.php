<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Pengaman: kalau config sedang di-cache (bootstrap/cache/config.php), env
     * dari phpunit.xml diabaikan dan tes berjalan di basis data sungguhan -
     * RefreshDatabase akan menghapus seluruh isinya.
     *
     * Pemeriksaan ini harus mendahului parent::setUp(), karena di situlah
     * RefreshDatabase menjalankan migrate:fresh. Cek berkasnya langsung, bukan
     * lewat config(), sebab aplikasi belum dinyalakan di titik ini.
     */
    protected function setUp(): void
    {
        $cache = __DIR__ . '/../bootstrap/cache/config.php';

        if (file_exists($cache)) {
            throw new RuntimeException(
                'Tes dihentikan: config sedang di-cache, sehingga phpunit.xml diabaikan '
                    . 'dan tes akan menghapus basis data sungguhan. Jalankan dulu: php artisan config:clear'
            );
        }

        parent::setUp();
    }
}

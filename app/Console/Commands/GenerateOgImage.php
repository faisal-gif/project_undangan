<?php

namespace App\Console\Commands;

use App\Models\Acara;
use Illuminate\Console\Command;

/**
 * Membuat ulang public/og-image.jpg - gambar yang muncul saat tautan situs
 * dibagikan ke WhatsApp, Facebook, atau X. Nama dan tahunnya diambil dari
 * acara aktif, jadi jalankan lagi setiap kali edisi acaranya berganti.
 */
class GenerateOgImage extends Command
{
    protected $signature = 'og:generate';

    protected $description = 'Membuat ulang gambar pratinjau tautan (og-image.jpg) dari acara aktif';

    private const LEBAR = 1200;
    private const TINGGI = 630;

    public function handle(): int
    {
        if (! extension_loaded('gd')) {
            $this->error('Ekstensi GD tidak aktif.');

            return self::FAILURE;
        }

        $acara = Acara::aktif();
        $serif = base_path('vendor/dompdf/dompdf/lib/fonts/DejaVuSerif-Bold.ttf');
        $sans = base_path('vendor/dompdf/dompdf/lib/fonts/DejaVuSans.ttf');

        if (! is_file($serif) || ! is_file($sans)) {
            $this->error('Berkas font DejaVu tidak ditemukan di vendor/dompdf.');

            return self::FAILURE;
        }

        $kanvas = $this->latarPanggung(public_path('bg-ati.jpg'));

        $emas = imagecolorallocate($kanvas, 0xF0, 0xD2, 0x8C);
        $krem = imagecolorallocate($kanvas, 0xF7, 0xED, 0xE0);

        // Medali di atas, nama acara di tengah, tanggal di bawah.
        $this->tempelMedali($kanvas, public_path('logo-ati-kosongan.png'));
        $this->redupkanBawah($kanvas);

        $this->tengah($kanvas, 54, 430, $krem, $serif, 'ANUGERAH');
        $this->tengah($kanvas, 54, 496, $emas, $serif, mb_strtoupper($this->namaTanpaAnugerah($acara)));

        if ($acara?->toShare()['tanggal_label'] ?? null) {
            $bagi = $acara->toShare();
            $baris = trim($bagi['tanggal_label'] . ($bagi['tempat'] ? ' · ' . $bagi['tempat'] : ''));
            $this->tengah($kanvas, 22, 556, $krem, $sans, $baris);
        }

        imagejpeg($kanvas, public_path('og-image.jpg'), 88);
        imagedestroy($kanvas);

        $this->info('public/og-image.jpg diperbarui (' . self::LEBAR . 'x' . self::TINGGI . ').');

        return self::SUCCESS;
    }

    /**
     * Potong latar panggung ke rasio 1200x630 dari bagian tengah.
     */
    private function latarPanggung(string $path): \GdImage
    {
        $sumber = imagecreatefromjpeg($path);
        $sl = imagesx($sumber);
        $st = imagesy($sumber);

        $rasio = max(self::LEBAR / $sl, self::TINGGI / $st);
        $pl = (int) round(self::LEBAR / $rasio);
        $pt = (int) round(self::TINGGI / $rasio);

        $kanvas = imagecreatetruecolor(self::LEBAR, self::TINGGI);
        imagecopyresampled(
            $kanvas,
            $sumber,
            0,
            0,
            (int) round(($sl - $pl) / 2),
            (int) round(($st - $pt) / 2),
            self::LEBAR,
            self::TINGGI,
            $pl,
            $pt
        );
        imagedestroy($sumber);

        return $kanvas;
    }

    /**
     * Redupkan bagian bawah secara bertahap supaya teks emas tetap terbaca di
     * atas sinar panggung yang terang.
     */
    private function redupkanBawah(\GdImage $kanvas): void
    {
        $mulai = 330;

        for ($y = $mulai; $y < self::TINGGI; $y++) {
            $bagian = ($y - $mulai) / (self::TINGGI - $mulai);
            $alpha = (int) round(127 - (0.72 * 127 * min(1, $bagian * 1.6)));
            $warna = imagecolorallocatealpha($kanvas, 0x12, 0x06, 0x0A, max(0, $alpha));
            imageline($kanvas, 0, $y, self::LEBAR, $y, $warna);
        }
    }

    private function tempelMedali(\GdImage $kanvas, string $path): void
    {
        $logo = imagecreatefrompng($path);
        $lebar = 230;
        $tinggi = (int) round(imagesy($logo) * ($lebar / imagesx($logo)));

        imagecopyresampled(
            $kanvas,
            $logo,
            (int) ((self::LEBAR - $lebar) / 2),
            110,
            0,
            0,
            $lebar,
            $tinggi,
            imagesx($logo),
            imagesy($logo)
        );
        imagedestroy($logo);
    }

    /**
     * Tulis teks di tengah. Ukuran huruf mengecil sendiri sampai muat di dalam
     * margin, supaya nama acara yang panjang tidak menyentuh tepi gambar.
     */
    private function tengah(\GdImage $kanvas, int $ukuran, int $y, int $warna, string $font, string $teks): void
    {
        $maksimal = self::LEBAR - 280;

        do {
            $kotak = imagettfbbox($ukuran, 0, $font, $teks);
            $lebar = $kotak[2] - $kotak[0];

            if ($lebar <= $maksimal || $ukuran <= 12) {
                break;
            }

            $ukuran--;
        } while (true);

        imagettftext($kanvas, $ukuran, 0, (int) ((self::LEBAR - $lebar) / 2), $y, $warna, $font, $teks);
    }

    /**
     * "Anugerah TIMES Indonesia" -> "TIMES Indonesia", supaya tidak mengulang
     * kata Anugerah yang sudah jadi baris pertama.
     */
    private function namaTanpaAnugerah(?Acara $acara): string
    {
        $nama = $acara?->nama ?: 'TIMES Indonesia';
        $sisa = trim(preg_replace('/^anugerah\s*/i', '', $nama));
        $tahun = $acara?->mulai?->timezone(Acara::ZONA)->year;

        return trim(($sisa ?: 'TIMES Indonesia') . ' ' . $tahun);
    }
}

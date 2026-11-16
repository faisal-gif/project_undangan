<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tamu extends Model
{
    protected $guarded = [];

    /**
     * Samakan dengan nilai bawaan kolomnya, supaya model yang baru dibuat
     * sudah berjenis "hadir" di memori - bukan null sampai dimuat ulang.
     */
    protected $attributes = [
        'jenis' => 'hadir',
        'rsvp' => 'belum',
    ];

    protected $casts = [
        'rsvp_pada' => 'datetime',
    ];

    public function acara(): BelongsTo
    {
        return $this->belongsTo(Acara::class);
    }

    /**
     * Tamu ini penerima penghargaan, bukan sekadar hadir.
     */
    public function penerima(): bool
    {
        return $this->jenis === 'penerima';
    }

    /**
     * Tempat duduk dalam satu baris, mis. "Meja 5 - Kursi 3, 4".
     *
     * Mejanya boleh ada tanpa kursi (penempatan belum rinci), tapi kursi tanpa
     * meja tidak berarti apa-apa bagi tamu - karena itu ikut disembunyikan.
     */
    public function tempatDuduk(): ?string
    {
        $peta = $this->dudukPerMeja();

        if (! $peta) {
            return null;
        }

        $baris = [];

        foreach ($peta as $meja => $nomor) {
            $baris[] = 'Meja '.$meja.($nomor ? ' - Kursi '.implode(', ', $nomor) : '');
        }

        return implode('; ', $baris);
    }

    /**
     * Tempat duduk sebagai peta meja => nomor kursi, mis. ['3' => ['1', '2']].
     *
     * Satu undangan boleh terbelah ke beberapa meja: kuota 2 bisa diisi satu
     * orang di meja 3 dan satu lagi di meja 7. Selama semuanya di satu meja,
     * bentuk simpanannya tetap seperti dulu - meja "3", kursi "1, 2" - jadi
     * baris yang undangannya sudah terkirim tidak pernah ditulis ulang ke
     * bentuk baru tanpa alasan. Begitu terbelah, tiap kursi membawa nama
     * mejanya sendiri: meja "3, 7", kursi "3:1, 7:5".
     */
    public function dudukPerMeja(): array
    {
        return self::pecahTempat($this->meja, $this->kursi);
    }

    public static function pecahTempat(?string $meja, ?string $kursi): array
    {
        $mejas = [];

        foreach (self::pecahDaftar($meja) as $m) {
            $kunci = self::kunciMeja($m);

            if ($kunci !== '' && ! in_array($kunci, $mejas, true)) {
                $mejas[] = $kunci;
            }
        }

        if (! $mejas) {
            return [];
        }

        $peta = array_fill_keys($mejas, []);

        foreach (self::pecahDaftar($kursi) as $bagian) {
            // "3:1" membawa nama mejanya sendiri; "1" polos menempel ke meja
            // satu-satunya - bentuk lama yang masih dipakai mayoritas baris.
            if (str_contains($bagian, ':')) {
                [$m, $sisa] = array_map('trim', explode(':', $bagian, 2));
                $m = self::kunciMeja($m);
            } else {
                $m = $mejas[0];
                $sisa = $bagian;
            }

            // Kursi yang menyebut meja di luar kolom meja diabaikan, bukan
            // ditambahkan: kolom meja yang menentukan tamu ini ada di mana.
            if (! array_key_exists($m, $peta)) {
                continue;
            }

            foreach (self::pecahKursi($sisa) as $nomor) {
                if (! in_array($nomor, $peta[$m], true)) {
                    $peta[$m][] = $nomor;
                }
            }
        }

        return $peta;
    }

    /**
     * Susun kembali kolom meja dan kursi dari peta hasil pecahTempat().
     */
    public static function rangkaiTempat(array $peta): array
    {
        $peta = array_filter($peta, fn ($m) => (string) $m !== '', ARRAY_FILTER_USE_KEY);

        if (! $peta) {
            return ['meja' => null, 'kursi' => null];
        }

        $mejas = array_keys($peta);
        $kursi = [];

        foreach ($peta as $meja => $nomor) {
            foreach ($nomor as $n) {
                // Nama meja hanya ditulis saat benar-benar terbelah, supaya
                // penempatan biasa tetap berbentuk "1, 2" seperti sebelumnya.
                $kursi[] = count($mejas) > 1 ? $meja.':'.$n : (string) $n;
            }
        }

        return [
            'meja' => implode(', ', $mejas),
            'kursi' => $kursi ? implode(', ', $kursi) : null,
        ];
    }

    /**
     * Nomor kursi tamu ini di satu meja tertentu.
     */
    public function kursiDi(string|int $meja): array
    {
        return $this->dudukPerMeja()[self::kunciMeja((string) $meja)] ?? [];
    }

    /**
     * Meja yang ditempati tamu ini, namanya sudah dinormalkan.
     */
    public function mejaDitempati(): array
    {
        return array_map('strval', array_keys($this->dudukPerMeja()));
    }

    /**
     * Berapa orang dari kuota undangan ini yang sudah punya kursi.
     *
     * Dihitung per meja, bukan dari nomorKursi(): kursi 1 di meja 1 dan
     * kursi 1 di meja 2 adalah dua tempat duduk, dan menyamakan keduanya
     * membuat separuh rombongan terbelah hilang dari hitungan.
     */
    public function kursiTerisi(): int
    {
        return array_sum(array_map('count', $this->dudukPerMeja()));
    }

    /**
     * Sisa orang yang belum kebagian kursi di mana pun.
     */
    public function sisaKursi(): int
    {
        return max(0, (int) ($this->jumlah_orang ?: 1) - $this->kursiTerisi());
    }

    /**
     * Nomor kursi sebagai daftar, supaya "3, 4" dan "3-4" bisa dibandingkan
     * antar tamu untuk mencari bentrokan.
     *
     * Mengumpulkan seluruh meja - untuk membandingkan bentrokan, pakai
     * kursiDi() yang tahu kursi nomor 1 di meja 3 bukan kursi 1 di meja 7.
     */
    public function nomorKursi(): array
    {
        $semua = [];

        foreach ($this->dudukPerMeja() as $nomor) {
            foreach ($nomor as $n) {
                $semua[] = $n;
            }
        }

        return array_values(array_unique($semua));
    }

    public static function pecahKursi(?string $kursi): array
    {
        if (blank($kursi)) {
            return [];
        }

        $bagian = preg_split('/[^\p{L}\p{N}]+/u', mb_strtoupper(trim($kursi)), -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_unique($bagian ?: []));
    }

    /**
     * Pecah daftar bertanda koma tanpa menyentuh isi tiap bagiannya - nama
     * meja boleh berspasi ("VIP 2") dan kursi boleh berawalan ("3:1").
     */
    public static function pecahDaftar(?string $teks): array
    {
        if (blank($teks)) {
            return [];
        }

        return array_values(array_filter(
            array_map('trim', explode(',', $teks)),
            fn ($s) => $s !== ''
        ));
    }

    /**
     * Nama meja yang dipakai sebagai kunci: "vip 1" dan "VIP 1" satu meja.
     */
    public static function kunciMeja(string $meja): string
    {
        return mb_strtoupper(trim($meja));
    }

    /**
     * Batasi ke satu edisi acara.
     */
    public function scopeEdisi(Builder $query, Acara|int|null $acara): Builder
    {
        return $query->where('acara_id', $acara instanceof Acara ? $acara->id : $acara);
    }
}

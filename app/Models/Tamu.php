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
        if (blank($this->meja)) {
            return null;
        }

        $teks = 'Meja ' . $this->meja;

        return blank($this->kursi) ? $teks : $teks . ' - Kursi ' . $this->kursi;
    }

    /**
     * Nomor kursi sebagai daftar, supaya "3, 4" dan "3-4" bisa dibandingkan
     * antar tamu untuk mencari bentrokan.
     */
    public function nomorKursi(): array
    {
        return self::pecahKursi($this->kursi);
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
     * Batasi ke satu edisi acara.
     */
    public function scopeEdisi(Builder $query, Acara|int|null $acara): Builder
    {
        return $query->where('acara_id', $acara instanceof Acara ? $acara->id : $acara);
    }
}

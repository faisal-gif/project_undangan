<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Acara extends Model
{
    public const ZONA = 'Asia/Jakarta';

    protected $fillable = [
        'nama',
        'mulai',
        'selesai',
        'tempat',
        'alamat',
        'peta_url',
        'aktif',
    ];

    protected $casts = [
        'mulai' => 'datetime',
        'selesai' => 'datetime',
        'aktif' => 'boolean',
    ];

    public function tamus(): HasMany
    {
        return $this->hasMany(Tamu::class);
    }

    /**
     * Acara yang sedang aktif. Hanya satu yang dipakai di seluruh situs.
     */
    public static function aktif(): ?self
    {
        return static::where('aktif', true)->latest('mulai')->first();
    }

    /**
     * Edisi yang sedang dibuka admin. Dari ?acara=ID, jatuh ke edisi aktif
     * kalau kosong atau tidak ditemukan. Hanya untuk layar daftar - yang
     * menentukan perilaku situs tetap aktif().
     */
    public static function dilihat(?int $id = null): ?self
    {
        return ($id ? static::find($id) : null) ?? static::aktif();
    }

    /**
     * Label pendek untuk judul dan pilihan dropdown, mis. "ATI 2025".
     */
    public function label(): string
    {
        return 'ATI ' . $this->mulai?->timezone(self::ZONA)->year;
    }

    /**
     * Bentuk yang dikirim ke halaman. mulai_iso membawa offset +07:00 supaya
     * hitung mundur menunjuk saat yang sama di zona waktu mana pun.
     */
    public function toShare(): array
    {
        $mulai = $this->mulai?->timezone(self::ZONA);
        $selesai = $this->selesai?->timezone(self::ZONA);

        return [
            'nama' => $this->nama,
            'tahun' => $mulai?->year,
            'mulai_iso' => $mulai?->toIso8601String(),
            'selesai_iso' => $selesai?->toIso8601String(),
            'tanggal_label' => $mulai?->locale('id')->translatedFormat('l, j F Y'),
            'tanggal_singkat' => $mulai?->locale('id')->translatedFormat('j F Y'),
            'jam_label' => $this->jamLabel(),
            'tempat' => $this->tempat,
            'alamat' => $this->alamat,
            'peta_url' => $this->peta_url,
        ];
    }

    private function jamLabel(): ?string
    {
        $mulai = $this->mulai?->timezone(self::ZONA);

        if (! $mulai) {
            return null;
        }

        $selesai = $this->selesai?->timezone(self::ZONA);

        return $selesai
            ? $mulai->format('H:i') . ' - ' . $selesai->format('H:i') . ' WIB'
            : $mulai->format('H:i') . ' WIB';
    }
}

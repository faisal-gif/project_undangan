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
     * Batasi ke satu edisi acara.
     */
    public function scopeEdisi(Builder $query, Acara|int|null $acara): Builder
    {
        return $query->where('acara_id', $acara instanceof Acara ? $acara->id : $acara);
    }
}

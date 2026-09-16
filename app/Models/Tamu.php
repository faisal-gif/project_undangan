<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tamu extends Model
{
    protected $guarded = [];

    public function acara(): BelongsTo
    {
        return $this->belongsTo(Acara::class);
    }

    /**
     * Batasi ke satu edisi acara.
     */
    public function scopeEdisi(Builder $query, Acara|int|null $acara): Builder
    {
        return $query->where('acara_id', $acara instanceof Acara ? $acara->id : $acara);
    }
}

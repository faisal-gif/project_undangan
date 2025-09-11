<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tamu extends Model
{
    protected $guarded = [];

    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class, 'tamu_id')->latest();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Borrower extends Model
{
    protected $fillable = [
        'full_name',
        'address',
        'contact_number',
        'valid_id_path',
        'date_registered',
        'notes',
        'status',
    ];

    protected $casts = [
        'date_registered' => 'date',
    ];

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function activeLoans()
    {
        return $this->hasMany(Loan::class)->where('status', 'ongoing');
    }

    public function getTotalOutstandingAttribute()
    {
        return $this->loans()->where('status', 'ongoing')->sum('remaining_balance');
    }
}

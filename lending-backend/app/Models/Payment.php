<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'loan_id',
        'payment_date',
        'amount_paid',
        'balance_after',
        'is_late',
        'remarks',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount_paid' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'is_late' => 'boolean',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }
}

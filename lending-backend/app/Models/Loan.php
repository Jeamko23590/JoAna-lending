<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    protected $fillable = [
        'borrower_id',
        'loan_amount',
        'interest_amount',
        'loan_term',
        'term_type',
        'release_date',
        'due_date',
        'total_interest',
        'total_payable',
        'payment_per_period',
        'remaining_balance',
        'status',
    ];

    protected $casts = [
        'release_date' => 'date',
        'due_date' => 'date',
        'loan_amount' => 'decimal:2',
        'interest_amount' => 'decimal:2',
        'total_interest' => 'decimal:2',
        'total_payable' => 'decimal:2',
        'payment_per_period' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
    ];

    public function borrower()
    {
        return $this->belongsTo(Borrower::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getTotalPaidAttribute()
    {
        return $this->payments()->sum('amount_paid');
    }

    public function getRemainingPeriodsAttribute()
    {
        if ($this->payment_per_period <= 0) return 0;
        return ceil($this->remaining_balance / $this->payment_per_period);
    }

    public function checkOverdue()
    {
        if ($this->status === 'ongoing' && $this->due_date < now()) {
            $this->update(['status' => 'overdue']);
        }
    }
}

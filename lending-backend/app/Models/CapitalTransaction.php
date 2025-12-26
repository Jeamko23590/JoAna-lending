<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CapitalTransaction extends Model
{
    protected $fillable = [
        'type',
        'amount',
        'balance_after',
        'description',
        'reference_id',
        'reference_type',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public static function getCurrentBalance(): float
    {
        $latest = self::orderBy('id', 'desc')->first();
        return $latest ? (float) $latest->balance_after : 0;
    }

    public static function addTransaction(string $type, float $amount, ?string $description = null, ?int $referenceId = null, ?string $referenceType = null): self
    {
        $currentBalance = self::getCurrentBalance();
        
        $newBalance = match($type) {
            'deposit', 'payment_received' => $currentBalance + $amount,
            'withdrawal', 'loan_release' => $currentBalance - $amount,
            default => $currentBalance,
        };

        return self::create([
            'type' => $type,
            'amount' => $amount,
            'balance_after' => $newBalance,
            'description' => $description,
            'reference_id' => $referenceId,
            'reference_type' => $referenceType,
        ]);
    }
}

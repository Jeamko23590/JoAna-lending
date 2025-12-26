<?php

namespace App\Http\Controllers;

use App\Models\CapitalTransaction;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class CapitalController extends Controller
{
    public function index(Request $request)
    {
        $query = CapitalTransaction::query();

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('created_at', 'desc')
                             ->paginate($request->per_page ?? 20);

        return response()->json($transactions);
    }

    public function balance()
    {
        $balance = CapitalTransaction::getCurrentBalance();
        
        $totalDeposits = CapitalTransaction::where('type', 'deposit')->sum('amount');
        $totalWithdrawals = CapitalTransaction::where('type', 'withdrawal')->sum('amount');
        $totalLoansReleased = CapitalTransaction::where('type', 'loan_release')->sum('amount');
        $totalPaymentsReceived = CapitalTransaction::where('type', 'payment_received')->sum('amount');

        return response()->json([
            'current_balance' => $balance,
            'total_deposits' => $totalDeposits,
            'total_withdrawals' => $totalWithdrawals,
            'total_loans_released' => $totalLoansReleased,
            'total_payments_received' => $totalPaymentsReceived,
        ]);
    }

    public function deposit(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string|max:255',
        ]);

        $transaction = CapitalTransaction::addTransaction(
            'deposit',
            $validated['amount'],
            $validated['description'] ?? 'Capital deposit'
        );

        ActivityLogService::log('capital_deposit', 'CapitalTransaction', $transaction->id, null, $transaction->toArray());

        return response()->json([
            'message' => 'Capital deposited successfully',
            'transaction' => $transaction,
            'new_balance' => $transaction->balance_after,
        ], 201);
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string|max:255',
        ]);

        $currentBalance = CapitalTransaction::getCurrentBalance();

        if ($validated['amount'] > $currentBalance) {
            return response()->json([
                'message' => 'Insufficient capital balance',
                'current_balance' => $currentBalance,
            ], 422);
        }

        $transaction = CapitalTransaction::addTransaction(
            'withdrawal',
            $validated['amount'],
            $validated['description'] ?? 'Capital withdrawal'
        );

        ActivityLogService::log('capital_withdrawal', 'CapitalTransaction', $transaction->id, null, $transaction->toArray());

        return response()->json([
            'message' => 'Capital withdrawn successfully',
            'transaction' => $transaction,
            'new_balance' => $transaction->balance_after,
        ], 201);
    }
}

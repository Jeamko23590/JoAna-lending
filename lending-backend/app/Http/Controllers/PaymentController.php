<?php

namespace App\Http\Controllers;

use App\Models\CapitalTransaction;
use App\Models\Loan;
use App\Models\Payment;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['loan.borrower']);

        if ($request->loan_id) {
            $query->where('loan_id', $request->loan_id);
        }

        if ($request->date_from) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        $payments = $query->orderBy('payment_date', 'desc')
                         ->paginate($request->per_page ?? 15);

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'loan_id' => 'required|exists:loans,id',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string',
        ]);

        $loan = Loan::findOrFail($validated['loan_id']);

        if ($validated['amount_paid'] > $loan->remaining_balance) {
            return response()->json([
                'message' => 'Payment amount exceeds remaining balance',
            ], 422);
        }

        $isLate = $validated['payment_date'] > $loan->due_date->format('Y-m-d');
        $balanceAfter = $loan->remaining_balance - $validated['amount_paid'];

        $payment = Payment::create([
            'loan_id' => $validated['loan_id'],
            'payment_date' => $validated['payment_date'],
            'amount_paid' => $validated['amount_paid'],
            'balance_after' => $balanceAfter,
            'is_late' => $isLate,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $loan->update([
            'remaining_balance' => $balanceAfter,
            'status' => $balanceAfter <= 0 ? 'fully_paid' : $loan->status,
        ]);

        // Add payment to capital
        CapitalTransaction::addTransaction(
            'payment_received',
            $validated['amount_paid'],
            'Payment from ' . $loan->borrower->full_name,
            $payment->id,
            'Payment'
        );

        ActivityLogService::log('created', 'Payment', $payment->id, null, $payment->toArray());

        return response()->json($payment->load('loan.borrower'), 201);
    }

    public function show(Payment $payment)
    {
        $payment->load(['loan.borrower']);
        return response()->json($payment);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string',
        ]);

        $oldValues = $payment->toArray();
        $loan = $payment->loan;

        $difference = $validated['amount_paid'] - $payment->amount_paid;
        $newBalance = $loan->remaining_balance - $difference;

        if ($newBalance < 0) {
            return response()->json([
                'message' => 'Payment amount exceeds remaining balance',
            ], 422);
        }

        $isLate = $validated['payment_date'] > $loan->due_date->format('Y-m-d');

        $payment->update([
            'payment_date' => $validated['payment_date'],
            'amount_paid' => $validated['amount_paid'],
            'balance_after' => $newBalance,
            'is_late' => $isLate,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $loan->update([
            'remaining_balance' => $newBalance,
            'status' => $newBalance <= 0 ? 'fully_paid' : ($loan->due_date < now() ? 'overdue' : 'ongoing'),
        ]);

        ActivityLogService::log('updated', 'Payment', $payment->id, $oldValues, $payment->toArray());

        return response()->json($payment->load('loan.borrower'));
    }

    public function destroy(Payment $payment)
    {
        $oldValues = $payment->toArray();
        $loan = $payment->loan;

        $newBalance = $loan->remaining_balance + $payment->amount_paid;

        $loan->update([
            'remaining_balance' => $newBalance,
            'status' => $loan->due_date < now() ? 'overdue' : 'ongoing',
        ]);

        $payment->delete();

        ActivityLogService::log('deleted', 'Payment', $payment->id, $oldValues);

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}

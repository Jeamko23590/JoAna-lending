<?php

namespace App\Http\Controllers;

use App\Models\CapitalTransaction;
use App\Models\Loan;
use App\Services\ActivityLogService;
use App\Services\LoanCalculatorService;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::with('borrower');

        if ($request->search) {
            $query->whereHas('borrower', function ($q) use ($request) {
                $q->where('full_name', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->borrower_id) {
            $query->where('borrower_id', $request->borrower_id);
        }

        $loans = $query->orderBy('created_at', 'desc')
                      ->paginate($request->per_page ?? 15);

        return response()->json($loans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'borrower_id' => 'required|exists:borrowers,id',
            'loan_amount' => 'required|numeric|min:1',
            'interest_amount' => 'required|numeric|min:0',
            'loan_term' => 'required|integer|min:1',
            'term_type' => 'required|in:daily,semi_monthly,weeks,months',
            'release_date' => 'required|date',
        ]);

        // Check if there's enough capital
        $currentCapital = CapitalTransaction::getCurrentBalance();
        if ($validated['loan_amount'] > $currentCapital) {
            return response()->json([
                'message' => 'Insufficient capital. Available: ₱' . number_format($currentCapital, 2),
                'available_capital' => $currentCapital,
            ], 422);
        }

        $calculation = LoanCalculatorService::calculate(
            $validated['loan_amount'],
            $validated['interest_amount'],
            $validated['loan_term']
        );

        $validated['total_interest'] = $calculation['total_interest'];
        $validated['total_payable'] = $calculation['total_payable'];
        $validated['payment_per_period'] = $calculation['payment_per_period'];
        $validated['remaining_balance'] = $calculation['total_payable'];
        $validated['due_date'] = LoanCalculatorService::calculateDueDate(
            $validated['release_date'],
            $validated['loan_term'],
            $validated['term_type']
        );
        $validated['status'] = 'ongoing';

        $loan = Loan::create($validated);

        // Deduct from capital
        CapitalTransaction::addTransaction(
            'loan_release',
            $validated['loan_amount'],
            'Loan released to ' . $loan->borrower->full_name,
            $loan->id,
            'Loan'
        );

        ActivityLogService::log('created', 'Loan', $loan->id, null, $loan->toArray());

        return response()->json($loan->load('borrower'), 201);
    }

    public function show(Loan $loan)
    {
        $loan->load(['borrower', 'payments']);
        
        // Add payment schedule
        $loan->payment_schedule = LoanCalculatorService::getPaymentSchedule(
            $loan->release_date->format('Y-m-d'),
            $loan->loan_term,
            $loan->term_type,
            $loan->payment_per_period
        );

        return response()->json($loan);
    }

    public function update(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'loan_amount' => 'required|numeric|min:1',
            'interest_amount' => 'required|numeric|min:0',
            'loan_term' => 'required|integer|min:1',
            'term_type' => 'required|in:daily,semi_monthly,weeks,months',
            'release_date' => 'required|date',
            'status' => 'required|in:ongoing,fully_paid,overdue',
        ]);

        $oldValues = $loan->toArray();

        $calculation = LoanCalculatorService::calculate(
            $validated['loan_amount'],
            $validated['interest_amount'],
            $validated['loan_term']
        );

        $totalPaid = $loan->payments()->sum('amount_paid');
        
        $validated['total_interest'] = $calculation['total_interest'];
        $validated['total_payable'] = $calculation['total_payable'];
        $validated['payment_per_period'] = $calculation['payment_per_period'];
        $validated['remaining_balance'] = $calculation['total_payable'] - $totalPaid;
        $validated['due_date'] = LoanCalculatorService::calculateDueDate(
            $validated['release_date'],
            $validated['loan_term'],
            $validated['term_type']
        );

        $loan->update($validated);

        ActivityLogService::log('updated', 'Loan', $loan->id, $oldValues, $loan->toArray());

        return response()->json($loan->load('borrower'));
    }

    public function destroy(Loan $loan)
    {
        $oldValues = $loan->toArray();
        $loan->delete();

        ActivityLogService::log('deleted', 'Loan', $loan->id, $oldValues);

        return response()->json(['message' => 'Loan deleted successfully']);
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'loan_amount' => 'required|numeric|min:1',
            'interest_amount' => 'required|numeric|min:0',
            'loan_term' => 'required|integer|min:1',
            'term_type' => 'required|in:daily,semi_monthly,weeks,months',
            'release_date' => 'required|date',
        ]);

        $calculation = LoanCalculatorService::calculate(
            $request->loan_amount,
            $request->interest_amount,
            $request->loan_term
        );

        $dueDate = LoanCalculatorService::calculateDueDate(
            $request->release_date,
            $request->loan_term,
            $request->term_type
        );

        $schedule = LoanCalculatorService::getPaymentSchedule(
            $request->release_date,
            $request->loan_term,
            $request->term_type,
            $calculation['payment_per_period']
        );

        return response()->json([
            ...$calculation,
            'due_date' => $dueDate,
            'payment_schedule' => $schedule,
        ]);
    }
}

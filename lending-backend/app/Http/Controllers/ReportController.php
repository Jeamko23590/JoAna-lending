<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Loan;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function dailyCollections(Request $request)
    {
        $date = $request->date ?? now()->format('Y-m-d');

        $payments = Payment::with('loan.borrower')
            ->whereDate('payment_date', $date)
            ->orderBy('created_at', 'desc')
            ->get();

        $total = $payments->sum('amount_paid');

        return response()->json([
            'date' => $date,
            'payments' => $payments,
            'total' => $total,
        ]);
    }

    public function monthlyIncome(Request $request)
    {
        $month = $request->month ?? now()->month;
        $year = $request->year ?? now()->year;

        $payments = Payment::with('loan.borrower')
            ->whereYear('payment_date', $year)
            ->whereMonth('payment_date', $month)
            ->orderBy('payment_date', 'desc')
            ->get();

        $totalCollections = $payments->sum('amount_paid');

        $loansReleased = Loan::whereYear('release_date', $year)
            ->whereMonth('release_date', $month)
            ->sum('loan_amount');

        $interestEarned = Loan::whereYear('release_date', $year)
            ->whereMonth('release_date', $month)
            ->sum('total_interest');

        return response()->json([
            'month' => $month,
            'year' => $year,
            'total_collections' => $totalCollections,
            'loans_released' => $loansReleased,
            'interest_earned' => $interestEarned,
            'payments' => $payments,
        ]);
    }

    public function borrowerLedger(Request $request, Borrower $borrower)
    {
        $borrower->load(['loans.payments']);

        $ledger = [];
        foreach ($borrower->loans as $loan) {
            $ledger[] = [
                'loan' => $loan,
                'payments' => $loan->payments,
                'total_paid' => $loan->payments->sum('amount_paid'),
                'remaining' => $loan->remaining_balance,
            ];
        }

        return response()->json([
            'borrower' => $borrower,
            'ledger' => $ledger,
        ]);
    }

    public function overdueAccounts()
    {
        $overdueLoans = Loan::with('borrower')
            ->where('status', 'overdue')
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($loan) {
                $loan->days_overdue = now()->diffInDays($loan->due_date);
                return $loan;
            });

        return response()->json($overdueLoans);
    }

    public function exportDailyCollections(Request $request)
    {
        $date = $request->date ?? now()->format('Y-m-d');
        $format = $request->format ?? 'pdf';

        $payments = Payment::with('loan.borrower')
            ->whereDate('payment_date', $date)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.daily-collections', [
                'date' => $date,
                'payments' => $payments,
                'total' => $payments->sum('amount_paid'),
            ]);
            return $pdf->download("daily-collections-{$date}.pdf");
        }

        // CSV Export
        $csv = "Date,Borrower,Amount,Balance After,Late,Remarks\n";
        foreach ($payments as $payment) {
            $csv .= sprintf(
                "%s,%s,%.2f,%.2f,%s,%s\n",
                $payment->payment_date->format('Y-m-d'),
                $payment->loan->borrower->full_name,
                $payment->amount_paid,
                $payment->balance_after,
                $payment->is_late ? 'Yes' : 'No',
                $payment->remarks ?? ''
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=daily-collections-{$date}.csv");
    }

    public function printReceipt(Payment $payment)
    {
        $payment->load('loan.borrower');

        $pdf = Pdf::loadView('reports.receipt', [
            'payment' => $payment,
        ]);

        return $pdf->download("receipt-{$payment->id}.pdf");
    }
}

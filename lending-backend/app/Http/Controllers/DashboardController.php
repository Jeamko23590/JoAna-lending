<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Loan;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalActiveLoans = Loan::where('status', 'ongoing')->count();
        $totalReleasedCapital = Loan::sum('loan_amount');
        $totalCollections = Payment::sum('amount_paid');
        $outstandingBalance = Loan::whereIn('status', ['ongoing', 'overdue'])->sum('remaining_balance');
        $overdueLoansCount = Loan::where('status', 'overdue')->count();
        $totalBorrowers = Borrower::count();
        $activeBorrowers = Borrower::where('status', 'active')->count();

        // Check and update overdue loans
        Loan::where('status', 'ongoing')
            ->where('due_date', '<', now())
            ->update(['status' => 'overdue']);

        return response()->json([
            'total_active_loans' => $totalActiveLoans,
            'total_released_capital' => $totalReleasedCapital,
            'total_collections' => $totalCollections,
            'outstanding_balance' => $outstandingBalance,
            'overdue_loans_count' => $overdueLoansCount,
            'total_borrowers' => $totalBorrowers,
            'active_borrowers' => $activeBorrowers,
        ]);
    }

    public function monthlyChart()
    {
        $months = collect();
        
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months->push([
                'month' => $date->format('M Y'),
                'year' => $date->year,
                'month_num' => $date->month,
            ]);
        }

        $collections = Payment::select(
                DB::raw('YEAR(payment_date) as year'),
                DB::raw('MONTH(payment_date) as month'),
                DB::raw('SUM(amount_paid) as total')
            )
            ->whereDate('payment_date', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn($item) => $item->year . '-' . $item->month);

        $releases = Loan::select(
                DB::raw('YEAR(release_date) as year'),
                DB::raw('MONTH(release_date) as month'),
                DB::raw('SUM(loan_amount) as total')
            )
            ->whereDate('release_date', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn($item) => $item->year . '-' . $item->month);

        $chartData = $months->map(function ($month) use ($collections, $releases) {
            $key = $month['year'] . '-' . $month['month_num'];
            return [
                'month' => $month['month'],
                'collections' => $collections->get($key)?->total ?? 0,
                'releases' => $releases->get($key)?->total ?? 0,
            ];
        });

        return response()->json($chartData);
    }

    public function recentActivity()
    {
        $recentLoans = Loan::with('borrower')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentPayments = Payment::with('loan.borrower')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'recent_loans' => $recentLoans,
            'recent_payments' => $recentPayments,
        ]);
    }
}

<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BorrowerController;
use App\Http\Controllers\CapitalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// Health check / test endpoint
Route::get('/health', function () {
    try {
        \DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'error: ' . $e->getMessage();
    }
    return response()->json([
        'status' => 'ok',
        'time' => now(),
        'database' => $dbStatus
    ]);
});

// Handle preflight OPTIONS requests
Route::options('/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
})->where('any', '.*');

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/chart', [DashboardController::class, 'monthlyChart']);
    Route::get('/dashboard/recent', [DashboardController::class, 'recentActivity']);

    // Capital
    Route::get('/capital', [CapitalController::class, 'index']);
    Route::get('/capital/balance', [CapitalController::class, 'balance']);
    Route::post('/capital/deposit', [CapitalController::class, 'deposit']);
    Route::post('/capital/withdraw', [CapitalController::class, 'withdraw']);

    // Borrowers
    Route::get('/borrowers/list', [BorrowerController::class, 'list']);
    Route::apiResource('borrowers', BorrowerController::class);

    // Loans
    Route::post('/loans/calculate', [LoanController::class, 'calculate']);
    Route::apiResource('loans', LoanController::class);

    // Payments
    Route::apiResource('payments', PaymentController::class);

    // Reports
    Route::get('/reports/daily-collections', [ReportController::class, 'dailyCollections']);
    Route::get('/reports/monthly-income', [ReportController::class, 'monthlyIncome']);
    Route::get('/reports/borrower-ledger/{borrower}', [ReportController::class, 'borrowerLedger']);
    Route::get('/reports/overdue', [ReportController::class, 'overdueAccounts']);
    Route::get('/reports/export/daily', [ReportController::class, 'exportDailyCollections']);
    Route::get('/reports/receipt/{payment}', [ReportController::class, 'printReceipt']);
});

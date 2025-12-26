<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_id')->constrained()->onDelete('cascade');
            $table->decimal('loan_amount', 12, 2);
            $table->string('interest_type', 20)->default('flat'); // flat, reducing
            $table->decimal('interest_percentage', 5, 2)->default(0);
            $table->decimal('interest_amount', 12, 2)->default(0);
            $table->integer('loan_term');
            $table->string('term_type', 20)->default('months'); // daily, semi_monthly, weeks, months
            $table->date('release_date');
            $table->date('due_date');
            $table->decimal('total_interest', 12, 2);
            $table->decimal('total_payable', 12, 2);
            $table->decimal('payment_per_period', 12, 2)->default(0);
            $table->decimal('remaining_balance', 12, 2);
            $table->string('status', 20)->default('ongoing'); // ongoing, fully_paid, overdue
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};

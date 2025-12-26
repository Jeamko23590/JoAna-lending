<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Collections Report</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 5px 0; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .total { font-weight: bold; text-align: right; margin-top: 15px; font-size: 14px; }
        .late { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>JoAna Lending System</h1>
        <p>Daily Collections Report</p>
        <p>Date: {{ $date }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Borrower</th>
                <th>Amount Paid</th>
                <th>Balance After</th>
                <th>Status</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $index => $payment)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $payment->loan->borrower->full_name }}</td>
                <td>₱{{ number_format($payment->amount_paid, 2) }}</td>
                <td>₱{{ number_format($payment->balance_after, 2) }}</td>
                <td class="{{ $payment->is_late ? 'late' : '' }}">
                    {{ $payment->is_late ? 'Late' : 'On Time' }}
                </td>
                <td>{{ $payment->remarks ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center;">No collections for this date</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <p class="total">Total Collections: ₱{{ number_format($total, 2) }}</p>
</body>
</html>

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
        <p>Date: <?php echo e($date); ?></p>
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
            <?php $__empty_1 = true; $__currentLoopData = $payments; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $payment): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
            <tr>
                <td><?php echo e($index + 1); ?></td>
                <td><?php echo e($payment->loan->borrower->full_name); ?></td>
                <td>₱<?php echo e(number_format($payment->amount_paid, 2)); ?></td>
                <td>₱<?php echo e(number_format($payment->balance_after, 2)); ?></td>
                <td class="<?php echo e($payment->is_late ? 'late' : ''); ?>">
                    <?php echo e($payment->is_late ? 'Late' : 'On Time'); ?>

                </td>
                <td><?php echo e($payment->remarks ?? '-'); ?></td>
            </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
            <tr>
                <td colspan="6" style="text-align: center;">No collections for this date</td>
            </tr>
            <?php endif; ?>
        </tbody>
    </table>

    <p class="total">Total Collections: ₱<?php echo e(number_format($total, 2)); ?></p>
</body>
</html>
<?php /**PATH D:\Xampp.2\htdocs\Lending\lending-backend\resources\views/reports/daily-collections.blade.php ENDPATH**/ ?>
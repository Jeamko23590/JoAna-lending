<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; max-width: 300px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 16px; }
        .header p { margin: 3px 0; font-size: 10px; }
        .receipt-no { text-align: center; font-weight: bold; margin-bottom: 15px; }
        .details { margin-bottom: 15px; }
        .details p { margin: 5px 0; display: flex; justify-content: space-between; }
        .details .label { font-weight: bold; }
        .amount { text-align: center; font-size: 18px; font-weight: bold; border: 2px solid #000; padding: 10px; margin: 15px 0; }
        .footer { text-align: center; border-top: 2px dashed #000; padding-top: 10px; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>JoAna Lending</h1>
        <p>Payment Receipt</p>
    </div>

    <div class="receipt-no">
        Receipt #<?php echo e(str_pad($payment->id, 6, '0', STR_PAD_LEFT)); ?>

    </div>

    <div class="details">
        <p><span class="label">Date:</span> <span><?php echo e($payment->payment_date->format('M d, Y')); ?></span></p>
        <p><span class="label">Borrower:</span> <span><?php echo e($payment->loan->borrower->full_name); ?></span></p>
        <p><span class="label">Loan Amount:</span> <span>₱<?php echo e(number_format($payment->loan->loan_amount, 2)); ?></span></p>
    </div>

    <div class="amount">
        Amount Paid: ₱<?php echo e(number_format($payment->amount_paid, 2)); ?>

    </div>

    <div class="details">
        <p><span class="label">Remaining Balance:</span> <span>₱<?php echo e(number_format($payment->balance_after, 2)); ?></span></p>
        <?php if($payment->remarks): ?>
        <p><span class="label">Remarks:</span> <span><?php echo e($payment->remarks); ?></span></p>
        <?php endif; ?>
    </div>

    <div class="footer">
        <p>Thank you for your payment!</p>
        <p>Generated: <?php echo e(now()->format('M d, Y h:i A')); ?></p>
    </div>
</body>
</html>
<?php /**PATH D:\Xampp.2\htdocs\Lending\lending-backend\resources\views/reports/receipt.blade.php ENDPATH**/ ?>
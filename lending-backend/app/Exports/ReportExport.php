<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ReportExport implements FromCollection, WithHeadings
{
    protected $data;
    protected $type;

    public function __construct($data, $type = 'daily')
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection()
    {
        return $this->data->map(function ($payment) {
            return [
                'Date' => $payment->payment_date->format('Y-m-d'),
                'Borrower' => $payment->loan->borrower->full_name,
                'Amount' => $payment->amount_paid,
                'Balance After' => $payment->balance_after,
                'Late' => $payment->is_late ? 'Yes' : 'No',
                'Remarks' => $payment->remarks ?? '',
            ];
        });
    }

    public function headings(): array
    {
        return ['Date', 'Borrower', 'Amount', 'Balance After', 'Late', 'Remarks'];
    }
}

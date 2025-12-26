<?php

namespace App\Services;

class LoanCalculatorService
{
    public static function calculate(float $amount, float $totalInterest, int $term): array
    {
        $totalPayable = $amount + $totalInterest;
        $paymentPerPeriod = $totalPayable / $term;

        return [
            'total_interest' => round($totalInterest, 2),
            'total_payable' => round($totalPayable, 2),
            'payment_per_period' => round($paymentPerPeriod, 2),
        ];
    }

    public static function calculateDueDate(string $releaseDate, int $term, string $termType): string
    {
        $date = new \DateTime($releaseDate);
        
        switch ($termType) {
            case 'daily':
                $date->modify("+{$term} days");
                break;
            case 'semi_monthly':
                // Calculate due date based on 15th and last day of month schedule
                for ($i = 0; $i < $term; $i++) {
                    $date = self::getNextSemiMonthlyDate($date);
                }
                break;
            case 'weeks':
                $date->modify("+{$term} weeks");
                break;
            case 'months':
            default:
                $date->modify("+{$term} months");
                break;
        }

        return $date->format('Y-m-d');
    }

    private static function getNextSemiMonthlyDate(\DateTime $currentDate): \DateTime
    {
        $date = clone $currentDate;
        $day = (int) $date->format('j');
        $month = (int) $date->format('n');
        $year = (int) $date->format('Y');
        $lastDay = (int) $date->format('t');

        if ($day < 15) {
            // Next payment is on the 15th of current month
            $date->setDate($year, $month, 15);
        } elseif ($day < $lastDay) {
            // Next payment is on the last day of current month
            $date->setDate($year, $month, $lastDay);
        } else {
            // Next payment is on the 15th of next month
            $date->modify('first day of next month');
            $date->setDate((int) $date->format('Y'), (int) $date->format('n'), 15);
        }

        return $date;
    }

    public static function getPaymentSchedule(string $releaseDate, int $term, string $termType, float $paymentPerPeriod): array
    {
        $schedule = [];
        $date = new \DateTime($releaseDate);

        for ($i = 1; $i <= $term; $i++) {
            switch ($termType) {
                case 'daily':
                    $date->modify('+1 day');
                    break;
                case 'semi_monthly':
                    $date = self::getNextSemiMonthlyDate($date);
                    break;
                case 'weeks':
                    $date->modify('+1 week');
                    break;
                case 'months':
                default:
                    $date->modify('+1 month');
                    break;
            }

            $schedule[] = [
                'period' => $i,
                'due_date' => $date->format('Y-m-d'),
                'amount' => $paymentPerPeriod,
            ];
        }

        return $schedule;
    }

    public static function getTermTypeLabel(string $termType): string
    {
        return match($termType) {
            'daily' => 'Day',
            'semi_monthly' => 'Semi-Monthly',
            'weeks' => 'Week',
            'months' => 'Month',
            default => 'Period',
        };
    }
}

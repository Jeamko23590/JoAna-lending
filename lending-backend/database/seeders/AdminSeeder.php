<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::firstOrCreate(
            ['email' => 'admin@joana.com'],
            [
                'name' => 'JoAna Admin',
                'password' => Hash::make('password123'),
            ]
        );
    }
}

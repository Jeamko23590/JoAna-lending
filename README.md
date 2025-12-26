# JoAna Lending Business Management System

A web-based lending business management and tracking system for family-run lending businesses.

## Tech Stack
- **Frontend**: React + Vite + Bootstrap 5
- **Backend**: Laravel 10 (REST API)
- **Database**: MySQL
- **Authentication**: Laravel Sanctum

## Project Structure
```
├── lending-backend/     # Laravel API
└── lending-frontend/    # React + Vite
```

## Features
- Single Admin authentication
- Borrower management with ID uploads
- Loan management (flat rate & reducing balance)
- Payment tracking with auto-balance updates
- Dashboard with statistics & charts
- Reports (daily, monthly, ledger, overdue)
- PDF receipts & Excel exports

---

## Backend Setup (Laravel)

### 1. Navigate to backend folder
```bash
cd lending-backend
```

### 2. Install dependencies
```bash
composer install
```

### 3. Configure environment
```bash
copy .env.example .env
php artisan key:generate
```

### 4. Update `.env` with your database credentials
```env
DB_DATABASE=lending_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 5. Create database
```sql
CREATE DATABASE lending_system;
```

### 6. Run migrations and seed
```bash
php artisan migrate
php artisan db:seed
```

### 7. Create storage link
```bash
php artisan storage:link
```

### 8. Start server
```bash
php artisan serve
```

Backend runs at: `http://localhost:8000`

---

## Frontend Setup (React)

### 1. Navigate to frontend folder
```bash
cd lending-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
copy .env.example .env
```

### 4. Start development server
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Admin Credentials
- **Email**: admin@joana.com
- **Password**: password123

---

## Production Deployment

### Backend (VPS/Shared Hosting)
1. Upload files to server
2. Run `composer install --optimize-autoloader --no-dev`
3. Set `.env` with production values
4. Run migrations: `php artisan migrate --force`
5. Optimize: `php artisan config:cache && php artisan route:cache`

### Frontend (Vercel)
1. Build: `npm run build`
2. Deploy `dist` folder to Vercel
3. Set `VITE_API_URL` environment variable to your backend URL

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login | Admin login |
| POST | /api/logout | Admin logout |
| GET | /api/dashboard | Dashboard stats |
| GET/POST | /api/borrowers | Borrower CRUD |
| GET/POST | /api/loans | Loan CRUD |
| GET/POST | /api/payments | Payment CRUD |
| GET | /api/reports/* | Various reports |

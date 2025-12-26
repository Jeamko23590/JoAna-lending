# JoAna Lending System - Deployment Guide

## Overview
- **Frontend**: Vercel (React + Vite)
- **Backend**: Any PHP hosting (Railway, Render, or traditional hosting)
- **Database**: Supabase (PostgreSQL)

---

## Step 1: Set Up Supabase Database

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub or email

2. **Create New Project**
   - Click "New Project"
   - Enter project name: `joana-lending`
   - Set a strong database password (SAVE THIS!)
   - Select region closest to you
   - Click "Create new project"

3. **Get Database Credentials**
   - Go to Project Settings → Database
   - Copy these values:
     - Host: `db.xxxxxxxxxxxx.supabase.co`
     - Database name: `postgres`
     - Port: `5432`
     - User: `postgres`
     - Password: (the one you set)

4. **Connection String** (for reference):
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

---

## Step 2: Deploy Backend (Option A: Railway - Recommended)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the `lending-backend` folder

3. **Configure Environment Variables**
   In Railway dashboard, add these variables:
   ```
   APP_NAME=JoAna Lending System
   APP_ENV=production
   APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   APP_DEBUG=false
   APP_URL=https://your-app.railway.app
   
   DB_CONNECTION=pgsql
   DB_HOST=db.xxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres
   DB_PASSWORD=your-supabase-password
   DB_SSLMODE=require
   
   FRONTEND_URL=https://your-app.vercel.app
   SANCTUM_STATEFUL_DOMAINS=your-app.vercel.app
   SESSION_DOMAIN=.vercel.app
   ```

4. **Generate APP_KEY**
   Run locally: `php artisan key:generate --show`
   Copy the output to APP_KEY

5. **Run Migrations**
   In Railway console or locally with production DB:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```

---

## Step 2: Deploy Backend (Option B: Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repo
   - Root Directory: `lending-backend`
   - Runtime: PHP
   - Build Command: `composer install --no-dev --optimize-autoloader`
   - Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`

3. **Add Environment Variables** (same as Railway above)

---

## Step 3: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set Root Directory: `lending-frontend`

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variable**
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your Vercel URL (e.g., `joana-lending.vercel.app`)

---

## Step 4: Update Backend CORS

After getting your Vercel URL, update backend environment:
```
FRONTEND_URL=https://joana-lending.vercel.app
SANCTUM_STATEFUL_DOMAINS=joana-lending.vercel.app
```

---

## Step 5: Run Database Migrations

Connect to your backend server and run:
```bash
php artisan migrate --force
php artisan db:seed --force
```

Or use Railway/Render console.

---

## Step 6: Create Admin Account

The seeder creates a default admin:
- **Email**: admin@lending.com
- **Password**: password123

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check that `allowed_origins` in `config/cors.php` includes your domain

### Database Connection Failed
- Verify Supabase credentials are correct
- Ensure `DB_SSLMODE=require` is set
- Check if Supabase project is active (free tier pauses after inactivity)

### 500 Server Error
- Check `APP_KEY` is set correctly
- Run `php artisan config:cache` after changing env
- Check Laravel logs: `storage/logs/laravel.log`

### PWA Not Installing
- PWA requires HTTPS (Vercel provides this automatically)
- Clear browser cache and try again
- Check manifest.json is accessible at `/manifest.json`

---

## Quick Reference

| Service | URL |
|---------|-----|
| Frontend | https://your-app.vercel.app |
| Backend API | https://your-backend.railway.app/api |
| Supabase Dashboard | https://app.supabase.com |

---

## Local Development

```bash
# Frontend
cd lending-frontend
npm install
npm run dev

# Backend
cd lending-backend
composer install
php artisan serve
```

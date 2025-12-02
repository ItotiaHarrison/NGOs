# Quick Setup Guide

## Step 1: Database Setup

You have two options for the database:

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
```sql
CREATE DATABASE daraja_directory;
```

3. Update `.env` with your local connection:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/daraja_directory?schema=public"
```

### Option B: Cloud Database (Recommended for Quick Start)

Use a free PostgreSQL database from:
- **Neon** (https://neon.tech) - Free tier, instant setup
- **Supabase** (https://supabase.com) - Free tier with 500MB
- **Railway** (https://railway.app) - Free tier available

After creating your database, copy the connection string to `.env`

## Step 2: Install Dependencies

```bash
cd daraja-directory
npm install
```

## Step 3: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

## Step 4: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Test the Application

1. Go to http://localhost:3000
2. Click "List Your Organization"
3. Fill in the registration form:
   - Email: test@example.com
   - Organization Name: Test NGO
   - County: Nairobi
   - Phone: +254700000000
   - Password: password123
   - Confirm Password: password123
   - Check "Accept Terms"
4. Click "Create Account"
5. Login with your credentials
6. Access your dashboard

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Check database connection
npx prisma db pull
```

## Common Issues

### "Can't reach database server"
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### "Prisma Client not generated"
- Run `npx prisma generate`

### Port 3000 already in use
- Kill the process using port 3000
- Or change port: `npm run dev -- -p 3001`

## Next Development Steps

After Phase 1 is working:
1. Build organization profile editing
2. Add document upload
3. Create public directory
4. Implement search/filter
5. Add payment integration

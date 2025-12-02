# 🚀 Daraja Directory - Quick Start Guide

## What You Have Now

A fully functional NGO/CBO directory platform with:
- ✅ User authentication
- ✅ Organization profiles
- ✅ Public directory with search
- ✅ Document management
- ✅ Tier system with upgrade options

## Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd daraja-directory
npm install
```

### 2. Set Up Database

**Option A: Use a Free Cloud Database (Recommended)**
- Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com)
- Create a free PostgreSQL database
- Copy the connection string

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL, then:
createdb daraja_directory
```

### 3. Configure Environment
Update `.env` with your database URL:
```env
DATABASE_URL="postgresql://user:password@host:5432/daraja_directory"
JWT_SECRET="your-super-secret-key-min-32-characters-long"
```

### 4. Initialize Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Development Server
```bash
npm run dev
```

Visit **http://localhost:3000**

## Test the Application

### 1. Register an Organization
1. Click "List Your Organization"
2. Fill in:
   - Email: test@ngo.org
   - Organization: Test NGO
   - County: Nairobi
   - Phone: +254700000000
   - Password: password123
3. Click "Create Account"

### 2. Login
1. Use the credentials you just created
2. Access your dashboard

### 3. Edit Profile
1. Click "Edit Profile"
2. Add description (min 50 characters)
3. Select sectors
4. Add SDGs (optional)
5. Save changes

### 4. Browse Directory
1. Logout or open incognito window
2. Click "Browse Directory"
3. Try search and filters
4. Click on an organization to view details

## Key Features

### For Organizations (NGOs/CBOs)
- Create and manage profile
- Upload documents (tier-dependent)
- Choose verification tier
- Track profile views

### For Funders/Public
- Browse verified organizations
- Search by name
- Filter by county, sector, tier
- View detailed profiles
- Contact organizations directly

## Tier System

| Tier | Price | Features |
|------|-------|----------|
| **Basic Free** | KES 0 | Basic listing, 3 sectors, contact info |
| **Self-Assessment** | KES 2,500 | Extended profile, 5 documents, unlimited sectors |
| **Daraja Verified** | KES 10,000 | Manual verification, unlimited docs, featured listing |

## Project Structure

```
daraja-directory/
├── src/
│   ├── app/              # Pages and API routes
│   ├── components/       # Reusable components
│   └── lib/              # Utilities and constants
├── prisma/
│   └── schema.prisma     # Database schema
└── .env                  # Environment variables
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

npx prisma studio    # Open database GUI
npx prisma migrate   # Run migrations
```

## Common Issues

### "Can't reach database server"
- Check DATABASE_URL in .env
- Ensure database exists
- Verify credentials

### "Module not found"
- Run `npm install`
- Run `npx prisma generate`

### Port 3000 in use
- Kill the process or use different port:
  ```bash
  npm run dev -- -p 3001
  ```

## What's Next?

### Phase 3 (Coming Soon)
- Admin dashboard
- M-PESA payment integration
- PayPal integration
- Email notifications
- Analytics

### Current Limitations
- Document uploads are metadata-only (no file storage yet)
- Payment buttons are placeholders
- No email verification yet
- No admin interface yet

## Documentation

- **README.md** - Full project documentation
- **SETUP.md** - Detailed setup instructions
- **PHASE1-COMPLETE.md** - Phase 1 features
- **PHASE2-COMPLETE.md** - Phase 2 features
- **PROJECT-STATUS.md** - Overall progress

## Support

If you encounter issues:
1. Check the documentation files
2. Verify your .env configuration
3. Ensure database is running
4. Check console for errors

## Production Deployment

When ready to deploy:
1. Set up production database
2. Configure environment variables
3. Set up cloud storage for documents
4. Enable HTTPS
5. Configure email service
6. Set up payment gateways

Recommended platforms:
- **Vercel** (Frontend + API)
- **Neon/Supabase** (Database)
- **Cloudinary/S3** (File storage)

---

**Built with**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS

**Status**: Phase 2 Complete ✅

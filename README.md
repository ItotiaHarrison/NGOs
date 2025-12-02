# Daraja Directory - NGO/CBO Platform

A comprehensive web platform connecting Kenyan NGOs and CBOs with funders through verified listings, advanced search, and secure payment integration.

## Phase 1 - Foundation (COMPLETED)

✅ Project setup with Next.js 14, TypeScript, Tailwind CSS
✅ Database schema with Prisma (PostgreSQL)
✅ User authentication system (JWT-based)
✅ User registration with email/password
✅ Login/logout functionality
✅ Protected dashboard route
✅ Basic organization profile creation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database:

Update the `DATABASE_URL` in `.env` file with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/daraja_directory?schema=public"
```

3. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
daraja-directory/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/auth/          # Authentication API routes
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   └── auth/              # Auth-related components
│   └── lib/
│       ├── db.ts              # Prisma client
│       ├── auth.ts            # Auth utilities
│       ├── validations.ts     # Zod schemas
│       ├── constants.ts       # App constants
│       └── store/             # Zustand stores
├── prisma/
│   └── schema.prisma          # Database schema
└── .env                       # Environment variables
```

## Features Implemented

### Authentication
- User registration with organization details
- Email/password login
- JWT token-based authentication
- HTTP-only cookies for security
- Protected routes with auth middleware
- Logout functionality

### Database Models
- User (with role-based access)
- Organization (with tier system)
- Document uploads
- Payment tracking
- Verification status workflow

### UI Components
- Registration form with validation
- Login form
- Dashboard layout
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Form Validation**: Zod + React Hook Form
- **State Management**: Zustand

## Database Schema

### User
- Email, password (hashed)
- Role (PUBLIC, NGO_USER, ADMIN)
- Email verification status
- One-to-one relationship with Organization

### Organization
- Basic info (name, description, contact)
- Location (county, sub-county)
- Tier (BASIC_FREE, SELF_ASSESSMENT, DARAJA_VERIFIED)
- Verification status
- Sectors and SDGs
- Documents and payments

## Next Steps (Phase 2)

- [ ] Organization profile editing
- [ ] Document upload functionality
- [ ] Public directory listing
- [ ] Search and filter implementation
- [ ] Organization detail pages

## Environment Variables

Required variables in `.env`:

```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

## Testing the Application

1. Visit http://localhost:3000
2. Click "List Your Organization" or "Register"
3. Fill in the registration form
4. After registration, login with your credentials
5. Access the dashboard at /dashboard

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Run `npx prisma migrate dev` to apply migrations

### Module Not Found Errors
- Run `npm install` to ensure all dependencies are installed
- Check that `@/` path alias is configured in `tsconfig.json`

### Authentication Issues
- Clear browser cookies
- Check JWT_SECRET is set in .env
- Verify API routes are accessible

## License

MIT

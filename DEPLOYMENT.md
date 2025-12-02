# 🚀 Deployment Guide - Daraja Directory

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Production database created
- [ ] All environment variables configured
- [ ] JWT_SECRET is strong (min 32 characters)
- [ ] HTTPS/SSL certificates ready
- [ ] Domain name configured

### 2. Database
- [ ] Migrations run successfully
- [ ] Admin user created
- [ ] Backups configured
- [ ] Connection pooling enabled

### 3. Services
- [ ] Email service configured (Resend/SendGrid)
- [ ] File storage set up (S3/Cloudinary)
- [ ] Payment gateways ready (M-PESA/PayPal)
- [ ] Monitoring tools configured

### 4. Security
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] Audit logging enabled

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Easy setup, automatic HTTPS, great performance, built-in analytics
**Cons**: Serverless limitations, need external database

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd daraja-directory
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NEXT_PUBLIC_APP_URL
   # Add all other env vars
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Database Options for Vercel:
- **Neon** (https://neon.tech) - Serverless PostgreSQL
- **Supabase** (https://supabase.com) - PostgreSQL + extras
- **PlanetScale** (https://planetscale.com) - MySQL

### Option 2: Railway

**Pros**: Includes database, simple setup, good for full-stack
**Cons**: More expensive than Vercel

#### Steps:

1. **Create Railway Account**
   Visit https://railway.app

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL**
   - Click "New"
   - Select "Database"
   - Choose "PostgreSQL"

4. **Configure Environment Variables**
   - Go to project settings
   - Add all environment variables
   - Use Railway's DATABASE_URL

5. **Deploy**
   - Railway auto-deploys on git push
   - Monitor logs in dashboard

### Option 3: AWS (Advanced)

**Pros**: Full control, scalable, many services
**Cons**: Complex setup, requires AWS knowledge

#### Services Needed:
- **EC2** or **ECS** - Application hosting
- **RDS** - PostgreSQL database
- **S3** - File storage
- **CloudFront** - CDN
- **Route 53** - DNS
- **SES** - Email service

## Post-Deployment Steps

### 1. Database Setup

```bash
# SSH into your server or use database client

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Create admin user
npm run create-admin admin@yourdomain.com SecurePassword123!
```

### 2. Verify Deployment

```bash
# Check health
curl https://yourdomain.com/api/health

# Test authentication
curl https://yourdomain.com/api/auth/me

# Check admin access
# Visit https://yourdomain.com/admin
```

### 3. Configure DNS

```
# Add these DNS records:
A     @              -> Your server IP
CNAME www            -> yourdomain.com
CNAME api            -> yourdomain.com (if using subdomain)
```

### 4. Enable HTTPS

**With Vercel**: Automatic

**With Railway**: Automatic

**With Custom Server**:
```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Set Up Monitoring

#### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs

# Add to next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

# Set SENTRY_DSN in environment
```

#### Uptime Monitoring
- **UptimeRobot** (https://uptimerobot.com) - Free
- **Pingdom** (https://pingdom.com) - Paid
- **Better Uptime** (https://betteruptime.com) - Free tier

### 6. Configure Backups

#### Database Backups
```bash
# Automated daily backups
# Neon: Built-in
# Supabase: Built-in
# Custom: Set up cron job

# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

#### File Backups
- S3: Enable versioning
- Cloudinary: Automatic backups

## Environment Variables Reference

### Required
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="min-32-characters-random-string"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Email (Required for notifications)
```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASSWORD="re_xxxxx"
SMTP_FROM="noreply@yourdomain.com"
```

### File Storage (Required for documents)
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Payment (Optional - Phase 3)
```env
# M-PESA
MPESA_CONSUMER_KEY="your-key"
MPESA_CONSUMER_SECRET="your-secret"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="your-passkey"
MPESA_CALLBACK_URL="https://yourdomain.com/api/payments/mpesa/callback"

# PayPal
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-secret"
PAYPAL_MODE="live"
```

### Monitoring (Optional)
```env
SENTRY_DSN="https://xxx@sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
```

## Performance Optimization

### 1. Enable Caching

```typescript
// In production, use Redis
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache expensive queries
const cached = await redis.get(key);
if (cached) return JSON.parse(cached);

const data = await fetchData();
await redis.setex(key, 3600, JSON.stringify(data));
```

### 2. CDN Configuration

**Vercel**: Automatic global CDN

**Cloudflare**: 
- Add site to Cloudflare
- Update nameservers
- Enable caching rules

### 3. Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_org_county ON "Organization"(county);
CREATE INDEX idx_org_tier ON "Organization"(tier);
CREATE INDEX idx_org_status ON "Organization"("verificationStatus");
CREATE INDEX idx_org_sectors ON "Organization" USING GIN(sectors);
```

### 4. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={org.logo}
  alt={org.name}
  width={200}
  height={200}
  quality={75}
  loading="lazy"
/>
```

## Security Hardening

### 1. Environment Security
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use strong secrets
openssl rand -base64 32  # Generate JWT_SECRET
```

### 2. Database Security
```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
```

### 3. API Security
```typescript
// Rate limiting with Redis
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  store: new RedisStore({
    client: redis,
  }),
});
```

### 4. HTTPS Enforcement
```typescript
// In middleware.ts
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
  return NextResponse.redirect(`https://${request.headers.get('host')}${request.url}`);
}
```

## Monitoring & Alerts

### 1. Set Up Alerts

**Uptime Alerts**:
- Email when site is down
- SMS for critical issues
- Slack integration

**Error Alerts**:
- Sentry notifications
- Error rate thresholds
- Performance degradation

### 2. Log Aggregation

```typescript
// Use structured logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
  },
});

logger.info({ userId, action: 'login' }, 'User logged in');
```

### 3. Performance Monitoring

```typescript
// Track key metrics
import { PerformanceMonitor } from '@/lib/performance';

PerformanceMonitor.start('database-query');
const data = await prisma.organization.findMany();
PerformanceMonitor.end('database-query');
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Check SSL requirements
# Add ?sslmode=require to DATABASE_URL
```

**2. Build Failures**
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

**3. Environment Variables Not Loading**
```bash
# Verify .env file exists
ls -la .env

# Check Vercel env vars
vercel env ls

# Pull env vars locally
vercel env pull
```

**4. Rate Limiting Issues**
```bash
# Check Redis connection
redis-cli ping

# Clear rate limit for IP
redis-cli DEL rate-limit:192.168.1.1
```

## Rollback Procedure

### If Deployment Fails:

**Vercel**:
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

**Railway**:
- Go to deployments
- Click "Rollback" on previous deployment

**Custom Server**:
```bash
# Revert to previous commit
git revert HEAD
git push

# Or checkout previous version
git checkout [previous-commit]
```

## Support & Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check uptime status
- Review user feedback

**Weekly**:
- Database backup verification
- Security updates
- Performance review

**Monthly**:
- Dependency updates
- Security audit
- Cost optimization
- Feature planning

---

**Need Help?** Check the documentation files:
- README.md - Overview
- SETUP.md - Local development
- PHASE1-5-COMPLETE.md - Feature documentation
- PROJECT-STATUS.md - Current status

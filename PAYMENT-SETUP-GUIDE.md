# Payment Setup Guide

This guide will help you configure M-PESA and PayPal for the Daraja Directory payment system.

## 📱 M-PESA Setup (Safaricom - Kenya)

### Step 1: Register for M-PESA Daraja API

1. Visit [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an account or log in
3. Create a new app in the portal
4. Select "Lipa Na M-PESA Online" product

### Step 2: Get Your Credentials

After creating your app, you'll receive:
- **Consumer Key**: Your app's consumer key
- **Consumer Secret**: Your app's consumer secret
- **Business Short Code**: Your M-PESA business number (e.g., 174379)
- **Passkey**: Your Lipa Na M-PESA Online passkey

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
# M-PESA Configuration
MPESA_ENV="sandbox"                                    # Use "production" for live
MPESA_CONSUMER_KEY="your_consumer_key_here"
MPESA_CONSUMER_SECRET="your_consumer_secret_here"
MPESA_SHORTCODE="174379"                               # Your business shortcode
MPESA_PASSKEY="your_passkey_here"
MPESA_CALLBACK_URL="https://yourdomain.com/api/payments/mpesa/callback"
```

### Step 4: Set Up Callback URL

#### For Local Development (using ngrok):

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js app: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update your `.env`:
   ```env
   MPESA_CALLBACK_URL="https://abc123.ngrok.io/api/payments/mpesa/callback"
   ```

#### For Production:

```env
MPESA_CALLBACK_URL="https://yourdomain.com/api/payments/mpesa/callback"
```

**Important**: The callback URL MUST be HTTPS in production!

### Step 5: Test M-PESA Integration

#### Sandbox Testing:
1. Use sandbox credentials
2. Test with any valid Kenyan phone number (format: 254XXXXXXXXX)
3. Sandbox auto-completes payments (no real money)
4. Check callback logs in your terminal

#### Production Testing:
1. Switch to production credentials
2. Use real phone numbers
3. Real money will be charged
4. Test with small amounts first

### M-PESA Phone Number Format

The system accepts these formats and converts them automatically:
- `0712345678` → `254712345678`
- `712345678` → `254712345678`
- `254712345678` → `254712345678`
- `+254712345678` → `254712345678`

---

## 💳 PayPal Setup

### Step 1: Create PayPal Developer Account

1. Visit [PayPal Developer Portal](https://developer.paypal.com/)
2. Log in with your PayPal account or create one
3. Go to "Dashboard" → "My Apps & Credentials"

### Step 2: Create Sandbox App

1. Under "REST API apps", click "Create App"
2. Enter app name (e.g., "Daraja Directory")
3. Select "Merchant" as app type
4. Click "Create App"

### Step 3: Get Your Credentials

You'll see two sets of credentials:

#### Sandbox Credentials (for testing):
- **Client ID**: Starts with "AX..."
- **Secret**: Your secret key

#### Live Credentials (for production):
- Switch to "Live" tab
- **Client ID**: Your live client ID
- **Secret**: Your live secret key

### Step 4: Configure Environment Variables

#### For Development (Sandbox):

```env
# PayPal Configuration
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your_sandbox_client_id_here"
PAYPAL_CLIENT_SECRET="your_sandbox_secret_here"
```

#### For Production (Live):

```env
# PayPal Configuration
PAYPAL_MODE="production"
PAYPAL_CLIENT_ID="your_live_client_id_here"
PAYPAL_CLIENT_SECRET="your_live_secret_here"
```

### Step 5: Create Sandbox Test Accounts

1. In PayPal Developer Dashboard, go to "Sandbox" → "Accounts"
2. Create a "Personal" account (buyer)
3. Create a "Business" account (seller)
4. Note the email and password for testing

### Step 6: Test PayPal Integration

#### Sandbox Testing:
1. Use sandbox credentials in `.env`
2. Click "Pay with PayPal" button
3. Log in with sandbox buyer account
4. Complete test payment (no real money)
5. Verify payment capture works

#### Production Testing:
1. Switch to production credentials
2. Use real PayPal accounts
3. Real money will be charged
4. Test with small amounts first

---

## 🔧 Complete Environment Setup

Here's your complete `.env` file with all payment configurations:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/daraja_directory?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# M-PESA Configuration
MPESA_ENV="sandbox"
MPESA_CONSUMER_KEY="your_consumer_key_here"
MPESA_CONSUMER_SECRET="your_consumer_secret_here"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="your_passkey_here"
MPESA_CALLBACK_URL="https://yourdomain.com/api/payments/mpesa/callback"

# PayPal Configuration
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your_client_id_here"
PAYPAL_CLIENT_SECRET="your_secret_here"

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE="10485760"
```

---

## 🧪 Testing Checklist

### M-PESA Testing
- [ ] Sandbox credentials configured
- [ ] Callback URL accessible (use ngrok for local)
- [ ] Test with valid phone number
- [ ] Verify STK push received on phone
- [ ] Check payment status updates
- [ ] Verify tier upgrade after payment
- [ ] Test payment failure scenarios
- [ ] Check transaction history displays correctly

### PayPal Testing
- [ ] Sandbox credentials configured
- [ ] Sandbox buyer account created
- [ ] Test payment flow
- [ ] Verify redirect to PayPal works
- [ ] Complete test payment
- [ ] Verify payment capture
- [ ] Verify tier upgrade after payment
- [ ] Check transaction history displays correctly

---

## 🚀 Going Live

### Pre-Launch Checklist

#### M-PESA Production:
- [ ] Apply for production credentials from Safaricom
- [ ] Get production shortcode and passkey
- [ ] Update `.env` with production credentials
- [ ] Set `MPESA_ENV="production"`
- [ ] Ensure callback URL is HTTPS
- [ ] Test with real phone numbers
- [ ] Monitor callback logs
- [ ] Set up error alerting

#### PayPal Production:
- [ ] Switch to live credentials
- [ ] Set `PAYPAL_MODE="production"`
- [ ] Update return URLs to production domain
- [ ] Test with real PayPal accounts
- [ ] Verify payment capture works
- [ ] Set up webhook monitoring
- [ ] Configure email notifications

### Security Checklist
- [ ] All credentials in environment variables (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enabled on production
- [ ] Callback endpoints secured
- [ ] Error messages don't expose sensitive data
- [ ] Payment logs don't contain sensitive information
- [ ] Rate limiting on payment endpoints
- [ ] CSRF protection enabled

---

## 🐛 Troubleshooting

### M-PESA Issues

#### "Failed to authenticate with M-PESA"
- Check consumer key and secret are correct
- Verify you're using the right environment (sandbox/production)
- Ensure credentials match the environment

#### "STK Push not received on phone"
- Verify phone number format (254XXXXXXXXX)
- Check if phone is M-PESA registered
- Ensure shortcode is correct
- Verify passkey matches shortcode

#### "Callback not received"
- Check callback URL is accessible
- Use ngrok for local development
- Verify URL is HTTPS in production
- Check server logs for errors
- Test callback URL with curl

#### "Payment stuck in PENDING"
- User may have cancelled on phone
- Check M-PESA transaction status
- Query payment status via API
- Set up timeout handling (60 seconds)

### PayPal Issues

#### "Failed to create PayPal order"
- Verify client ID and secret are correct
- Check if using correct mode (sandbox/production)
- Ensure amount is valid (> 0)
- Check currency is supported

#### "Payment not captured"
- Verify order ID is correct
- Check if order was already captured
- Ensure user completed payment on PayPal
- Check PayPal account status

#### "Redirect not working"
- Verify return URLs are correct
- Check NEXT_PUBLIC_APP_URL is set
- Ensure URLs are accessible
- Test with different browsers

---

## 📊 Monitoring & Logs

### What to Monitor

1. **Payment Success Rate**: Track completed vs failed payments
2. **Average Payment Time**: How long payments take
3. **Callback Response Time**: M-PESA callback latency
4. **Error Rates**: Failed payments by reason
5. **Revenue**: Total payments by tier

### Logging Best Practices

```typescript
// Log payment initiation
console.log('Payment initiated:', {
  paymentId,
  tier,
  amount,
  method,
});

// Log payment completion
console.log('Payment completed:', {
  paymentId,
  transactionId,
  status,
});

// Log errors (without sensitive data)
console.error('Payment error:', {
  paymentId,
  error: error.message,
  // Don't log: credentials, full phone numbers, etc.
});
```

---

## 💡 Tips & Best Practices

### M-PESA
1. Always format phone numbers to 254XXXXXXXXX
2. Set reasonable timeout (60 seconds for STK Push)
3. Handle user cancellation gracefully
4. Store checkout request ID for status queries
5. Test callback URL accessibility before going live

### PayPal
1. Use sandbox extensively before production
2. Handle all redirect scenarios (success, cancel, error)
3. Capture payments immediately after approval
4. Store PayPal order ID for reference
5. Test with different currencies if needed

### General
1. Never store payment credentials in code
2. Use environment variables for all config
3. Log all payment events for debugging
4. Set up alerts for payment failures
5. Regularly reconcile payments with bank statements
6. Keep test and production credentials separate
7. Document your payment flow for team members

---

## 📞 Support Resources

### M-PESA
- [Daraja API Documentation](https://developer.safaricom.co.ke/docs)
- [Daraja Support](https://developer.safaricom.co.ke/support)
- Email: apisupport@safaricom.co.ke

### PayPal
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Support](https://www.paypal.com/us/smarthelp/contact-us)
- [PayPal Developer Community](https://www.paypal-community.com/)

---

## ✅ Quick Start

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Add your credentials** to `.env`

3. **For local development with M-PESA**:
   ```bash
   # Terminal 1: Start app
   npm run dev
   
   # Terminal 2: Start ngrok
   ngrok http 3000
   
   # Update MPESA_CALLBACK_URL in .env with ngrok URL
   ```

4. **Test payments**:
   - Go to `/dashboard/upgrade`
   - Select a tier
   - Choose payment method
   - Complete test payment

5. **Check transaction history**:
   - Go to `/dashboard/payments`
   - Verify payment appears

---

**Need Help?** Check the troubleshooting section or contact support!

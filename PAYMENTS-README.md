# 💳 Payments System - Quick Reference

## Overview
The Daraja Directory now has a fully functional payment system supporting M-PESA and PayPal for tier upgrades.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd daraja-directory
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and add your credentials:

```env
# M-PESA
MPESA_ENV="sandbox"
MPESA_CONSUMER_KEY="your_key"
MPESA_CONSUMER_SECRET="your_secret"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="your_passkey"
MPESA_CALLBACK_URL="https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback"

# PayPal
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your_client_id"
PAYPAL_CLIENT_SECRET="your_secret"
```

### 3. Set Up Local Development (M-PESA)
```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the ngrok HTTPS URL and update MPESA_CALLBACK_URL in .env
```

### 4. Test Payments
1. Navigate to `http://localhost:3000/dashboard/upgrade`
2. Select a tier (Self-Assessment or Daraja Verified)
3. Choose payment method (M-PESA or PayPal)
4. Complete test payment

## 📁 Key Files

### Payment Libraries
- `src/lib/mpesa.ts` - M-PESA integration
- `src/lib/paypal.ts` - PayPal integration
- `src/lib/payment-utils.ts` - Shared utilities

### API Endpoints
- `POST /api/payments/mpesa/initiate` - Start M-PESA payment
- `POST /api/payments/mpesa/callback` - M-PESA callback handler
- `GET /api/payments/mpesa/status` - Check payment status
- `POST /api/payments/paypal/create` - Create PayPal order
- `POST /api/payments/paypal/capture` - Capture PayPal payment
- `GET /api/payments/history` - Get transaction history

### Pages
- `/dashboard/upgrade` - View pricing tiers
- `/dashboard/upgrade/[tier]` - Payment checkout
- `/dashboard/payments` - Transaction history
- `/dashboard/payments/success` - Payment success page

## 💰 Pricing

| Tier | KES | USD |
|------|-----|-----|
| Basic Free | 0 | 0 |
| Self-Assessment | 5,000 | 39 |
| Daraja Verified | 15,000 | 115 |

## 🔄 Payment Flow

### M-PESA
1. User enters phone number
2. STK Push sent to phone
3. User enters M-PESA PIN
4. Callback received
5. Tier upgraded automatically

### PayPal
1. User clicks PayPal button
2. Redirected to PayPal
3. User completes payment
4. Returned to success page
5. Tier upgraded automatically

## 🧪 Testing

### M-PESA Sandbox
- Use any valid Kenyan phone number
- Payments auto-complete in sandbox
- No real money charged

### PayPal Sandbox
- Create sandbox accounts at developer.paypal.com
- Use sandbox buyer account for testing
- No real money charged

## 📊 Payment Status

- **PENDING** - Payment initiated, awaiting confirmation
- **COMPLETED** - Payment successful, tier upgraded
- **FAILED** - Payment failed or cancelled
- **REFUNDED** - Payment refunded (admin action)

## 🔐 Security

- All endpoints require JWT authentication
- Users can only access their own payments
- Callbacks are validated before processing
- Database transactions ensure data integrity

## 📚 Documentation

- `PHASE4-COMPLETE.md` - Complete implementation details
- `PAYMENT-SETUP-GUIDE.md` - Detailed setup instructions
- `PROJECT-STATUS.md` - Overall project status

## 🐛 Troubleshooting

### M-PESA not working?
1. Check credentials are correct
2. Verify callback URL is accessible (use ngrok)
3. Ensure phone number format is correct (254XXXXXXXXX)
4. Check server logs for errors

### PayPal not working?
1. Verify client ID and secret
2. Check mode (sandbox/production)
3. Ensure return URLs are correct
4. Test with sandbox accounts first

## 📞 Need Help?

1. Check `PAYMENT-SETUP-GUIDE.md` for detailed instructions
2. Review `PHASE4-COMPLETE.md` for technical details
3. Check troubleshooting section in setup guide
4. Contact M-PESA/PayPal support if needed

## ✅ Checklist Before Going Live

- [ ] Production M-PESA credentials configured
- [ ] Production PayPal credentials configured
- [ ] Callback URL is HTTPS
- [ ] Test with real payments (small amounts)
- [ ] Email notifications set up
- [ ] Error monitoring configured
- [ ] Payment reconciliation process documented

## 🎉 What's Working

✅ M-PESA STK Push payments
✅ PayPal payments
✅ Automatic tier upgrades
✅ Transaction history
✅ Payment status tracking
✅ Error handling
✅ Real-time status updates

## 🔮 Coming Soon

- Email payment receipts
- PDF invoice generation
- Automated refund system
- Admin payment management
- Payment analytics dashboard

---

**Version**: 1.0.0
**Last Updated**: December 2, 2025
**Status**: Production Ready (with sandbox credentials)

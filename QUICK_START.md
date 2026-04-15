# CareLink Platform - Payment Integration Quick Start Guide

This guide helps you quickly set up and test the payment integration.

## ⚡ Quick Start (5 minutes)

### Prerequisites

- ✅ .NET 8.0 SDK installed
- ✅ Node.js 18+ installed
- ✅ PostgreSQL running
- ✅ Stripe test account (https://dashboard.stripe.com)

### Step 1: Configure Environment Variables

**Backend (.env in root directory)**:

```bash
Stripe:SecretKey=sk_test_xxxxx
ConnectionStrings:DefaultConnection=postgresql://postgres:password@localhost:5432/carelink
Jwt:Key=your-secret-key-min-32-characters
Jwt:Issuer=CareLink
Jwt:Audience=CareLink
```

**Frontend (.env in frontend directory)**:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

### Step 2: Start Services

**Backend**:

```bash
cd backend
docker-compose up -d  # or dotnet run --project Services/PaymentService/PaymentService.csproj
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev
```

### Step 3: Access the Application

- Frontend: http://localhost:5173
- API Gateway: http://localhost:5000
- Payment Service Swagger: http://localhost:5005/swagger/index.html

### Step 4: Test Payment Flow

1. **Log In**: Register/Login with test credentials
2. **Book Appointment**: Navigate to "Find Doctors" → Select Doctor → Book
3. **Make Payment**: Click "Proceed to Payment"
4. **Enter Test Card**: Use `4242 4242 4242 4242`
5. **Complete Payment**: Fill form and submit
6. **View Receipt**: See payment confirmation page

## 🧪 Testing with Stripe Test Cards

### Success Scenarios

| Card Number         | Expiry          | CVC          | Result                |
| ------------------- | --------------- | ------------ | --------------------- |
| 4242 4242 4242 4242 | Any future date | Any 3 digits | ✅ Payment succeeds   |
| 4000 0000 0000 3220 | Any future date | Any 3 digits | ✅ Requires 3D Secure |
| 5555 5555 5555 4444 | Any future date | Any 3 digits | ✅ Mastercard success |

### Failure Scenarios

| Card Number         | Expiry          | CVC          | Result              |
| ------------------- | --------------- | ------------ | ------------------- |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | ❌ Card declined    |
| 4000 0000 0000 0069 | Any past date   | Any 3 digits | ❌ Card expired     |
| 4000 0000 0000 0119 | Any future date | Any 3 digits | ❌ Processing error |

## 🔍 Debugging

### Check Payment in Database

```sql
SELECT * FROM "Payments" ORDER BY "CreatedAt" DESC LIMIT 1;
```

### View API Logs

```bash
# Backend logs
docker logs carelink-payment-service

# Frontend logs
# Check browser console (F12)
```

### Test API Directly

```bash
# Create session
curl -X POST http://localhost:5000/api/v1/payments/create-session \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "patientId": "patient-id",
    "appointmentId": 1,
    "doctorId": "doctor-id",
    "successUrl": "http://localhost:5173/payment/success",
    "cancelUrl": "http://localhost:5173/payment/cancel"
  }'
```

## 📊 Monitoring

### Real-Time Monitoring

1. Navigate to Stripe Dashboard: https://dashboard.stripe.com
2. Go to **Payments** section
3. View latest transactions
4. Check webhook logs in **Developers** → **Webhooks**

### Application Monitoring

**API Gateway**:

```bash
curl http://localhost:5000/api/Health
```

**Payment Service**:

```bash
curl http://localhost:5005/api/Health
```

## 🛠️ Troubleshooting

### Issue: "Invalid currency"

**Solution**: Ensure currency is exactly "USD" or "LKR" (case-insensitive in API)

### Issue: "Checkout URL not found"

**Solution**: Verify success/cancel URLs in request are absolute URLs (include http/https)

### Issue: "Amount is below minimum"

**Solution**: For USD, minimum is 50 cents (50 in cents). For LKR, check Stripe limits

### Issue: Authentication error

**Solution**:

1. Ensure JWT token is valid: `http://localhost:5000/swagger/index.html`
2. Check token isn't expired
3. Include `Authorization: Bearer <token>` header

### Issue: Database connection failed

**Solution**:

1. Check PostgreSQL is running: `psql -U postgres`
2. Verify connection string in .env
3. Run migrations if needed

## 📝 Common Commands

### Backend Development

```bash
# Start PaymentService only
cd backend/Services/PaymentService
dotnet run

# Run tests
dotnet test

# View database
psql -U postgres -d carelink

# Check migrations
dotnet ef migrations list
```

### Frontend Development

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Check code quality
npm run lint
```

### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker logs carelink-payment-service

# Stop all services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

## 🔐 Security Checklist

- [ ] JWT token is properly validated
- [ ] Stripe secret key is not in version control
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Request validation on all endpoints
- [ ] Rate limiting configured
- [ ] Logging doesn't expose sensitive data
- [ ] Webhook signature verified

## 📚 Documentation Links

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [ASP.NET Core Docs](https://docs.microsoft.com/en-us/aspnet/core/)
- [React Documentation](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🐛 Report Issues

Found a bug? Create an issue with:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment (OS, browser, versions)
5. Error logs/screenshots

## 📞 Support

For payment integration support:

- Email: payment-support@carelink.com
- Phone: +1-XXX-XXX-XXXX
- Slack: #payments-integration

## ✅ Verification Checklist

- [ ] Backend services running
- [ ] Frontend app running
- [ ] Database connected
- [ ] Stripe keys configured
- [ ] Can log in
- [ ] Can book appointment
- [ ] Can proceed to payment
- [ ] Payment page loads correctly
- [ ] Can enter test card
- [ ] Payment succeeds/cancels properly
- [ ] Success page shows receipt
- [ ] Cancel page shows cancellation
- [ ] Payment record created in database

## 🚀 Next Steps

1. **Test Payment Flow**: Follow quick start above
2. **Review Code**: Check implementation in listed files
3. **Configure CI/CD**: Follow CI_CD_SETUP.md
4. **Deploy**: Follow deployment guide
5. **Monitor**: Set up alerts and monitoring
6. **Webhook Integration**: Implement payment status webhooks

---

**Last Updated**: April 15, 2026
**Version**: 1.0.0
**Status**: Ready for Testing ✅

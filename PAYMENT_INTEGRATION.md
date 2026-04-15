# Payment Integration Implementation Guide

This document provides a comprehensive guide to the payment integration using Stripe, including the complete workflow from checkout to payment confirmation.

## Overview

The CareLink Platform payment integration enables patients to securely pay for medical consultations using Stripe's hosted checkout. The workflow includes:

1. **Payment Initiation**: Patient books appointment and proceeds to payment
2. **Session Creation**: Backend creates a Stripe checkout session and stores payment record
3. **Stripe Redirect**: User is redirected to Stripe's secure checkout page
4. **Payment Processing**: Stripe handles payment collection and fraud prevention
5. **Webhook Handling**: Stripe sends webhooks to update payment status
6. **Success/Cancel Pages**: User is redirected to appropriate page after payment

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CareLink Platform                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │  React Frontend  │          │   .NET Backend   │             │
│  ├──────────────────┤          ├──────────────────┤             │
│  │ Payment Page     │          │ PaymentService   │             │
│  │ Success Page     │◄────────►│ PaymentController│             │
│  │ Cancel Page      │          │ CreateSession    │             │
│  │                  │          │ Endpoints        │             │
│  └──────────────────┘          └────────┬─────────┘             │
│                                         │                        │
│         ┌───────────────────────────────┬────────────────┐      │
│         │                               │                │      │
│         ▼                               ▼                ▼      │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │ Stripe Checkout  │          │ PostgreSQL DB    │             │
│  │ (Hosted)         │          │ (Payment Records)│             │
│  └──────────────────┘          └──────────────────┘             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Create Checkout Session

**Endpoint**: `POST /api/v1/payments/create-session`

**Authentication**: Required (Bearer JWT Token)

**Request Body**:

```json
{
  "amount": 5000,
  "currency": "USD",
  "patientId": "patient-uuid",
  "appointmentId": 123,
  "doctorId": "doctor-uuid",
  "doctorName": "Dr. John Doe",
  "consultationId": 456,
  "successUrl": "http://localhost:5173/payment/success",
  "cancelUrl": "http://localhost:5173/payment/cancel?appointmentId=123",
  "productName": "Consultation with Dr. John Doe",
  "productDescription": "General consultation - 2024-04-15 at 2:00 PM",
  "customerEmail": "patient@example.com",
  "locale": "en",
  "metadata": {
    "appointment_type": "General",
    "appointment_date": "2024-04-15",
    "time_slot": "2:00 PM"
  }
}
```

**Response** (Success - 200 OK):

```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxx",
  "paymentId": 789,
  "expiresAt": "2024-04-15T15:30:00Z",
  "amount": 5000,
  "currency": "USD",
  "consultationId": 456
}
```

**Response** (Validation Error - 422):

```json
{
  "status": 422,
  "title": "Validation Failed",
  "detail": "Validation errors occurred",
  "errors": [
    {
      "field": "Amount",
      "message": "Amount must be greater than 0."
    }
  ]
}
```

## Frontend Implementation

### PaymentPage Component

```jsx
// Key Features:
- Displays appointment summary
- Shows payment amount and currency
- Handles payment initiation
- Manages loading states
- Provides error feedback via toast notifications
```

**Payment Flow**:

1. User books appointment → `AppointmentFormPage`
2. Appointment details stored in route state
3. User clicks "Proceed to Payment" → Navigate to `/payment`
4. `PaymentPage` displays appointment summary
5. User clicks "Pay Now" → API call to `/create-session`
6. Backend returns Stripe checkout URL
7. User redirected to Stripe hosted page
8. After payment, user redirected to `/payment/success` or `/payment/cancel`

### Success Handling

After successful payment, user is redirected to:

```
https://app.example.com/payment/success?session_id=cs_test_xxx&payment_id=789
```

The `PaymentSuccessPage` will:

1. Extract `paymentId` from URL
2. Fetch payment details from backend
3. Display transaction receipt
4. Show next steps (view appointments, go to dashboard)

### Cancellation Handling

If user cancels payment:

```
https://app.example.com/payment/cancel?appointmentId=123&session_id=cs_test_xxx
```

The `PaymentCancelPage` will:

1. Show cancellation message
2. Allow user to retry payment
3. Provide links to appointments and dashboard

## Backend Implementation

### Payment Service

The `PaymentService` handles:

1. **Payment Creation**: Creates pending payment records
2. **Stripe Integration**: Creates checkout sessions
3. **Data Storage**: Stores Stripe session IDs and transaction details
4. **Payment Retrieval**: Fetches payment records by ID or consultation

### Database Schema

```csharp
public class Payment : AuditableEntity
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public string PatientId { get; set; }
    public string DoctorId { get; set; }

    // Payment Details
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string PaymentMethod { get; set; }
    public string PaymentStatus { get; set; }

    // Transaction Details
    public string? TransactionId { get; set; }
    public string? PaymentGateway { get; set; }
    public DateTime? PaidAt { get; set; }

    // Stripe Integration
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public int? ConsultationId { get; set; }
    public string? Metadata { get; set; }
}
```

### Configuration

Set the following environment variables:

```bash
# Stripe Configuration
Stripe:SecretKey=sk_test_xxxxx            # Stripe Secret Key (test or live)
Stripe:PublishableKey=pk_test_xxxxx       # Stripe Publishable Key

# Database Configuration
ConnectionStrings:DefaultConnection=postgresql://user:password@host:5432/carelink

# JWT Configuration
Jwt:Key=your-secret-key-min-32-chars
Jwt:Issuer=CareLink
Jwt:Audience=CareLink
```

## Stripe Webhook Integration

To handle payment completion and status updates, implement webhook endpoint:

```csharp
[HttpPost("webhook")]
[AllowAnonymous]
public async Task<IActionResult> HandleStripeWebhook()
{
    // Receive webhook from Stripe
    // Update payment status based on event type:
    // - charge.succeeded → PaymentCompleted
    // - charge.failed → PaymentFailed
    // - charge.refunded → PaymentRefunded
    // - checkout.session.completed → Order Processing
}
```

## Testing the Payment Flow

### 1. Frontend Testing

Install Stripe testing cards:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Expired: 4000 0000 0000 0069
```

Test flow:

```
1. Navigate to appointment booking
2. Select doctor and time
3. Proceed to payment
4. Enter test card details
5. Verify success/cancel pages
```

### 2. Backend Testing

Test the API endpoint:

```bash
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

## Deployment

### Docker Compose (Development)

1. Start services:

```bash
cd backend
docker-compose up -d
```

2. Configure Stripe:

```bash
echo "Stripe:SecretKey=sk_test_xxxxx" >> .env
```

### Kubernetes (Production)

1. Create secrets:

```bash
kubectl create secret generic stripe-secrets \
  --from-literal=SecretKey=sk_live_xxxxx \
  --from-literal=PublishableKey=pk_live_xxxxx
```

2. Apply manifests:

```bash
kubectl apply -f kubernetes/
```

## Debugging

### Common Issues

1. **"Invalid currency"**: Ensure currency is `USD` or `LKR` (case-insensitive)
2. **"Amount is below minimum"**: For USD, minimum is 50 cents (50 in cents)
3. **"Checkout URL not found"**: Verify `successUrl` and `cancelUrl` are valid absolute URLs
4. **"User not authenticated"**: Ensure JWT token is included in Authorization header

### Logging

Enable debug logs:

```csharp
.ConfigureLogging(logging => {
    logging.ClearProviders();
    logging.AddConsole();
    logging.LogInformation("[{RequestId}] Payment session created", requestId);
})
```

## Next Steps

1. **Webhook Implementation**: Set up Stripe webhooks for real-time payment updates
2. **Refund Management**: Implement refund functionality
3. **Invoice Generation**: Create PDF invoices for proven payments
4. **Payment History**: Build payment history view for admin dashboard
5. **Multi-currency Support**: Add support for more currencies
6. **Payment Analytics**: Track payment metrics and trends

## Support

For issues or questions:

- Email: payment-support@carelink.com
- Docs: https://stripe.com/docs
- Status: https://status.stripe.com

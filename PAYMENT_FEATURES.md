# Payment Feature Documentation

## Overview

Three comprehensive payment-related pages have been created for the CareLink Platform to allow patients to view their payment history, payment details, and generate receipts.

## Features Created

### 1. Payment History Page (`/payment/history`)

**Location:** `frontend/src/features/payment/pages/PaymentHistoryPage.jsx`

**Features:**

- Displays all payments for the logged-in patient
- **Pagination:** View payments in groups of 10 (customizable via pageSize)
- **Filtering:**
  - By Payment Status: All, Pending, Completed, Failed, Refund Pending, Refunded
  - By Date Range: Select from date and to date
- **Table Display:**
  - Payment Date (formatted as local date)
  - Doctor Name/ID
  - Amount (formatted with currency - USD or LKR)
  - Payment Status (color-coded badges)
  - Transaction ID (truncated for security)
  - Action buttons: "Details" and "Receipt" (if paid)

**Usage:**

```
Click "Payment History" in the sidebar to access this page
Apply filters and pagination to find specific payments
Click "Details" to see full payment information
Click "Receipt" to view/print the payment receipt
```

---

### 2. Payment Details Page (`/payment/details/:paymentId`)

**Location:** `frontend/src/features/payment/pages/PaymentDetailsPage.jsx`

**Features:**

- Displays comprehensive payment information
- **Status Header:** Shows payment ID, creation date, and current status
- **Payment Information Grid:**
  - Left column: Payment method, gateway, transaction ID, appointment ID
  - Right column: Patient ID, doctor ID, consultation ID, paid date
- **Stripe Information Section:** (if applicable)
  - Session ID
  - Payment Intent ID
- **Notes Section:** Any additional payment notes
- **Action Buttons:**
  - Back to History
  - View Receipt (if completed)
  - Print Receipt (if completed)

**Status Colors:**

- 🟢 Completed: Green badge
- 🟡 Pending: Yellow badge
- 🔴 Failed: Red badge
- 🟠 Refund Pending: Orange badge
- 🔵 Refunded: Blue badge

**Usage:**

```
Click "Details" from Payment History page
Review all payment information
Click "View Receipt" to see formatted receipt
Click "Print Receipt" to open print dialog and print the receipt
```

---

### 3. Receipt Page (`/payment/receipt/:paymentId`)

**Location:** `frontend/src/features/payment/pages/ReceiptPage.jsx`

**Features:**

- Professional receipt display optimized for printing
- **Receipt Header:** CareLink branding with "PAYMENT RECEIPT" title
- **Receipt Information:**
  - Receipt Number (#RCP-{paymentId})
  - Receipt Date (current date)
  - Payment Status (PAID or PENDING)
- **Patient Information:** Patient ID, transaction ID
- **Service Information:**
  - Service type (Consultation)
  - Appointment ID
  - Doctor ID
  - Consultation ID
- **Payment Breakdown:**
  - Consultation Fee
  - Tax (0.00 by default)
  - Service Charge (0.00 by default)
  - **Total Amount** (highlighted)
- **Payment Details:**
  - Payment method
  - Payment gateway
  - Currency
  - Payment date
- **Stripe Transaction Information:** (if applicable)
  - Session ID (full)
- **Footer:** Contact information and thank you message

**Print Support:**

- Optimized styling for printing (no shadows, no rounded corners)
- Print-specific footer with generation timestamp
- Auto-print functionality via URL parameter: `/payment/receipt/{id}?print=true`
- Professional layout suitable for personal records

**Planned Features:**

- PDF download support (requires html2pdf library integration)

**Usage:**

```
View Receipt:
  1. From Payment Details page, click "View Receipt"
  2. Receipt will open in a new formatted view

Print Receipt:
  1. Click "Print" button on Receipt page
  2. System print dialog will open
  3. Select printer and print settings
  4. Alternatively, click "Print Receipt" from Details page

Direct Print:
  Navigate to: /payment/receipt/{paymentId}?print=true
  Browser will auto-open print dialog
```

---

## API Integration

### Functions Used

#### `getPaymentHistory(page, pageSize, status, fromDate, toDate)`

- **Purpose:** Fetch paginated payment history with optional filtering
- **Parameters:**
  - `page` (number): Page number (default: 1)
  - `pageSize` (number): Items per page (default: 10)
  - `status` (string|null): Payment status filter
  - `fromDate` (string|null): Start date (ISO format)
  - `toDate` (string|null): End date (ISO format)
- **Returns:** { data: PaginatedResponse, error: null } or { data: null, error: string }

#### `getPaymentById(paymentId)`

- **Purpose:** Fetch single payment details by ID
- **Parameters:**
  - `paymentId` (number): Payment ID
- **Returns:** { data: PaymentResponseDto, error: null } or { data: null, error: string }

**Example Usage:**

```javascript
// Fetch payment history for page 1 with status filter
const result = await getPaymentHistory(1, 10, "PaymentCompleted");

// Fetch single payment
const payment = await getPaymentById(5);

// Fetch with date range
const payments = await getPaymentHistory(
  1,
  10,
  null,
  "2024-01-01",
  "2024-01-31"
);
```

---

## Backend Requirements

The backend must have:

1. ✅ Payment controller with `GetAll` endpoint supporting:
   - Pagination (page, pageSize)
   - Status filtering
   - Date range filtering (fromDate, toDate)
   - Authorization (patients see only their own payments)

2. ✅ Payment service with:
   - `GetPaginatedAsync()` method
   - `GetByIdAsync()` method
   - Transaction support for payment operations

3. ✅ Payment repository with:
   - `GetPaginatedAsync()` implementation
   - `GetByIdAsync()` implementation
   - List filtering logic

**Status Enum Values:**

- `PaymentPending` - Payment is pending
- `PaymentCompleted` - Payment successfully completed
- `PaymentFailed` - Payment processing failed
- `RefundPending` - Refund being processed
- `RefundCompleted` - Refund completed
- `Active` - Active payment
- `Deleted` - Soft deleted payment

---

## Navigation Integration

### Sidebar Menu

The "Payment History" link (💳) has been added to the patient sidebar navigation after "Medical Reports".

**Path:** `/components/dashboard/Sidebar.jsx`

```javascript
{ to: '/payment/history', icon: '💳', label: 'Payment History' }
```

---

## Color Scheme

**Status Badges:**

- Completed: `bg-green-100 text-green-800`
- Pending: `bg-yellow-100 text-yellow-800`
- Failed: `bg-red-100 text-red-800`
- Refund Pending: `bg-orange-100 text-orange-800`
- Refunded: `bg-blue-100 text-blue-800`
- Active: `bg-green-100 text-green-800`

**Action Buttons:**

- Primary: Blue (#2563EB) - View Details, View Receipt
- Secondary: Green (#16a34a) - Print Receipt
- Tertiary: Gray (#D1D5DB) - Back, Cancel

---

## Error Handling

All pages include:

- Loading states with spinner animations
- Error toasts using Sonner toast library
- Graceful handling of missing payments
- Navigation fallbacks to payment history on errors
- Try-catch error handling with logging

---

## Responsive Design

All pages are fully responsive:

- **Desktop:** Full layouts with side-by-side information
- **Tablet:** Adjusted grid layouts
- **Mobile:** Single column layouts with optimized spacing

---

## Security Considerations

1. **Authorization:** Only authenticated patients can access their payment history
2. **ID Masking:** Transaction IDs truncated in table view for privacy
3. **JWT Token:** All API calls include authorization header
4. **Patient Isolation:** Patients see only their own payments
5. **Data Validation:** Input validation on all filter parameters

---

## Future Enhancements

1. ✏️ **PDF Download:** Integrate html2pdf for PDF receipt downloads
2. 📧 **Email Receipt:** Send receipt via email functionality
3. 📊 **Payment Analytics:** Monthly spending charts and statistics
4. 🔄 **Refund Management:** Initiate refunds from UI
5. 📱 **Mobile App:** Native mobile application support
6. 💰 **Invoice Generation:** Separate invoicing system
7. 📋 **CSV Export:** Export payment history to CSV

---

## Testing Checklist

- [ ] Navigate to Payment History page
- [ ] Verify pagination works (multiple pages)
- [ ] Filter by status and verify results
- [ ] Filter by date range and verify results
- [ ] Click Details button and verify all information displays
- [ ] Click View Receipt and verify receipt displays correctly
- [ ] Click Print Receipt and verify print dialog opens
- [ ] Test print functionality (can print to PDF)
- [ ] Navigate back from Detail and Receipt pages
- [ ] Test on mobile, tablet, and desktop views
- [ ] Verify error handling (no payment found, API errors)

---

## File References

**Frontend Pages:**

- [PaymentHistoryPage.jsx](frontend/src/features/payment/pages/PaymentHistoryPage.jsx)
- [PaymentDetailsPage.jsx](frontend/src/features/payment/pages/PaymentDetailsPage.jsx)
- [ReceiptPage.jsx](frontend/src/features/payment/pages/ReceiptPage.jsx)

**API Integration:**

- [paymentApi.js](frontend/src/features/payment/api/paymentApi.js) - Updated

**Routing:**

- [App.jsx](frontend/src/App.jsx) - Updated

**Navigation:**

- [Sidebar.jsx](frontend/src/components/dashboard/Sidebar.jsx) - Updated

**Backend (Existing):**

- [PaymentController.cs](backend/Services/PaymentService/Controllers/PaymentController.cs)
- [PaymentService.cs](backend/Services/PaymentService/Services/PaymentService.cs)
- [PaymentRepository.cs](backend/Services/PaymentService/Repositories/PaymentRepository.cs)

---

## Support

For issues or questions about payment features:

1. Check error messages and console logs
2. Verify backend API is running and accessible
3. Confirm authentication token is valid
4. Check network requests in browser DevTools
5. Review error logs in backend

---

**Last Updated:** April 16, 2026
**Version:** 1.0.0

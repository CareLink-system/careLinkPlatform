# Payment Features - Quick Start Guide

## What's New?

Three brand new pages have been added to the CareLink Platform that allow patients to track and view their payments:

### 🏦 Payment History

View all your payments with filtering and sorting

- **URL:** `/payment/history`
- **Access:** Click "Payment History" in the sidebar (💳 icon)

### 📄 Payment Details

View complete information about a specific payment

- **URL:** `/payment/details/{paymentId}`
- **Access:** Click "Details" from Payment History

### 🧾 Payment Receipt

Professional receipt suitable for printing and archiving

- **URL:** `/payment/receipt/{paymentId}`
- **Access:** Click "Receipt" from Payment History or Details page

---

## Features at a Glance

### Payment History Page

```
✅ View all payments for the logged-in patient
✅ Paginate through payments (10 per page)
✅ Filter by payment status (Pending, Completed, Failed, Refunded)
✅ Filter by date range
✅ View quick details: date, doctor, amount, status
✅ Quick action buttons: View Details, View Receipt
```

### Payment Details Page

```
✅ Complete payment information display
✅ Patient, doctor, and appointment details
✅ Transaction IDs and payment gateway info
✅ Stripe integration details (if applicable)
✅ Payment notes and metadata
✅ Action buttons to view or print receipt
```

### Receipt Page

```
✅ Professional formatted receipt
✅ Print-optimized styling
✅ Receipt number and date
✅ Complete payment breakdown
✅ Customer and service information
✅ Stripe transaction details
✅ Print directly (Ctrl+P or Print button)
✅ Auto-print support via URL parameter
```

---

## How to Use

### 1️⃣ View Payment History

1. Log in as a patient
2. Click **"Payment History"** (💳) in the sidebar
3. Use filters to find specific payments
4. Click **"Details"** to see more information

### 2️⃣ View Payment Details

1. From Payment History, click **"Details"**
2. View complete payment information
3. Click **"View Receipt"** or **"Print Receipt"**

### 3️⃣ View/Print Receipt

1. From Payment Details, click **"View Receipt"**
2. Receipt opens in a formatted view
3. Click **"Print"** to open browser print dialog
4. Select printer and print settings
5. Click **"Print"** to confirm

**Alternative (Direct URL):**

- Visit: `http://localhost:5173/payment/receipt/{paymentId}?print=true`
- Browser will auto-open print dialog

---

## Status Indicators

| Status             | Color     | Meaning                        |
| ------------------ | --------- | ------------------------------ |
| **Completed**      | 🟢 Green  | Payment successfully processed |
| **Pending**        | 🟡 Yellow | Payment awaiting completion    |
| **Failed**         | 🔴 Red    | Payment processing failed      |
| **Refund Pending** | 🟠 Orange | Refund being processed         |
| **Refunded**       | 🔵 Blue   | Payment refunded               |

---

## API Information

The pages use the following API endpoints (already implemented in backend):

### Get Payment History

```
GET /api/v1/payments?page=1&pageSize=10&status=PaymentCompleted&fromDate=2024-01-01&toDate=2024-12-31
```

### Get Payment Details

```
GET /api/v1/payments/{paymentId}
```

All endpoints require:

- Authentication: Bearer JWT token in Authorization header
- User must be authenticated patient

---

## Troubleshooting

| Issue                    | Solution                                               |
| ------------------------ | ------------------------------------------------------ |
| "Payment not found"      | Verify payment ID exists and belongs to you            |
| "Failed to fetch"        | Check internet connection and API server status        |
| Print dialog not opening | Click "Print" button or press Ctrl+P                   |
| Filters not working      | Verify date format (YYYY-MM-DD) and status spelling    |
| Data not loading         | Refresh page (F5) and check browser console for errors |

---

## Mobile Support

All payment pages are fully responsive and work on:

- ✅ Desktop (1280px+)
- ✅ Tablet (768px - 1279px)
- ✅ Mobile (< 768px)

---

## Keyboard Shortcuts

| Shortcut | Action                              |
| -------- | ----------------------------------- |
| Ctrl+P   | Open print dialog (on Receipt page) |
| Escape   | Close dialog/modal                  |
| Tab      | Navigate between form fields        |
| Enter    | Submit filter form                  |

---

## Important Notes

1. **Privacy:** Only you can see your own payments
2. **Receipt Numbers:** Formatted as #RCP-{PaymentId}
3. **Timestamps:** All dates displayed in your local timezone
4. **Currency:** Displays in USD or LKR based on transaction
5. **Print Quality:** Use modern browser (Chrome/Firefox/Edge) for best print results

---

## File Structure

```
frontend/
├── src/
│   ├── features/
│   │   └── payment/
│   │       ├── api/
│   │       │   └── paymentApi.js ✏️ (Updated with date filtering)
│   │       └── pages/
│   │           ├── PaymentHistoryPage.jsx ✨ (NEW)
│   │           ├── PaymentDetailsPage.jsx ✨ (NEW)
│   │           ├── ReceiptPage.jsx ✨ (NEW)
│   │           ├── PaymentPage.jsx (Checkout - existing)
│   │           ├── PaymentSuccessPage.jsx (Success - existing)
│   │           └── PaymentCancelPage.jsx (Cancel - existing)
│   ├── components/
│   │   └── dashboard/
│   │       └── Sidebar.jsx ✏️ (Added Payment History link)
│   └── App.jsx ✏️ (Added 3 new routes)
```

---

## What's Needed from Backend

Your backend already has everything required:

- ✅ Payment Controller with GetAll endpoint
- ✅ Payment Service with filtering methods
- ✅ Payment Repository with pagination
- ✅ Authorization checks (patients see only own)
- ✅ Date filtering support

**No backend changes needed!**

---

## Future Enhancements

Planned features for next versions:

- 📥 PDF download support
- 📧 Email receipt delivery
- 📊 Payment statistics dashboard
- 💰 Refund processing from UI
- 📋 CSV/Excel export
- 🔔 Payment notifications

---

## Questions?

Refer to:

- [PAYMENT_FEATURES.md](PAYMENT_FEATURES.md) - Detailed documentation
- Backend: PaymentController, PaymentService, PaymentRepository
- Frontend: paymentApi.js for API integration

---

**Created:** April 16, 2026
**Status:** ✅ Ready to Use

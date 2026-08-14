// frontend/src/features/payment/api/paymentApi.js
import axios from "axios";
import { getStoredAuth } from "../../auth/api/authApi";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/v1/payments"
});

API.interceptors.request.use((config) => {
  const stored = getStoredAuth();
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`;
  }
  return config;
});

/**
 * Create Stripe Checkout Session
 * @param {Object} paymentData - Payment data object
 * @param {number} paymentData.amount - Amount in cents (e.g., 5000 for $50.00)
 * @param {string} paymentData.currency - Currency code (USD or LKR)
 * @param {string} paymentData.patientId - Patient ID (UUID)
 * @param {number} paymentData.appointmentId - Appointment ID
 * @param {string} paymentData.doctorId - Doctor ID (UUID)
 * @param {string} paymentData.doctorName - Doctor name for display
 * @param {number} paymentData.consultationId - Consultation ID (optional)
 * @param {string} paymentData.successUrl - Success redirect URL
 * @param {string} paymentData.cancelUrl - Cancel redirect URL
 * @param {string} paymentData.productName - Product name
 * @param {string} paymentData.productDescription - Product description
 * @param {string} paymentData.customerEmail - Customer email
 * @param {string} paymentData.locale - Locale code
 * @returns {Promise<Object>} - { data: CheckoutSessionResponse, error: null } or { data: null, error: string }
 */
// export const createCheckoutSession = async (paymentData) => {
//   try {
//     console.log("Creating checkout session with data:", paymentData);

//     const res = await API.post("/create-session", paymentData);

//     console.log("Checkout session response:", res.data);

//     return { data: res.data, error: null };
//   } catch (err) {
//     console.error("Checkout session error:", err);

//     const errorMessage =
//       err?.response?.data?.detail ||
//       err?.response?.data?.message ||
//       err?.message ||
//       "Failed to create checkout session";

//     return {
//       data: null,
//       error: errorMessage
//     };
//   }
// };

// Create Stripe Checkout Session with detailed error handling
export const createCheckoutSession = async (paymentData) => {
  try {
    console.log(
      "📤 Creating checkout session with data:",
      JSON.stringify(paymentData, null, 2)
    );

    const res = await API.post("/create-session", paymentData);

    console.log("✅ Checkout session response:", res.data);
    return { data: res.data, error: null };
  } catch (err) {
    console.error("❌ Checkout session error:", err);

    // Detailed error logging
    if (err.response) {
      // Server responded with error status
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
      console.error("Response headers:", err.response.headers);

      // Extract validation errors
      const errorData = err.response.data;

      // Handle validation error response (422)
      if (err.response.status === 422 && errorData.errors) {
        const validationErrors = errorData.errors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ");
        return {
          data: null,
          error: `Validation failed: ${validationErrors}`,
          validationErrors: errorData.errors
        };
      }

      // Handle bad request (400)
      if (err.response.status === 400) {
        return {
          data: null,
          error:
            errorData.detail ||
            errorData.message ||
            "Invalid request data. Please check your input.",
          status: 400
        };
      }

      // Handle unauthorized (401)
      if (err.response.status === 401) {
        return {
          data: null,
          error: "Please login again to continue.",
          status: 401
        };
      }

      // Handle conflict (409)
      if (err.response.status === 409) {
        return {
          data: null,
          error:
            errorData.detail || "Payment already exists for this consultation.",
          status: 409
        };
      }

      // Return server error message
      return {
        data: null,
        error:
          errorData.detail ||
          errorData.message ||
          `Server error: ${err.response.status}`,
        status: err.response.status
      };
    } else if (err.request) {
      // Request was made but no response received
      console.error("No response received:", err.request);
      return {
        data: null,
        error:
          "Unable to connect to server. Please check your internet connection.",
        status: 0
      };
    } else {
      // Something else happened
      console.error("Error setting up request:", err.message);
      return {
        data: null,
        error: `Request failed: ${err.message}`,
        status: 0
      };
    }
  }
};

/**
 * Get payment by ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object>} - { data: PaymentResponseDto, error: null } or { data: null, error: string }
 */
export const getPaymentById = async (paymentId) => {
  try {
    const res = await API.get(`/${paymentId}`);
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Get payment by consultation ID
 * @param {number} consultationId - Consultation ID
 * @returns {Promise<Object>} - { data: PaymentResponseDto, error: null } or { data: null, error: string }
 */
export const getPaymentByConsultationId = async (consultationId) => {
  try {
    const res = await API.get(`/consultation/${consultationId}`);
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Get all payments with pagination
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @param {string} status - Payment status filter
 * @returns {Promise<Object>} - { data: PaginatedResponse, error: null } or { data: null, error: string }
 */
export const getAllPayments = async (
  page = 1,
  pageSize = 10,
  status = null
) => {
  try {
    const params = { page, pageSize };
    if (status) params.status = status;

    const res = await API.get("/", { params });
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data object
 * @param {number} paymentData.appointmentId - Appointment ID
 * @param {string} paymentData.patientId - Patient ID (UUID)
 * @param {string} paymentData.doctorId - Doctor ID (UUID)
 * @param {number} paymentData.amount - Amount in cents
 * @param {string} paymentData.currency - Currency code
 * @param {string} paymentData.paymentMethod - Payment method
 * @param {number} paymentData.paymentStatus - Payment status
 * @param {string} paymentData.transactionId - Transaction ID
 * @param {string} paymentData.paymentGateway - Payment gateway
 * @param {string} paymentData.paidAt - Payment date (ISO string)
 * @param {string} paymentData.notes - Notes
 * @param {number} paymentData.consultationId - Consultation ID
 * @param {string} paymentData.stripeSessionId - Stripe session ID
 * @param {string} paymentData.stripePaymentIntentId - Stripe payment intent ID
 * @param {string} paymentData.metadata - Metadata (stringified JSON)
 * @param {string} requestId - X-Request-ID header (UUID)
 * @param {string} correlationId - X-Correlation-ID header
 * @returns {Promise<Object>} - { data: PaymentResponseDto, error: null } or { data: null, error: string }
 */
export const createPayment = async (
  paymentData,
  requestId = null,
  correlationId = null
) => {
  try {
    console.log("Creating payment with data:", paymentData);

    const headers = {};
    if (requestId) headers["X-Request-ID"] = requestId;
    if (correlationId) headers["X-Correlation-ID"] = correlationId;

    const res = await API.post("/", paymentData, { headers });

    console.log("Payment creation response:", res.data);
    return { data: res.data, error: null };
  } catch (err) {
    console.error("Payment creation error:", err);

    const errorMessage =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to create payment";

    return { data: null, error: errorMessage };
  }
};

/**
 * Get all payments with pagination and date range filtering
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @param {string} status - Payment status filter (optional)
 * @param {string} fromDate - Start date (ISO format) (optional)
 * @param {string} toDate - End date (ISO format) (optional)
 * @returns {Promise<Object>} - { data: PaginatedResponse, error: null } or { data: null, error: string }
 */
export const getPaymentHistory = async (
  page = 1,
  pageSize = 10,
  status = null,
  fromDate = null,
  toDate = null
) => {
  try {
    const params = { page, pageSize };
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const res = await API.get("/", { params });
    return { data: res.data, error: null };
  } catch (err) {
    console.error("Error fetching payment history:", err);
    return { data: null, error: err.message };
  }
};

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
export const createCheckoutSession = async (paymentData) => {
  try {
    console.log("Creating checkout session with data:", paymentData);

    const res = await API.post("/create-session", paymentData);

    console.log("Checkout session response:", res.data);

    return { data: res.data, error: null };
  } catch (err) {
    console.error("Checkout session error:", err);

    const errorMessage =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to create checkout session";

    return {
      data: null,
      error: errorMessage
    };
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

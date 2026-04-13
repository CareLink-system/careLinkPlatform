// feature/paymentTransaction/api/payment.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

const AUTH_STORAGE_KEY = "carelink.auth";

// Helper function to get auth token
function getAuthToken() {
  try {
    const auth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!auth) return null;
    const parsed = JSON.parse(auth);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

// Helper function to set auth header
function setAuthHeader() {
  const token = getAuthToken();
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

// Helper function to generate request ID (UUID)
function generateRequestId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

// Error handler helper
function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (payload.detail) return payload.detail;
  if (payload.title) return payload.title;
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors[0];
  }
  if (payload.message) return payload.message;
  return fallback;
}

// Generic GET request
async function get(path, params = {}, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.get(path, {
      params,
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload;
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// Generic POST request
async function post(path, data, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.post(path, data, {
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload;
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// Generic PUT request
async function put(path, data, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.put(path, data, {
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload;
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// Generic DELETE request
async function del(path, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.delete(path, {
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });

    if (res.status === 204) {
      return { success: true };
    }

    const payload = res.data;
    if (res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload || { success: true };
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// ==================== Payment Status Mapping ====================

/**
 * Payment status enum mapping
 */
export const PaymentStatusEnum = {
  PENDING: 0,
  COMPLETED: 1,
  FAILED: 2,
  REFUNDED: 3,
  CANCELLED: 4
};

/**
 * Get payment status string from enum value
 * @param {number} statusValue - Payment status enum value
 * @returns {string} - Payment status string
 */
export function getPaymentStatusString(statusValue) {
  const statusMap = {
    [PaymentStatusEnum.PENDING]: "Pending",
    [PaymentStatusEnum.COMPLETED]: "Completed",
    [PaymentStatusEnum.FAILED]: "Failed",
    [PaymentStatusEnum.REFUNDED]: "Refunded",
    [PaymentStatusEnum.CANCELLED]: "Cancelled"
  };
  return statusMap[statusValue] || "Unknown";
}

/**
 * Get payment status enum value from string
 * @param {string} statusString - Payment status string
 * @returns {number} - Payment status enum value
 */
export function getPaymentStatusValue(statusString) {
  const statusMap = {
    Pending: PaymentStatusEnum.PENDING,
    Completed: PaymentStatusEnum.COMPLETED,
    Failed: PaymentStatusEnum.FAILED,
    Refunded: PaymentStatusEnum.REFUNDED,
    Cancelled: PaymentStatusEnum.CANCELLED
  };
  return statusMap[statusString] || PaymentStatusEnum.PENDING;
}

// ==================== Payment API Functions ====================

/**
 * Get all payments with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Items per page (default: 10, max: 50)
 * @param {string} params.status - Filter by payment status (Pending, Completed, Failed, Refunded)
 * @param {string} params.fromDate - Filter from date (ISO string)
 * @param {string} params.toDate - Filter to date (ISO string)
 * @param {string} params.patientId - Filter by patient ID
 * @param {string} params.doctorId - Filter by doctor ID
 * @param {number} params.appointmentId - Filter by appointment ID
 * @returns {Promise<Object>} - Paginated payments response
 */
export async function getPayments(params = {}) {
  const queryParams = {};

  if (params.page) queryParams.page = params.page;
  if (params.pageSize) queryParams.pageSize = params.pageSize;
  if (params.status) queryParams.status = params.status;
  if (params.fromDate) queryParams.fromDate = params.fromDate;
  if (params.toDate) queryParams.toDate = params.toDate;
  if (params.patientId) queryParams.patientId = params.patientId;
  if (params.doctorId) queryParams.doctorId = params.doctorId;
  if (params.appointmentId) queryParams.appointmentId = params.appointmentId;

  return get("/api/v1/payments", queryParams);
}

/**
 * Get payment by ID
 * @param {number} id - Payment ID
 * @returns {Promise<Object>} - Payment details
 */
export async function getPaymentById(id) {
  if (!id) throw new Error("Payment ID is required");
  if (isNaN(id)) throw new Error("Payment ID must be a number");
  return get(`/api/v1/payments/${id}`);
}

/**
 * Create a new payment
 * @param {Object} paymentData - Payment creation data
 * @param {number} paymentData.appointmentId - Appointment ID (required)
 * @param {string} paymentData.patientId - Patient ID (required)
 * @param {string} paymentData.doctorId - Doctor ID (required)
 * @param {number} paymentData.amount - Payment amount (required)
 * @param {string} paymentData.currency - Currency code (default: 'LKR')
 * @param {string} paymentData.paymentMethod - Payment method (required)
 * @param {number} paymentData.paymentStatus - Payment status enum (default: 0 - Pending)
 * @param {string} paymentData.transactionId - Transaction ID from gateway
 * @param {string} paymentData.paymentGateway - Payment gateway used
 * @param {string} paymentData.paidAt - Payment date (ISO string)
 * @param {string} paymentData.notes - Additional notes
 * @returns {Promise<Object>} - Created payment
 */
export async function createPayment(paymentData) {
  if (!paymentData.appointmentId) throw new Error("Appointment ID is required");
  if (!paymentData.patientId) throw new Error("Patient ID is required");
  if (!paymentData.doctorId) throw new Error("Doctor ID is required");
  if (!paymentData.amount || paymentData.amount <= 0)
    throw new Error("Valid amount is required");
  if (!paymentData.paymentMethod) throw new Error("Payment method is required");

  const payload = {
    appointmentId: paymentData.appointmentId,
    patientId: paymentData.patientId,
    doctorId: paymentData.doctorId,
    amount: paymentData.amount,
    currency: paymentData.currency || "LKR",
    paymentMethod: paymentData.paymentMethod,
    paymentStatus: paymentData.paymentStatus ?? PaymentStatusEnum.PENDING,
    transactionId: paymentData.transactionId || null,
    paymentGateway: paymentData.paymentGateway || null,
    paidAt: paymentData.paidAt || null,
    notes: paymentData.notes || null
  };

  return post("/api/v1/payments", payload);
}

/**
 * Update payment details
 * @param {number} id - Payment ID
 * @param {Object} paymentData - Payment update data
 * @param {number} paymentData.appointmentId - Appointment ID
 * @param {string} paymentData.patientId - Patient ID
 * @param {string} paymentData.doctorId - Doctor ID
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.currency - Currency code
 * @param {string} paymentData.paymentMethod - Payment method
 * @param {number} paymentData.paymentStatus - Payment status enum
 * @param {string} paymentData.transactionId - Transaction ID
 * @param {string} paymentData.paymentGateway - Payment gateway
 * @param {string} paymentData.paidAt - Payment date
 * @param {string} paymentData.notes - Additional notes
 * @returns {Promise<Object>} - Updated payment
 */
export async function updatePayment(id, paymentData) {
  if (!id) throw new Error("Payment ID is required");
  if (isNaN(id)) throw new Error("Payment ID must be a number");

  const payload = {
    appointmentId: paymentData.appointmentId,
    patientId: paymentData.patientId,
    doctorId: paymentData.doctorId,
    amount: paymentData.amount,
    currency: paymentData.currency || "LKR",
    paymentMethod: paymentData.paymentMethod,
    paymentStatus: paymentData.paymentStatus,
    transactionId: paymentData.transactionId || null,
    paymentGateway: paymentData.paymentGateway || null,
    paidAt: paymentData.paidAt || null,
    notes: paymentData.notes || null
  };

  return put(`/api/v1/payments/${id}`, payload);
}

/**
 * Delete payment (soft delete)
 * @param {number} id - Payment ID
 * @returns {Promise<Object>} - Success response
 */
export async function deletePayment(id) {
  if (!id) throw new Error("Payment ID is required");
  if (isNaN(id)) throw new Error("Payment ID must be a number");
  return del(`/api/v1/payments/${id}`);
}

/**
 * Get payments by patient ID
 * @param {string} patientId - Patient ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 * @param {string} params.status - Filter by status
 * @returns {Promise<Object>} - Paginated payments
 */
export async function getPaymentsByPatient(patientId, params = {}) {
  if (!patientId) throw new Error("Patient ID is required");
  return getPayments({ ...params, patientId });
}

/**
 * Get payments by doctor ID
 * @param {string} doctorId - Doctor ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 * @param {string} params.status - Filter by status
 * @returns {Promise<Object>} - Paginated payments
 */
export async function getPaymentsByDoctor(doctorId, params = {}) {
  if (!doctorId) throw new Error("Doctor ID is required");
  return getPayments({ ...params, doctorId });
}

/**
 * Get payments by appointment ID
 * @param {number} appointmentId - Appointment ID
 * @returns {Promise<Object>} - Payment for appointment
 */
export async function getPaymentByAppointment(appointmentId) {
  if (!appointmentId) throw new Error("Appointment ID is required");
  return getPayments({ appointmentId });
}

/**
 * Update payment status
 * @param {number} id - Payment ID
 * @param {string} status - New status (Pending, Completed, Failed, Refunded)
 * @param {string} transactionId - Transaction ID (optional)
 * @param {string} notes - Additional notes (optional)
 * @returns {Promise<Object>} - Updated payment
 */
export async function updatePaymentStatus(
  id,
  status,
  transactionId = null,
  notes = null
) {
  if (!id) throw new Error("Payment ID is required");
  if (!status) throw new Error("Status is required");

  // First get current payment
  const currentPayment = await getPaymentById(id);

  // Update with new status
  const statusValue = getPaymentStatusValue(status);

  const updateData = {
    appointmentId: currentPayment.appointmentId,
    patientId: currentPayment.patientId,
    doctorId: currentPayment.doctorId,
    amount: currentPayment.amount,
    currency: currentPayment.currency,
    paymentMethod: currentPayment.paymentMethod,
    paymentStatus: statusValue,
    transactionId: transactionId || currentPayment.transactionId,
    paymentGateway: currentPayment.paymentGateway,
    paidAt:
      status === "Completed" ? new Date().toISOString() : currentPayment.paidAt,
    notes: notes || currentPayment.notes
  };

  return updatePayment(id, updateData);
}

/**
 * Mark payment as completed
 * @param {number} id - Payment ID
 * @param {string} transactionId - Transaction ID from payment gateway
 * @returns {Promise<Object>} - Updated payment
 */
export async function completePayment(id, transactionId) {
  return updatePaymentStatus(
    id,
    "Completed",
    transactionId,
    "Payment completed successfully"
  );
}

/**
 * Mark payment as failed
 * @param {number} id - Payment ID
 * @param {string} reason - Failure reason
 * @returns {Promise<Object>} - Updated payment
 */
export async function failPayment(id, reason) {
  return updatePaymentStatus(id, "Failed", null, `Payment failed: ${reason}`);
}

/**
 * Mark payment as refunded
 * @param {number} id - Payment ID
 * @param {string} reason - Refund reason
 * @returns {Promise<Object>} - Updated payment
 */
export async function refundPayment(id, reason) {
  return updatePaymentStatus(
    id,
    "Refunded",
    null,
    `Payment refunded: ${reason}`
  );
}

/**
 * Get payment statistics
 * @param {string} patientId - Patient ID (optional)
 * @param {string} doctorId - Doctor ID (optional)
 * @param {string} fromDate - From date (optional)
 * @param {string} toDate - To date (optional)
 * @returns {Promise<Object>} - Payment statistics
 */
export async function getPaymentStatistics(params = {}) {
  const queryParams = {};

  if (params.patientId) queryParams.patientId = params.patientId;
  if (params.doctorId) queryParams.doctorId = params.doctorId;
  if (params.fromDate) queryParams.fromDate = params.fromDate;
  if (params.toDate) queryParams.toDate = params.toDate;

  return get("/api/v1/payments/statistics", queryParams);
}

/**
 * Get payment summary for current user
 * @returns {Promise<Object>} - Payment summary
 */
export async function getMyPaymentSummary() {
  return get("/api/v1/payments/me/summary");
}

/**
 * Get my payments (for current authenticated user)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 * @param {string} params.status - Filter by status
 * @returns {Promise<Object>} - Paginated payments
 */
export async function getMyPayments(params = {}) {
  const queryParams = {};

  if (params.page) queryParams.page = params.page;
  if (params.pageSize) queryParams.pageSize = params.pageSize;
  if (params.status) queryParams.status = params.status;

  return get("/api/v1/payments/me", queryParams);
}

/**
 * Process payment with gateway
 * @param {Object} paymentData - Payment data for gateway
 * @param {number} paymentData.amount - Amount
 * @param {string} paymentData.currency - Currency
 * @param {string} paymentData.paymentMethod - Payment method
 * @param {string} paymentData.returnUrl - Return URL after payment
 * @returns {Promise<Object>} - Payment gateway response
 */
export async function processPayment(paymentData) {
  if (!paymentData.amount) throw new Error("Amount is required");
  if (!paymentData.paymentMethod) throw new Error("Payment method is required");

  return post("/api/v1/payments/process", paymentData);
}

/**
 * Verify payment with gateway
 * @param {string} transactionId - Transaction ID from gateway
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyPayment(transactionId) {
  if (!transactionId) throw new Error("Transaction ID is required");
  return get(`/api/v1/payments/verify/${transactionId}`);
}

/**
 * Get payment receipt
 * @param {number} id - Payment ID
 * @returns {Promise<Blob>} - PDF receipt blob
 */
export async function getPaymentReceipt(id) {
  if (!id) throw new Error("Payment ID is required");
  if (isNaN(id)) throw new Error("Payment ID must be a number");

  try {
    setAuthHeader();
    const res = await apiClient.get(`/api/v1/payments/${id}/receipt`, {
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId()
      },
      responseType: "blob"
    });

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch receipt");
    }

    return res.data;
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

/**
 * Download payment receipt
 * @param {number} id - Payment ID
 * @param {string} filename - Filename (optional)
 */
export async function downloadPaymentReceipt(
  id,
  filename = `payment_receipt_${id}.pdf`
) {
  const receipt = await getPaymentReceipt(id);

  // Create download link
  const url = window.URL.createObjectURL(receipt);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ==================== Utility Functions ====================

/**
 * Set authentication token in axios defaults
 * @param {string} token - JWT token
 */
export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
  delete apiClient.defaults.headers.common["Authorization"];
}

/**
 * Initialize API client with stored auth token
 */
export function initializeApiClient() {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
  return apiClient;
}

// Export the api client for advanced use cases
export { apiClient };

// Default export with all functions
export default {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentsByPatient,
  getPaymentsByDoctor,
  getPaymentByAppointment,
  updatePaymentStatus,
  completePayment,
  failPayment,
  refundPayment,
  getPaymentStatistics,
  getMyPaymentSummary,
  getMyPayments,
  processPayment,
  verifyPayment,
  getPaymentReceipt,
  downloadPaymentReceipt,
  setAuthToken,
  clearAuthToken,
  initializeApiClient,
  PaymentStatusEnum,
  getPaymentStatusString,
  getPaymentStatusValue,
  apiClient
};

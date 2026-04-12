// feature/paymentTransaction/entity/payment.entity.js

/**
 * Payment Entity class for frontend
 * Represents the payment model based on backend Payment model and DTOs
 */
export class Payment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.appointmentId = data.appointmentId || null;
    this.patientId = data.patientId || "";
    this.doctorId = data.doctorId || "";
    this.amount = data.amount ?? 0;
    this.currency = data.currency || "LKR";
    this.paymentMethod = data.paymentMethod || "";
    this.paymentStatus = data.paymentStatus || "Pending";
    this.transactionId = data.transactionId || null;
    this.paymentGateway = data.paymentGateway || null;
    this.paidAt = data.paidAt ? new Date(data.paidAt) : null;
    this.notes = data.notes || null;

    // Auditable fields
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.createdBy = data.createdBy || null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    this.updatedBy = data.updatedBy || null;
    this.isDeleted = data.isDeleted ?? false;
    this.deletedAt = data.deletedAt ? new Date(data.deletedAt) : null;
    this.deletedBy = data.deletedBy || null;
    this.status = data.status || "Active";

    // Optional: Store related data
    this.patient = data.patient || null;
    this.doctor = data.doctor || null;
    this.appointment = data.appointment || null;
  }

  /**
   * Get formatted amount with currency
   * @returns {string}
   */
  getFormattedAmount() {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.amount);
  }

  /**
   * Get amount in different currency (simple conversion)
   * @param {string} targetCurrency - Target currency code
   * @param {number} exchangeRate - Exchange rate
   * @returns {number}
   */
  getConvertedAmount(targetCurrency, exchangeRate) {
    if (this.currency === targetCurrency) return this.amount;
    return this.amount * exchangeRate;
  }

  /**
   * Check if payment is completed
   * @returns {boolean}
   */
  isCompleted() {
    return this.paymentStatus?.toLowerCase() === "completed";
  }

  /**
   * Check if payment is pending
   * @returns {boolean}
   */
  isPending() {
    return this.paymentStatus?.toLowerCase() === "pending";
  }

  /**
   * Check if payment failed
   * @returns {boolean}
   */
  isFailed() {
    return this.paymentStatus?.toLowerCase() === "failed";
  }

  /**
   * Check if payment is refunded
   * @returns {boolean}
   */
  isRefunded() {
    return this.paymentStatus?.toLowerCase() === "refunded";
  }

  /**
   * Check if payment can be refunded
   * @returns {boolean}
   */
  canBeRefunded() {
    return this.isCompleted() && !this.isRefunded();
  }

  /**
   * Get payment status badge color
   * @returns {string} - Tailwind color class
   */
  getStatusBadgeColor() {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800"
    };
    return (
      statusColors[this.paymentStatus?.toLowerCase()] ||
      "bg-gray-100 text-gray-800"
    );
  }

  /**
   * Get payment method icon name
   * @returns {string}
   */
  getPaymentMethodIcon() {
    const methodIcons = {
      card: "💳",
      cash: "💵",
      online: "🌐",
      payhere: "🏦",
      stripe: "💳",
      paypal: "💰"
    };
    return methodIcons[this.paymentMethod?.toLowerCase()] || "💰";
  }

  /**
   * Get payment method display name
   * @returns {string}
   */
  getPaymentMethodDisplay() {
    const methodNames = {
      card: "Credit/Debit Card",
      cash: "Cash",
      online: "Online Payment",
      payhere: "PayHere",
      stripe: "Stripe",
      paypal: "PayPal"
    };
    return methodNames[this.paymentMethod?.toLowerCase()] || this.paymentMethod;
  }

  /**
   * Get payment date for display
   * @param {string} format - Date format (full, date, time)
   * @returns {string}
   */
  getPaymentDate(format = "full") {
    const date = this.paidAt || this.createdAt;
    if (!date) return "N/A";

    switch (format) {
      case "date":
        return date.toLocaleDateString();
      case "time":
        return date.toLocaleTimeString();
      case "full":
      default:
        return date.toLocaleString();
    }
  }

  /**
   * Check if payment is active (not deleted)
   * @returns {boolean}
   */
  isActive() {
    return !this.isDeleted && this.status?.toLowerCase() === "active";
  }

  /**
   * Get days since payment
   * @returns {number|null}
   */
  getDaysSincePayment() {
    const paymentDate = this.paidAt || this.createdAt;
    if (!paymentDate) return null;

    const now = new Date();
    const diffTime = Math.abs(now - paymentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Convert to JSON for API requests
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      appointmentId: this.appointmentId,
      patientId: this.patientId,
      doctorId: this.doctorId,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      transactionId: this.transactionId,
      paymentGateway: this.paymentGateway,
      paidAt: this.paidAt?.toISOString(),
      notes: this.notes,
      createdAt: this.createdAt?.toISOString(),
      createdBy: this.createdBy,
      updatedAt: this.updatedAt?.toISOString(),
      updatedBy: this.updatedBy,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt?.toISOString(),
      deletedBy: this.deletedBy,
      status: this.status
    };
  }

  /**
   * Create Payment instance from PaymentResponseDto
   * @param {Object} responseDto - PaymentResponseDto from API
   * @returns {Payment}
   */
  static fromResponseDto(responseDto) {
    return new Payment(responseDto);
  }

  /**
   * Create Payment instance from paginated response
   * @param {Object} paginatedResponse - PaginatedResponse<PaymentResponseDto>
   * @returns {Object} - Object containing payments array and pagination info
   */
  static fromPaginatedResponse(paginatedResponse) {
    return {
      payments: (paginatedResponse.items || []).map(
        (payment) => new Payment(payment)
      ),
      page: paginatedResponse.page,
      pageSize: paginatedResponse.pageSize,
      totalCount: paginatedResponse.totalCount,
      totalPages: paginatedResponse.totalPages,
      hasNextPage: paginatedResponse.hasNextPage,
      hasPreviousPage: paginatedResponse.hasPreviousPage
    };
  }

  /**
   * Create payload for payment creation (PaymentRequestDto)
   * @returns {Object}
   */
  toCreatePayload() {
    const payload = {
      appointmentId: this.appointmentId,
      patientId: this.patientId,
      doctorId: this.doctorId,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.status || "Active",
      notes: this.notes
    };

    if (this.transactionId) payload.transactionId = this.transactionId;
    if (this.paymentGateway) payload.paymentGateway = this.paymentGateway;
    if (this.paidAt) payload.paidAt = this.paidAt.toISOString();

    return payload;
  }

  /**
   * Update payment properties from object
   * @param {Object} updates - Partial payment data
   */
  update(updates) {
    Object.assign(this, updates);
    if (updates.paidAt) this.paidAt = new Date(updates.paidAt);
    if (updates.createdAt) this.createdAt = new Date(updates.createdAt);
    if (updates.updatedAt) this.updatedAt = new Date(updates.updatedAt);
    if (updates.deletedAt) this.deletedAt = new Date(updates.deletedAt);
    return this;
  }

  /**
   * Clone the payment instance
   * @returns {Payment}
   */
  clone() {
    return new Payment(this.toJSON());
  }

  /**
   * Mark payment as completed
   * @param {string} transactionId - Transaction ID from gateway
   * @param {string} paymentGateway - Payment gateway used
   */
  markAsCompleted(transactionId, paymentGateway) {
    this.paymentStatus = "Completed";
    this.transactionId = transactionId;
    this.paymentGateway = paymentGateway;
    this.paidAt = new Date();
  }

  /**
   * Mark payment as failed
   * @param {string} reason - Failure reason
   */
  markAsFailed(reason) {
    this.paymentStatus = "Failed";
    this.notes = reason;
  }

  /**
   * Mark payment as refunded
   */
  markAsRefunded() {
    this.paymentStatus = "Refunded";
  }
}

/**
 * PaymentSummary class for payment statistics
 */
export class PaymentSummary {
  constructor(data = {}) {
    this.totalAmount = data.totalAmount ?? 0;
    this.totalCount = data.totalCount ?? 0;
    this.averageAmount = data.averageAmount ?? 0;
    this.amountByStatus = data.amountByStatus || {};
    this.countByStatus = data.countByStatus || {};
    this.thisMonthTotal = data.thisMonthTotal ?? 0;
    this.thisMonthCount = data.thisMonthCount ?? 0;
  }

  /**
   * Get average amount formatted
   * @param {string} currency - Currency symbol
   * @returns {string}
   */
  getFormattedAverageAmount(currency = "LKR") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(this.averageAmount);
  }

  /**
   * Get total amount formatted
   * @param {string} currency - Currency symbol
   * @returns {string}
   */
  getFormattedTotalAmount(currency = "LKR") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(this.totalAmount);
  }

  /**
   * Get completion rate percentage
   * @returns {number}
   */
  getCompletionRate() {
    const completedCount = this.countByStatus["Completed"] || 0;
    if (this.totalCount === 0) return 0;
    return (completedCount / this.totalCount) * 100;
  }

  /**
   * Create PaymentSummary from PaymentSummaryDto
   * @param {Object} summaryDto - PaymentSummaryDto from API
   * @returns {PaymentSummary}
   */
  static fromDto(summaryDto) {
    return new PaymentSummary(summaryDto);
  }
}

/**
 * PaymentRefundEvent class
 */
export class PaymentRefundEvent {
  constructor(data = {}) {
    this.paymentId = data.paymentId || null;
    this.appointmentId = data.appointmentId || null;
    this.amount = data.amount ?? 0;
    this.reason = data.reason || "";
    this.refundedAt = data.refundedAt ? new Date(data.refundedAt) : new Date();
  }

  /**
   * Get formatted refund amount
   * @param {string} currency - Currency symbol
   * @returns {string}
   */
  getFormattedAmount(currency = "LKR") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(this.amount);
  }

  /**
   * Create payload for refund event
   * @returns {Object}
   */
  toPayload() {
    return {
      paymentId: this.paymentId,
      appointmentId: this.appointmentId,
      amount: this.amount,
      reason: this.reason,
      refundedAt: this.refundedAt.toISOString()
    };
  }
}

/**
 * Validation helper functions for payment data
 */
export const PaymentValidators = {
  isValidAmount: (amount) => {
    return typeof amount === "number" && amount > 0;
  },

  isValidCurrency: (currency) => {
    const validCurrencies = ["LKR", "USD", "EUR", "GBP", "INR"];
    return validCurrencies.includes(currency);
  },

  isValidPaymentMethod: (method) => {
    const validMethods = [
      "card",
      "cash",
      "online",
      "payhere",
      "stripe",
      "paypal"
    ];
    return validMethods.includes(method?.toLowerCase());
  },

  isValidPaymentStatus: (status) => {
    const validStatuses = ["pending", "completed", "failed", "refunded"];
    return validStatuses.includes(status?.toLowerCase());
  },

  isValidTransactionId: (transactionId) => {
    return transactionId && transactionId.trim().length >= 5;
  },

  isValidAppointmentId: (appointmentId) => {
    return typeof appointmentId === "number" && appointmentId > 0;
  },

  isValidPatientId: (patientId) => {
    return patientId && patientId.trim().length > 0;
  },

  isValidDoctorId: (doctorId) => {
    return doctorId && doctorId.trim().length > 0;
  },

  isRequired: (value) => {
    return (
      value !== null && value !== undefined && value.toString().trim() !== ""
    );
  }
};

/**
 * Payment status constants
 */
export const PaymentStatus = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded"
};

/**
 * Payment method constants
 */
export const PaymentMethod = {
  CARD: "card",
  CASH: "cash",
  ONLINE: "online",
  PAYHERE: "payhere",
  STRIPE: "stripe",
  PAYPAL: "paypal"
};

/**
 * Payment gateway constants
 */
export const PaymentGateway = {
  STRIPE: "Stripe",
  PAYHERE: "PayHere",
  PAYPAL: "PayPal",
  RAZORPAY: "Razorpay"
};

/**
 * Currency constants
 */
export const Currency = {
  LKR: "LKR",
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  INR: "INR"
};

/**
 * Common status constants
 */
export const CommonStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended"
};

export default Payment;

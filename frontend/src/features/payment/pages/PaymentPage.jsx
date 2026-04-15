// frontend/src/features/payment/pages/PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { createCheckoutSession } from "../api/paymentApi";
import { toast } from "sonner";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Payment amount (in cents) - £50 = 5000 cents
  const CONSULTATION_FEE = 5000;
  const CURRENCY = "USD";

  useEffect(() => {
    if (!state?.appointment) {
      toast.error("No appointment details found");
      navigate("/appointments");
      return;
    }
    return;
  }, [state, navigate]);

  const handleProceedToPayment = async () => {
    if (!state?.appointment) {
      toast.error("Appointment details missing");
      return;
    }

    setLoading(true);

    // Get current page URL for success/cancel redirects
    const currentUrl = window.location.origin;

    const paymentRequest = {
      amount: CONSULTATION_FEE,
      currency: CURRENCY,
      patientId: user?.id || state.appointment.patientId,
      appointmentId: state.appointment.id,
      doctorId: state.appointment.doctorId,
      doctorName: state.appointment.doctorName || "Doctor",
      consultationId: state.appointment.consultationId || state.appointment.id,
      successUrl: `${currentUrl}/payment/success`,
      cancelUrl: `${currentUrl}/payment/cancel?appointmentId=${state.appointment.id}`,
      productName: `Consultation with Dr. ${state.appointment.doctorName || "Specialist"}`,
      productDescription: `${state.appointmentType} consultation - ${state.appointmentDate} at ${state.timeSlot}`,
      customerEmail: user?.email,
      locale: "en",
      metadata: {
        appointment_type: state.appointmentType,
        appointment_date: state.appointmentDate,
        time_slot: state.timeSlot
      }
    };

    const result = await createCheckoutSession(paymentRequest);

    if (result.error) {
      toast.error(
        result.error || "Failed to create payment session. Please try again."
      );
      setLoading(false);
    } else if (result.data?.url) {
      // Store payment info for reference
      setPaymentDetails(result.data);
      // Redirect to Stripe checkout page
      window.location.href = result.data.url;
    } else {
      toast.error("Failed to get checkout URL. Please try again.");
      setLoading(false);
    }
  };

  if (!state?.appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">
            No appointment found. Please book an appointment first.
          </p>
          <button
            onClick={() => navigate("/find")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Find a Doctor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Payment Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Your Payment
          </h1>
          <p className="text-gray-600 mt-2">Secure payment powered by Stripe</p>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
            <h2 className="font-semibold text-gray-900">Appointment Summary</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Doctor</span>
              <span className="font-medium text-gray-900">
                Dr. {state.appointment.doctorName || "To be assigned"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">
                {state.appointmentDate}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-900">
                {state.timeSlot}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Appointment Type</span>
              <span className="font-medium text-gray-900">
                {state.appointmentType}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {CURRENCY === "USD" ? "$" : "Rs."}
                {(CONSULTATION_FEE / 100).toFixed(2)}
                {CURRENCY === "USD" ? " USD" : " LKR"}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Payment Methods</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex gap-2">
                <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#F3F4F6" />
                  <path d="M8 12h32v8H8z" fill="#1F2937" />
                  <circle cx="24" cy="16" r="6" fill="#D1D5DB" />
                </svg>
                <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#EBF5FF" />
                  <path
                    d="M10 16h28M10 16v4m0-4h28"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Credit / Debit Card
                </p>
                <p className="text-xs text-gray-500">
                  Visa, Mastercard, Amex, Discover
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-12a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2zm10-10H8m8 4H8"
                />
              </svg>
              <span>Secure encrypted payment</span>
              <span className="mx-2">•</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>

          <button
            onClick={handleProceedToPayment}
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay Now
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By completing this payment, you agree to our Terms of Service and
          Cancellation Policy. You will be redirected to Stripe's secure payment
          page.
        </p>
      </div>
    </div>
  );
}

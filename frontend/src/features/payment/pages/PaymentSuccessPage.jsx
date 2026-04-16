// frontend/src/features/payment/pages/PaymentSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPaymentById } from "../api/paymentApi";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get("session_id");
        const paymentId = queryParams.get("payment_id");
        const appointmentId = queryParams.get("appointmentId");

        if (paymentId) {
          const result = await getPaymentById(paymentId);
          if (result.data) {
            setPayment(result.data);
            toast.success("Payment completed successfully!");
          } else {
            setError("Failed to fetch payment details");
            toast.error("Could not retrieve payment details");
          }
        } else if (appointmentId) {
          // If we have appoointment ID but no payment, redirect after showing message
          setTimeout(() => {
            navigate("/appointments");
          }, 3000);
          toast.info("Redirecting to appointments...");
        } else {
          setError("No payment information found");
          toast.error("Payment information missing");
        }
      } catch (err) {
        console.error("Error fetching payment data:", err);
        setError("An error occurred while retrieving payment details");
        toast.error("Error retrieving payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
            <p className="text-red-100">{error}</p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              <button
                onClick={() => navigate("/appointments")}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View My Appointments
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-green-100">Your appointment has been confirmed</p>
        </div>

        {/* Payment Details */}
        <div className="p-6">
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Payment Details
            </h3>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-semibold text-gray-900">
                {payment?.currency === "USD" ? "$" : "Rs."}
                {payment ? (payment.amount / 100).toFixed(2) : "0.00"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-xs text-gray-600 break-all">
                {payment?.transactionId || payment?.stripeSessionId || "N/A"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Status</span>
              <span className="text-green-600 font-semibold">
                {payment?.paymentStatus || "Completed"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date</span>
              <span className="text-gray-900">
                {payment ? new Date(payment.createdAt).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/appointments")}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              View My Appointments
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Receipt Note */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            A receipt has been sent to your email address. You can also view
            this payment in your payment history.
          </p>
        </div>
      </div>
    </div>
  );
}

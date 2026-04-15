// frontend/src/features/payment/pages/PaymentCancelPage.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    toast.warning(
      "Payment cancelled - your appointment has not been confirmed"
    );
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const appointmentId = queryParams.get("appointmentId");
  const sessionId = queryParams.get("session_id");

  const handleRetry = () => {
    if (appointmentId) {
      // Navigate back to payment page with the appointment ID
      navigate("/payment", {
        state: {
          appointment: { id: appointmentId }
        }
      });
    } else {
      navigate("/appointments");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cancel Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Cancelled
          </h1>
          <p className="text-yellow-100">
            You have cancelled the payment process
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              Your appointment has not been confirmed yet.
            </p>
            <p className="text-sm text-gray-500">
              You can try again or contact support if you need help.
            </p>
            {sessionId && (
              <p className="text-xs text-gray-400 mt-4">
                Session ID: {sessionId}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <button
              onClick={() => navigate("/appointments")}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              View My Appointments
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full px-6 py-3 text-gray-600 rounded-xl font-semibold hover:text-gray-900 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Support Note */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            If you continue to experience issues, please contact our support
            team.
          </p>
        </div>
      </div>
    </div>
  );
}

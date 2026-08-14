// frontend/src/features/payment/pages/PaymentDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { getPaymentById } from "../api/paymentApi";
import { toast } from "sonner";

export default function PaymentDetailsPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        // Verify user is authenticated
        if (!user?.id) {
          toast.error("Please login to view payment details");
          navigate("/auth/login");
          return;
        }

        const result = await getPaymentById(parseInt(paymentId));

        if (result.error) {
          toast.error(result.error || "Failed to fetch payment details");
          navigate("/payment/history");
          return;
        }

        if (result.data) {
          // Verify payment belongs to current user
          if (result.data.patientId !== user.id) {
            toast.error("You don't have permission to view this payment");
            navigate("/payment/history");
            return;
          }
          setPayment(result.data);
        }
      } catch (err) {
        console.error("Error fetching payment:", err);
        toast.error("Error loading payment details");
        navigate("/payment/history");
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId, navigate, user?.id]);

  const handleViewReceipt = () => {
    navigate(`/payment/receipt/${paymentId}`);
  };

  const handlePrintReceipt = () => {
    navigate(`/payment/receipt/${paymentId}?print=true`);
  };

  const formatCurrency = (amount, currency) => {
    return currency === "USD"
      ? `$${(amount / 100).toFixed(2)}`
      : `Rs.${(amount / 100).toFixed(2)}`;
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      PaymentCompleted: "bg-green-100 text-green-800 border-green-300",
      PaymentPending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      PaymentFailed: "bg-red-100 text-red-800 border-red-300",
      RefundPending: "bg-orange-100 text-orange-800 border-orange-300",
      RefundCompleted: "bg-blue-100 text-blue-800 border-blue-300",
      Active: "bg-green-100 text-green-800 border-green-300",
      Deleted: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusLabel = (status) => {
    const labels = {
      PaymentCompleted: "Completed",
      PaymentPending: "Pending",
      PaymentFailed: "Failed",
      RefundPending: "Refund Pending",
      RefundCompleted: "Refunded",
      Active: "Active",
      Deleted: "Deleted"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Payment not found.</p>
          <button
            onClick={() => navigate("/payment/history")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Payment History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/payment/history")}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-1"
          >
            ← Back to Payment History
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Status Header */}
          <div
            className={`border-b-4 ${getStatusBadgeColor(payment.paymentStatus).replace("bg-", "border-").split(" ")[0]} px-6 py-4 bg-gradient-to-r from-blue-50 to-white`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment ID: {payment.id}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Created on {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(
                  payment.paymentStatus
                )}`}
              >
                {getStatusLabel(payment.paymentStatus)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Payment Amount Section */}
            <div className="border-b border-gray-200 pb-6">
              <p className="text-sm text-gray-600 mb-2">Payment Amount</p>
              <p className="text-4xl font-bold text-blue-600">
                {formatCurrency(payment.amount, payment.currency)}
              </p>
              <p className="text-gray-600 mt-2">Currency: {payment.currency}</p>
            </div>

            {/* Payment Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <p className="text-gray-900">
                    {payment.paymentMethod || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Gateway
                  </label>
                  <p className="text-gray-900">
                    {payment.paymentGateway || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm break-all">
                    {payment.transactionId || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment ID
                  </label>
                  <p className="text-gray-900">
                    {payment.appointmentId || "N/A"}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm break-all">
                    {payment.patientId || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm break-all">
                    {payment.doctorId || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation ID
                  </label>
                  <p className="text-gray-900">
                    {payment.consultationId || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid At
                  </label>
                  <p className="text-gray-900">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString()
                      : "Not yet paid"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stripe Information */}
            {(payment.stripeSessionId || payment.stripePaymentIntentId) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Stripe Information
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {payment.stripeSessionId && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Session ID
                      </label>
                      <p className="text-gray-900 font-mono text-xs break-all">
                        {payment.stripeSessionId}
                      </p>
                    </div>
                  )}
                  {payment.stripePaymentIntentId && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Payment Intent ID
                      </label>
                      <p className="text-gray-900 font-mono text-xs break-all">
                        {payment.stripePaymentIntentId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {payment.notes && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Notes
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {payment.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/payment/history")}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Back to History
          </button>

          {payment.paymentStatus === "PaymentCompleted" && (
            <>
              <button
                onClick={handleViewReceipt}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                View Receipt
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Print Receipt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

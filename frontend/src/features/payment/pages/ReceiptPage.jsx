// frontend/src/features/payment/pages/ReceiptPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { getPaymentById } from "../api/paymentApi";
import { toast } from "sonner";

export default function ReceiptPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const receiptRef = useRef(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPrintMode = searchParams.get("print") === "true";

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        // Verify user is authenticated
        if (!user?.id) {
          toast.error("Please login to view receipts");
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
          // Verify receipt belongs to current user
          if (result.data.patientId !== user.id) {
            toast.error("You don't have permission to view this receipt");
            navigate("/payment/history");
            return;
          }
          setPayment(result.data);
          // Auto-print if print mode is enabled
          if (isPrintMode) {
            setTimeout(() => {
              window.print();
            }, 500);
          }
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
  }, [paymentId, navigate, isPrintMode, user?.id]);

  const formatCurrency = (amount, currency) => {
    return currency === "USD"
      ? `$${(amount / 100).toFixed(2)}`
      : `Rs.${(amount / 100).toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // This would require html2pdf or similar library
    toast.info("PDF download feature coming soon");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Receipt not found.</p>
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
      <div className="max-w-2xl mx-auto px-4">
        {!isPrintMode && (
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => navigate(`/payment/details/${paymentId}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ← Back to Details
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download PDF
            </button>
          </div>
        )}

        {/* Receipt */}
        <div
          ref={receiptRef}
          className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">PAYMENT RECEIPT</h1>
            <p className="text-blue-100">CareLink Platform</p>
          </div>

          {/* Receipt Content */}
          <div className="p-8">
            {/* Receipt Number and Date */}
            <div className="flex justify-between items-center mb-8 pb-8 border-b-2 border-gray-200">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Receipt Number
                </p>
                <p className="text-lg font-bold text-gray-900">
                  #RCP-{payment.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Receipt Date
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Payment Status
                </p>
                <p className="text-lg font-bold text-green-600">
                  {payment.paymentStatus === "PaymentCompleted"
                    ? "PAID"
                    : "PENDING"}
                </p>
              </div>
            </div>

            {/* Patient Information */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Patient ID
                  </p>
                  <p className="text-sm font-mono text-gray-900">
                    {payment.patientId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Transaction ID
                  </p>
                  <p className="text-sm font-mono text-gray-900">
                    {payment.transactionId}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="mb-8 pb-8 border-b-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Service Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">
                      Service Type
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Consultation
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">
                      Appointment ID
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.appointmentId}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">
                      Doctor ID
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.doctorId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider">
                      Consultation ID
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.consultationId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Payment Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Consultation Fee</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-gray-600">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center py-2 text-gray-600">
                  <span>Service Charge</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method and Details */}
            <div className="mb-8 pb-8 border-b-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Payment Details
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Payment Method
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.paymentMethod || "Card"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Payment Gateway
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.paymentGateway || "Stripe"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Currency
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Payment Date
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString()
                      : "Not yet paid"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stripe Information */}
            {payment.stripeSessionId && (
              <div className="mb-8 pb-8 border-b-2 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Stripe Transaction
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                    Session ID
                  </p>
                  <p className="text-xs font-mono text-gray-900 break-all">
                    {payment.stripeSessionId}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-8">
              <p className="text-xs text-gray-600 mb-2">
                Thank you for using CareLink Platform
              </p>
              <p className="text-xs text-gray-500">
                This is an electronic receipt. Please save for your records.
              </p>
              <p className="text-xs text-gray-500 mt-4">
                For any queries, contact support@carelink.com
              </p>
            </div>
          </div>

          {/* Print Footer */}
          <div className="print:block hidden text-center py-4 text-xs text-gray-600 border-t border-gray-200">
            <p>Generated on {new Date().toLocaleString()}</p>
            <p>CareLink Platform - Healthcare Made Easy</p>
          </div>
        </div>

        {!isPrintMode && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/payment/details/${paymentId}`)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Payment Details
            </button>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

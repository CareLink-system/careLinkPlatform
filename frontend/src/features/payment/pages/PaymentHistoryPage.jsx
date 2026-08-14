// frontend/src/features/payment/pages/PaymentHistoryPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { getPaymentHistory } from "../api/paymentApi";
import { toast } from "sonner";

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const paymentStatuses = [
    { value: "", label: "All Statuses" },
    { value: "PaymentPending", label: "Pending" },
    { value: "PaymentCompleted", label: "Completed" },
    { value: "PaymentFailed", label: "Failed" },
    { value: "RefundPending", label: "Refund Pending" },
    { value: "RefundCompleted", label: "Refunded" }
  ];

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Verify user is authenticated
      if (!user?.id) {
        toast.error("Please login to view your payment history");
        setLoading(false);
        return;
      }

      const result = await getPaymentHistory(
        page,
        pageSize,
        statusFilter || null,
        dateRange.from || null,
        dateRange.to || null
      );

      if (result.error) {
        toast.error(result.error || "Failed to fetch payment history");
        return;
      }

      if (result.data) {
        // Filter payments to only show current user's transactions
        const userPayments = (result.data.items || []).filter(
          (payment) => payment.patientId === user.id
        );

        console.log(
          `Fetched ${result.data.items?.length || 0} payments, filtered to ${userPayments.length} for user ${user.id}`
        );

        setPayments(userPayments);
        setTotalCount(userPayments.length);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      toast.error("Error loading payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [page, pageSize, statusFilter, user?.id]);

  const handleViewDetails = (paymentId) => {
    navigate(`/payment/details/${paymentId}`);
  };

  const handleViewReceipt = (paymentId) => {
    navigate(`/payment/receipt/${paymentId}`);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDateFromChange = (e) => {
    setDateRange({ ...dateRange, from: e.target.value });
    setPage(1);
  };

  const handleDateToChange = (e) => {
    setDateRange({ ...dateRange, to: e.target.value });
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatCurrency = (amount, currency) => {
    return currency === "USD"
      ? `$${(amount / 100).toFixed(2)}`
      : `Rs.${(amount / 100).toFixed(2)}`;
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      PaymentCompleted: "bg-green-100 text-green-800",
      PaymentPending: "bg-yellow-100 text-yellow-800",
      PaymentFailed: "bg-red-100 text-red-800",
      RefundPending: "bg-orange-100 text-orange-800",
      RefundCompleted: "bg-blue-100 text-blue-800",
      Active: "bg-green-100 text-green-800",
      Deleted: "bg-gray-100 text-gray-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">View and manage your payments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {paymentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={handleDateFromChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={handleDateToChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading payments...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No payments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Dr. {payment.doctorId || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            payment.paymentStatus
                          )}`}
                        >
                          {getStatusLabel(payment.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {payment.transactionId?.substring(0, 8) || "N/A"}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(payment.id)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Details
                          </button>
                          {payment.paymentStatus === "PaymentCompleted" && (
                            <button
                              onClick={() => handleViewReceipt(payment.id)}
                              className="text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                              Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && payments.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} payments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) =>
                  p >= page - 1 &&
                  p <= page + 1 && (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
              )}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

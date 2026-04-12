// feature/paymentTransaction/pages/basicFinancialTransactionMonitoringPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../../../components/dashboard/ProtectedRoute";
import { getPayments } from "../api/payment";
import { PaymentStatus } from "../entity/payment.entity";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: PaymentStatus.PENDING, label: "Pending" },
  { value: PaymentStatus.COMPLETED, label: "Completed" },
  { value: PaymentStatus.FAILED, label: "Failed" },
  { value: PaymentStatus.REFUNDED, label: "Refunded" }
];

const paymentMethodLabels = {
  card: "Card",
  cash: "Cash",
  online: "Online",
  payhere: "PayHere",
  stripe: "Stripe",
  paypal: "PayPal"
};

const defaultPageSize = 12;

function formatCurrency(amount, currency = "LKR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount ?? 0);
}

function getPaymentBadge(status) {
  const normalized = String(status || "").toLowerCase();
  const map = {
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-slate-100 text-slate-800"
  };
  return map[normalized] || "bg-slate-100 text-slate-700";
}

export default function BasicFinancialTransactionMonitoringPage() {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      setError("");

      const params = {
        page,
        pageSize
      };

      if (status) params.status = status;
      if (query) params.patientId = query;

      try {
        const response = await getPayments(params);
        setPayments(response.items || response || []);
      } catch (err) {
        setError(err.message || "Unable to load payments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, [page, pageSize, status, query]);

  const totalItems = useMemo(() => payments.length, [payments]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Payments</p>
              <h1 className="text-3xl font-semibold text-slate-900">
                Transaction monitoring
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Review payment transaction activity, filter by status, and
                inspect details.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Displayed payments</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {totalItems}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current status</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {status || "All"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Payment transactions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Browse recent transactions and inspect transaction details.
                </p>
              </div>
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <label className="sr-only" htmlFor="payment-search">
                  Search
                </label>
                <input
                  id="payment-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Patient ID, doctor ID, appointment ID"
                  className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4B9AA8] focus:ring-2 focus:ring-[#4B9AA8]/10"
                />
                <button className="rounded-2xl bg-[#4B9AA8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e8d9b]">
                  Search
                </button>
              </form>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Status filter
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.12em]">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.12em]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.12em]">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.12em]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.12em]">
                      Paid At
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.12em]">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.12em]">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-right font-semibold uppercase tracking-[0.12em]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        Loading payments...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-12 text-center text-red-600"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No payment transactions found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="cursor-pointer transition hover:bg-slate-50"
                        onClick={() => handleSelectPayment(payment)}
                      >
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {payment.id}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {paymentMethodLabels[payment.paymentMethod] ||
                            payment.paymentMethod ||
                            "Unknown"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentBadge(payment.paymentStatus)}`}
                          >
                            {payment.paymentStatus || "Unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {payment.patientId || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {payment.doctorId || "—"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                            View
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Payment details
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Select a payment row to inspect transaction details.
              </p>
            </div>

            {selectedPayment ? (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Payment ID
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedPayment.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedPayment.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Amount
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        selectedPayment.amount,
                        selectedPayment.currency
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Paid at
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedPayment.paidAt
                        ? new Date(selectedPayment.paidAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Patient ID
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedPayment.patientId || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Doctor ID
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedPayment.doctorId || "—"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Transaction ID
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedPayment.transactionId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Gateway
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedPayment.paymentGateway || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Notes
                  </p>
                  <p className="mt-2 text-sm text-slate-900">
                    {selectedPayment.notes || "None"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
                Select a transaction from the table to see details here.
              </div>
            )}
          </aside>
        </section>
      </div>
    </ProtectedRoute>
  );
}

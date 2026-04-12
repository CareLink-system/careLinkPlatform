import React, { useEffect, useMemo, useState } from 'react'
import { getAllMedicalReports } from '../api/medicalReportApi'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 6

const isPdf = (url) =>
  url?.toLowerCase().includes('.pdf') || url?.includes('/raw/upload/')

const openFile = (url) => {
  if (!url) return

  if (isPdf(url)) {
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`
    window.open(viewer, '_blank', 'noopener,noreferrer')
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export default function GetAllMedicalReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [viewReport, setViewReport] = useState(null)

  // LOCK SCROLL WHEN MODAL OPEN
  useEffect(() => {
    document.body.style.overflow = viewReport ? 'hidden' : 'auto'
  }, [viewReport])

  // LOAD DATA
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllMedicalReports()

        if (res?.error) {
          toast.error(res.error)
        } else {
          setReports(res?.data || [])
        }
      } catch (err) {
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // FILTER (optimized)
  const filtered = useMemo(() => {
    return reports.filter((r) =>
      [
        r?.patientName,
        r?.reportType,
        r?.diagnosis,
        r?.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [reports, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))

  const paginated = useMemo(() => {
    return filtered.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    )
  }, [filtered, page])

  // RESET PAGE ON SEARCH
  useEffect(() => {
    setPage(1)
  }, [search])

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-1 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold">All Medical Reports</h1>
        <p className="text-sm text-blue-100 mt-1">
          {reports.length} total reports
        </p>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by patient, type, diagnosis..."
        className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* TABLE (DESKTOP) */}
      <div className="hidden md:block bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Number</th>
              <th className="p-4 text-left">Patient</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Diagnosis</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">File</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-10 text-gray-400">
                  No reports found
                </td>
              </tr>
            ) : (
              paginated.map((r, i) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-gray-400">
                    {(page - 1) * ITEMS_PER_PAGE + i + 1}
                  </td>

                  <td className="p-4 font-medium">{r.patientName}</td>

                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {r.reportType}
                    </span>
                  </td>

                  <td className="p-4 text-gray-600 max-w-[200px] truncate">
                    {r.diagnosis}
                  </td>

                  <td className="p-4 text-gray-500 text-xs">
                    {r.reportDate
                      ? new Date(r.reportDate).toLocaleDateString()
                      : '—'}
                  </td>

                  <td className="p-4">
                    {r.reports ? (
                      <button
                        onClick={() => openFile(r.reports)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {isPdf(r.reports) ? 'View PDF' : 'View Image'}
                      </button>
                    ) : (
                      <span className="text-gray-300">No file</span>
                    )}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => setViewReport(r)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-4">
        {paginated.map((r, i) => (
          <div
            key={r.id}
            className="bg-white border rounded-xl p-4 shadow-sm space-y-2"
          >
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">
                {(page - 1) * ITEMS_PER_PAGE + i + 1}
              </span>

              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {r.reportType}
              </span>
            </div>

            <h2 className="font-semibold">{r.patientName}</h2>

            <p className="text-sm text-gray-600 line-clamp-2">
              {r.diagnosis}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {r.reportDate
                  ? new Date(r.reportDate).toLocaleDateString()
                  : '—'}
              </span>

              <div className="flex gap-3">
                {r.reports && (
                  <button
                    onClick={() => openFile(r.reports)}
                    className="text-blue-600"
                  >
                    Open
                  </button>
                )}

                <button
                  onClick={() => setViewReport(r)}
                  className="text-white bg-blue-600 px-2 py-1 rounded"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-white border rounded"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-white border rounded"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {viewReport && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setViewReport(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-xl p-5 space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">Report Details</h2>

            <p><strong>Patient:</strong> {viewReport.patientName}</p>
            <p><strong>Type:</strong> {viewReport.reportType}</p>
            <p><strong>Diagnosis:</strong> {viewReport.diagnosis}</p>
            <p><strong>Notes:</strong> {viewReport.notes || '—'}</p>

            {viewReport.reports && (
              <div className="mt-3">
                {isPdf(viewReport.reports) ? (
                  <button
                    onClick={() => openFile(viewReport.reports)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Open PDF
                  </button>
                ) : (
                  <img
                    src={viewReport.reports}
                    alt="report"
                    className="w-full rounded mt-2"
                  />
                )}
              </div>
            )}

            <button
              onClick={() => setViewReport(null)}
              className="w-full bg-gray-200 py-2 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
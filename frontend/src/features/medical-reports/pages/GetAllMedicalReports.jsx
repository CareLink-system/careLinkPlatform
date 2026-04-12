import React, { useEffect, useState } from 'react'
import { getAllMedicalReports } from '../api/medicalReportApi'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 8

// Detect PDF
const isPdf = (url) =>
  url?.toLowerCase().includes('.pdf') || url?.includes('/raw/upload/')

// Open file properly
const openFile = (url) => {
  if (!url) return

  if (isPdf(url)) {
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`
    window.open(viewer, '_blank')
  } else {
    window.open(url, '_blank')
  }
}

export default function GetAllMedicalReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [viewReport, setViewReport] = useState(null)

  // LOAD DATA
  useEffect(() => {
    const load = async () => {
      const res = await getAllMedicalReports()

      if (res.error) {
        toast.error(res.error)
      } else {
        setReports(res.data || [])
      }

      setLoading(false)
    }

    load()
  }, [])

  // FILTER
  const filtered = reports.filter((r) =>
    [r.patientName, r.reportType, r.diagnosis, r.notes]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // LOADING UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">All Medical Reports</h1>
          <p className="text-blue-100 text-sm mt-1">
            {reports.length} reports available
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3">
        <input
          placeholder="Search by name, type, diagnosis…"
          className="w-full border border-gray-200 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Number</th>
              <th className="p-4 text-left">Patient</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Diagnosis</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">File</th>
              <th className="p-4 text-left">View</th>
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
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">

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

                  {/* FILE */}
                  <td className="p-4">
                    {r.reports ? (
                      <button
                        onClick={() => openFile(r.reports)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {isPdf(r.reports) ? '📄 View PDF' : '🖼️ View Image'}
                      </button>
                    ) : (
                      <span className="text-gray-300">No file</span>
                    )}
                  </td>

                  {/* VIEW BUTTON */}
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

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between p-4 bg-gray-50">

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
        )}
      </div>

      {/* VIEW MODAL */}
      {viewReport && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
          onClick={() => setViewReport(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Report Details</h2>

            <p><strong>Patient:</strong> {viewReport.patientName}</p>
            <p><strong>Type:</strong> {viewReport.reportType}</p>
            <p><strong>Diagnosis:</strong> {viewReport.diagnosis}</p>
            <p><strong>Notes:</strong> {viewReport.notes || '—'}</p>

            <div className="mt-4">
              {viewReport.reports && (
                <>
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
                </>
              )}
            </div>

            <button
              onClick={() => setViewReport(null)}
              className="mt-4 w-full bg-gray-200 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
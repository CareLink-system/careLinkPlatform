import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import {
  resolvePatientId,
  createMedicalReport,
  getReportsByPatientId,
  deleteMedicalReport,
  updateMedicalReport,
} from '../api/medicalReportApi'
import MedicalReportForm from '../components/MedicalReportForm'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 6

// Detect if URL is a PDF
function isPdf(url) {
  if (!url) return false
  return (
    url.toLowerCase().includes('.pdf') ||
    url.toLowerCase().includes('/raw/upload/')
  )
}

// Open file correctly:
//    - Images → open Cloudinary URL directly in new tab
//    - PDFs   → open via Google Docs viewer (works even if browser blocks direct PDF)
function openFile(url) {
  if (!url) return
  const fullUrl = url.startsWith('http') ? url : `https://${url}`

  if (isPdf(fullUrl)) {
    // Google Docs viewer renders any public PDF in the browser
    const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=false`
    window.open(googleViewer, '_blank', 'noopener,noreferrer')
  } else {
    window.open(fullUrl, '_blank', 'noopener,noreferrer')
  }
}

export default function MedicalReportsPage() {
  const { user } = useAuth()

  const [patientId, setPatientId]       = useState(null)
  const [reports, setReports]           = useState([])
  const [loading, setLoading]           = useState(true)

  // Modals
  const [showForm, setShowForm]         = useState(false)
  const [editReport, setEditReport]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewReport, setViewReport]     = useState(null)

  // Search & Pagination
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  const loadReports = useCallback(async (pid) => {
    const res = await getReportsByPatientId(pid)
    setReports(res.data || [])
  }, [])

  useEffect(() => {
    const init = async () => {
      if (!user?.id) return
      const pid = await resolvePatientId(user.id)
      if (!pid) {
        toast.error('Please create a patient profile first.')
        setLoading(false)
        return
      }
      setPatientId(pid)
      await loadReports(pid)
      setLoading(false)
    }
    init()
  }, [user, loadReports])

  // Filtered & paginated
  const filtered = reports.filter((r) => {
    const q = search.toLowerCase()
    return (
      r.patientName?.toLowerCase().includes(q) ||
      r.reportType?.toLowerCase().includes(q)  ||
      r.diagnosis?.toLowerCase().includes(q)   ||
      r.notes?.toLowerCase().includes(q)
    )
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // CRUD
  const handleCreate = async (data) => {
    const res = await createMedicalReport({ ...data, patientId })
    if (res.error) { toast.error('Failed to create: ' + res.error); return }
    toast.success('Report created successfully')
    setShowForm(false)
    await loadReports(patientId)
  }

  const handleUpdate = async (data) => {
    const res = await updateMedicalReport(editReport.id, data)
    if (res.error) { toast.error('Failed to update: ' + res.error); return }
    toast.success('Report updated successfully')
    setEditReport(null)
    setShowForm(false)
    await loadReports(patientId)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await deleteMedicalReport(deleteTarget.id)
    if (res.error) { toast.error('Failed to delete'); setDeleteTarget(null); return }
    toast.success('Report deleted')
    setDeleteTarget(null)
    setReports((prev) => prev.filter((r) => r.id !== deleteTarget.id))
  }

  const openEdit   = (r) => { setEditReport(r); setShowForm(true) }
  const openCreate = ()  => { setEditReport(null); setShowForm(true) }
  const closeForm  = ()  => { setEditReport(null); setShowForm(false) }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medical Reports</h1>
          <p className="text-blue-100 text-sm mt-0.5">
            {reports.length} total report{reports.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-white text-blue-600 font-semibold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow"
        >
          + New Report
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, type, diagnosis…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
        </div>
        {search && (
          <button
            onClick={() => { setSearch(''); setPage(1) }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 bg-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Number</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Patient Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Report Type</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Diagnosis</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">File</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-gray-400">
                    <svg className="mx-auto mb-3 w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {search ? 'No reports match your search' : 'No reports yet. Create your first one!'}
                  </td>
                </tr>
              ) : (
                paginated.map((r, i) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                      {(page - 1) * ITEMS_PER_PAGE + i + 1}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{r.patientName || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {r.reportType || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-[180px] truncate">{r.diagnosis || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {r.reportDate
                        ? new Date(r.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.reports ? (
                        <button
                          onClick={() => openFile(r.reports)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                        >
                          {isPdf(r.reports) ? '📄' : '🖼️'} View
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">No file</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewReport(r)}
                          className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className="text-gray-400 hover:text-yellow-600 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg border transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <Modal onClose={closeForm} title={editReport ? 'Edit Report' : 'New Medical Report'}>
          <MedicalReportForm
            onSubmit={editReport ? handleUpdate : handleCreate}
            initialData={editReport}
            isEdit={!!editReport}
            onCancel={closeForm}
          />
        </Modal>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewReport && (
        <Modal onClose={() => setViewReport(null)} title="Report Details">
          <div className="space-y-4 text-sm">
            <DetailRow label="Patient Name" value={viewReport.patientName} />
            <DetailRow label="Report Type"  value={viewReport.reportType} badge />
            <DetailRow label="Diagnosis"    value={viewReport.diagnosis} />
            <DetailRow label="Notes"        value={viewReport.notes} multiline />
            <DetailRow
              label="Date"
              value={
                viewReport.reportDate
                  ? new Date(viewReport.reportDate).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })
                  : '—'
              }
            />

            {viewReport.reports && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Attachment
                </p>

                {isPdf(viewReport.reports) ? (
                  /* ── PDF: show open button — uses Google Docs viewer ── */
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <span className="text-3xl">📄</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">PDF Document</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click to open in PDF viewer</p>
                    </div>
                    <button
                      onClick={() => openFile(viewReport.reports)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Open PDF ↗
                    </button>
                  </div>
                ) : (
                  /* ── Image: preview inline ── */
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={viewReport.reports}
                      alt="Report attachment"
                      className="w-full max-h-64 object-contain bg-gray-50"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div
                      className="hidden items-center justify-center p-6 text-gray-400 text-sm"
                      style={{ display: 'none' }}
                    >
                      Failed to load image
                    </div>
                    <div className="flex justify-end p-2 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={() => openFile(viewReport.reports)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Open full size ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => { setViewReport(null); openEdit(viewReport) }}
                className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setViewReport(null)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)} title="Confirm Deletion" size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <svg className="w-8 h-8 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-red-700">Delete this report?</p>
                <p className="text-sm text-red-500 mt-0.5">
                  <strong>{deleteTarget.reportType}</strong> — {deleteTarget.diagnosis}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Reusable Modal
function Modal({ children, onClose, title, size = 'md' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${size === 'sm' ? 'max-w-md' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Detail Row
function DetailRow({ label, value, badge, multiline }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {badge ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value || '—'}
        </span>
      ) : multiline ? (
        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2">{value || '—'}</p>
      ) : (
        <p className="text-gray-700 font-medium">{value || '—'}</p>
      )}
    </div>
  )
}
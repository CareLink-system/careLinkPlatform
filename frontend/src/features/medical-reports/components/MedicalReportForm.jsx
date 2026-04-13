import React, { useEffect, useState } from 'react'
import { uploadToCloudinary } from '../utils/cloudinaryUpload'
import { toast } from 'sonner'

const REPORT_TYPES = [
  'Blood Test', 'X-Ray', 'MRI Scan', 'CT Scan',
  'Ultrasound', 'ECG', 'Urine Test', 'Biopsy', 'Pathology', 'Other',
]

export default function MedicalReportForm({ onSubmit, initialData, isEdit, onCancel }) {
  const [form, setForm] = useState({
    patientName: '',
    diagnosis: '',
    reportType: '',
    notes: '',
  })

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)

  useEffect(() => {
    if (initialData) {
      setForm({
        patientName: initialData.patientName || '',
        diagnosis:   initialData.diagnosis   || '',
        reportType:  initialData.reportType  || '',
        notes:       initialData.notes       || '',
      })
      // Backend returns field as "reports" not "reportUrl"
      const existingFile = initialData.reports || null
      setPreview(existingFile)
      if (existingFile) {
        const parts = existingFile.split('/')
        setFileName(parts[parts.length - 1] || 'Existing file')
      }
    }
  }, [initialData])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowed.includes(selected.type)) {
      toast.error('Only PDF, PNG, JPG or WebP files are allowed.')
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File must be smaller than 10MB.')
      return
    }
    setFile(selected)
    setFileName(selected.name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patientName.trim()) return toast.error('Patient name is required.')
    if (!form.reportType.trim())  return toast.error('Report type is required.')
    if (!form.diagnosis.trim())   return toast.error('Diagnosis is required.')

    try {
      setSubmitting(true)
      let fileUrl = preview

      if (file) {
        setUploadProgress('uploading')
        fileUrl = await uploadToCloudinary(file)
        setUploadProgress('done')
        if (!fileUrl) {
          toast.error('File upload failed. Please try again.')
          setUploadProgress(null)
          setSubmitting(false)
          return
        }
      }

      // Field names match EXACTLY to backend DTOs (C# PascalCase → camelCase JSON)
      // CreateMedicalReportDto:  PatientName, Diagnosis, ReportType, Notes, Reports, ReportDate, AppointmentId
      // UpdateMedicalReportDto:  PatientName, Diagnosis, ReportType, Notes, Reports, ReportDate
      const payload = {
        patientName:   form.patientName,
        diagnosis:     form.diagnosis,
        reportType:    form.reportType,
        notes:         form.notes          || '',
        reports:       fileUrl             || null,  // "reports" not "reportUrl"
        reportDate:    new Date().toISOString(),      // "reportDate" not "date"
        appointmentId: initialData?.appointmentId ?? 0, // required int — keep existing or default 0
      }

      await onSubmit(payload)

      setForm({ patientName: '', diagnosis: '', reportType: '', notes: '' })
      setFile(null)
      setPreview(null)
      setFileName('')
      setUploadProgress(null)
    } catch (err) {
      toast.error('Something went wrong: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    setFileName('')
    setUploadProgress(null)
  }

  return (
    <div className="space-y-5">

      {/* Patient Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Patient Name <span className="text-red-400">*</span>
        </label>
        <input
          name="patientName"
          value={form.patientName}
          onChange={handleChange}
          placeholder="e.g. John Smith"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Report Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Report Type <span className="text-red-400">*</span>
        </label>
        <select
          name="reportType"
          value={form.reportType}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select report type…</option>
          {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Diagnosis */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Diagnosis <span className="text-red-400">*</span>
        </label>
        <input
          name="diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          placeholder="e.g. Hypertension"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Additional notes or observations…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Attachment (PDF / Image)
        </label>
        {!fileName ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all group">
            <svg className="w-8 h-8 text-gray-300 group-hover:text-blue-400 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm text-gray-500 group-hover:text-blue-500">
              Click to upload <span className="font-medium">PDF, PNG, JPG</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFileChange} className="sr-only" />
          </label>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-9 h-9 flex items-center justify-center bg-blue-100 rounded-lg flex-shrink-0">
              {fileName.toLowerCase().endsWith('.pdf') ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
              {uploadProgress === 'uploading' && <p className="text-xs text-blue-500 mt-0.5 animate-pulse">Uploading to Cloudinary…</p>}
              {uploadProgress === 'done'      && <p className="text-xs text-green-500 mt-0.5">✓ Uploaded successfully</p>}
              {preview && !file && (
                <a href={preview} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                  View current file
                </a>
              )}
            </div>
            <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              {uploadProgress === 'uploading' ? 'Uploading file…' : 'Saving…'}
            </>
          ) : isEdit ? 'Update Report' : 'Create Report'}
        </button>
      </div>
    </div>
  )
}
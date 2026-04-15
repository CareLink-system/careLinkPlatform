import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { getDoctorByUserId } from '../../doctor/api/doctorApi'
import { getPatientByUserId } from '../../patient/api/patientApi'
import {
  deletePrescription,
  getPrescriptionsByDoctorId,
  getPrescriptionsByPatientId,
  updatePrescription,
} from '../api/prescriptionApi'

function toLocaleDate(value) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return '-'
  return dt.toLocaleString()
}

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const role = String(user?.role || '').toLowerCase()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [prescriptions, setPrescriptions] = useState([])
  const [profileId, setProfileId] = useState(null)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [editForm, setEditForm] = useState({ diagnosis: '', medicines: '', notes: '' })
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [savingAction, setSavingAction] = useState(false)

  const isDoctor = role === 'doctor'
  const isPatient = role === 'patient'

  const loadProfileId = useCallback(async () => {
    if (!user?.id) return null

    if (isDoctor) {
      const doctorRes = await getDoctorByUserId(user.id)
      if (!doctorRes.data) {
        throw new Error(doctorRes.error || 'Doctor profile not found')
      }
      return doctorRes.data.id
    }

    if (isPatient) {
      const patientRes = await getPatientByUserId(user.id)
      if (!patientRes.data) {
        throw new Error(patientRes.error || 'Patient profile not found')
      }
      return patientRes.data.id
    }

    throw new Error('Only doctor and patient roles can view prescriptions')
  }, [isDoctor, isPatient, user?.id])

  const loadPrescriptions = useCallback(async (idToUse) => {
    const id = idToUse ?? profileId
    if (!id) return

    const res = isDoctor
      ? await getPrescriptionsByDoctorId(id)
      : await getPrescriptionsByPatientId(id)

    if (!res.data) {
      throw new Error(res.error || 'Could not load prescriptions')
    }

    const sorted = [...res.data].sort((a, b) => {
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    })

    setPrescriptions(sorted)
  }, [isDoctor, profileId])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    setActionError('')

    try {
      const id = await loadProfileId()
      setProfileId(id)
      await loadPrescriptions(id)
    } catch (err) {
      setError(err.message || 'Could not load prescriptions')
    } finally {
      setLoading(false)
    }
  }, [loadPrescriptions, loadProfileId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!profileId) return undefined

    const timer = setInterval(() => {
      loadPrescriptions(profileId).catch(() => {})
    }, 15000)

    return () => clearInterval(timer)
  }, [loadPrescriptions, profileId])

  const pageTitle = useMemo(() => {
    if (isDoctor) return 'Issued Prescriptions'
    if (isPatient) return 'My Prescriptions'
    return 'Prescriptions'
  }, [isDoctor, isPatient])

  const openEditModal = (item) => {
    setEditingPrescription(item)
    setEditForm({
      diagnosis: item.diagnosis || '',
      medicines: item.medicines || '',
      notes: item.notes || '',
    })
    setActionError('')
    setActionMessage('')
  }

  const closeEditModal = () => {
    setEditingPrescription(null)
    setEditForm({ diagnosis: '', medicines: '', notes: '' })
  }

  const saveEdit = async () => {
    if (!editingPrescription) return
    if (!editForm.diagnosis.trim() || !editForm.medicines.trim()) {
      setActionError('Diagnosis and medicines are required.')
      return
    }

    setSavingAction(true)
    setActionError('')
    setActionMessage('')

    const payload = {
      doctorId: editingPrescription.doctorId,
      patientId: editingPrescription.patientId,
      appointmentId: editingPrescription.appointmentId,
      diagnosis: editForm.diagnosis.trim(),
      medicines: editForm.medicines.trim(),
      notes: editForm.notes.trim() || null,
    }

    const res = await updatePrescription(editingPrescription.id, payload)
    if (!res.data) {
      setActionError(res.error || 'Could not update prescription.')
      setSavingAction(false)
      return
    }

    setActionMessage('Prescription updated successfully.')
    setEditingPrescription(null)
    await loadAll()
    setSavingAction(false)
  }

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete prescription #${item.id}?`)
    if (!confirmed) return

    setSavingAction(true)
    setActionError('')
    setActionMessage('')

    const res = await deletePrescription(item.id)
    if (!res.data) {
      setActionError(res.error || 'Could not delete prescription.')
      setSavingAction(false)
      return
    }

    setActionMessage('Prescription deleted successfully.')
    await loadAll()
    setSavingAction(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
        Loading prescriptions...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{pageTitle}</h1>
          <p className="text-sm text-slate-500">
            {isDoctor ? 'Prescriptions you have written' : 'Prescriptions written by your doctor'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadAll}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-3 text-sm">
          {actionMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {prescriptions.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No prescriptions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Id</th>
                  <th className="text-left px-4 py-3">Issued</th>
                  <th className="text-left px-4 py-3">Appointment</th>
                  <th className="text-left px-4 py-3">Diagnosis</th>
                  <th className="text-left px-4 py-3">Medicines</th>
                  <th className="text-left px-4 py-3">Notes</th>
                  {isDoctor && <th className="text-left px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescriptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{String(item.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3 text-slate-600">{toLocaleDate(item.issuedAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{item.appointmentId ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{item.diagnosis}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-pre-wrap">{item.medicines}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-pre-wrap">{item.notes || '-'}</td>
                    {isDoctor && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100"
                            disabled={savingAction}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100"
                            disabled={savingAction}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Edit Prescription</h2>
                <p className="text-xs text-slate-500">Prescription #{String(editingPrescription.id).padStart(4, '0')}</p>
              </div>
              <button type="button" onClick={closeEditModal} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-3">
              <input
                type="text"
                value={editForm.diagnosis}
                onChange={(e) => setEditForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
                placeholder="Diagnosis"
              />
              <textarea
                value={editForm.medicines}
                onChange={(e) => setEditForm((prev) => ({ ...prev, medicines: e.target.value }))}
                className="w-full min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
                placeholder="Medicines and dosage"
              />
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full min-h-[96px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
                placeholder="Notes (optional)"
              />
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={savingAction}
                className="px-4 py-2 rounded-lg bg-[#4B9AA8] text-white text-sm font-semibold disabled:opacity-60"
              >
                {savingAction ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

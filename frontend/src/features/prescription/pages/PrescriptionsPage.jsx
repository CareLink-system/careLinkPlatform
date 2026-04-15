import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { getDoctorByUserId } from '../../doctor/api/doctorApi'
import { getPatientByUserId } from '../../patient/api/patientApi'
import {
  getPrescriptionsByDoctorId,
  getPrescriptionsByPatientId,
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

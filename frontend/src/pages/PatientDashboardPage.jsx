import React from 'react'
import { Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/dashboard/ProtectedRoute'
import ContentArea from '../components/dashboard/ContentArea'
import { useAuth } from '../features/auth/context/AuthContext'
import { getDashboardRoute, normalizeRole } from '../features/auth/utils/roleRouting'

export default function DashboardPage() {
  const { user } = useAuth()
  const role = normalizeRole(user?.role)

  if (role === 'doctor' || role === 'admin') {
    return <Navigate to={getDashboardRoute(role)} replace />
  }

  return (
    <ProtectedRoute allowedRoles={["Patient"]}>
      <ContentArea />
    </ProtectedRoute>
  )
}

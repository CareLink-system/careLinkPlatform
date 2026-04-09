import React from 'react'
import { Navigate } from 'react-router-dom'
import { getDashboardRoute, normalizeRole } from '../../features/auth/utils/roleRouting'
import { getStoredAuth } from '../../features/auth/api/authApi'

export default function ProtectedRoute({ children, allowedRoles = null, redirectTo = null }) {
  const stored = getStoredAuth()

  if (!stored?.token) {
    return <Navigate to="/auth/login" replace />
  }

  const role = normalizeRole(stored?.user?.role)
  const normalizedAllowedRoles = Array.isArray(allowedRoles) ? allowedRoles.map(normalizeRole) : null

  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(role)) {
    return <Navigate to={redirectTo || getDashboardRoute(role)} replace />
  }

  return children
}

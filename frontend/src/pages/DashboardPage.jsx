import React from 'react'
import ProtectedRoute from '../components/dashboard/ProtectedRoute'
import DashboardShell from '../components/dashboard/DashboardShell'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell />
    </ProtectedRoute>
  )
}

import React from 'react'
import ProtectedRoute from '../components/dashboard/ProtectedRoute'
import ContentArea from '../components/dashboard/ContentArea'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ContentArea />
    </ProtectedRoute>
  )
}

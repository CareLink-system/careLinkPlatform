import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  // Requirement: protect by presence of localStorage key `carelink.auth`
  const stored = typeof window !== 'undefined' ? localStorage.getItem('carelink.auth') : null
  if (!stored) {
    return <Navigate to="/auth/login" replace />
  }
  return children
}

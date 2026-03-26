import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './features/landing/LandingPage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TelemedicinePage from './pages/TelemedicinePage'
import SymptomCheckerPage from './pages/SymptomCheckerPage'
import ProtectedRoute from './components/dashboard/ProtectedRoute'
import DashboardShell from './components/dashboard/DashboardShell'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route element={<DashboardShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/telemedicine/:appointmentId" element={<TelemedicinePage />} />
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
      </Route>
    </Routes>
  )
}

export default App

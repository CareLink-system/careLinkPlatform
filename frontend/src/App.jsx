import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './features/landing/LandingPage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DoctorDashboardPage from './pages/DoctorDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import TelemedicinePage from './pages/TelemedicinePage'
import SymptomCheckerPage from './pages/SymptomCheckerPage'
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
        <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/telemedicine/:appointmentId" element={<TelemedicinePage />} />
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
      </Route>
    </Routes>
  )
}

export default App

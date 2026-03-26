import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './features/landing/LandingPage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TelemedicinePage from './pages/TelemedicinePage'
import ProtectedRoute from './components/dashboard/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/telemedicine/:appointmentId" element={<TelemedicinePage />} />
    </Routes>
  )
}

export default App

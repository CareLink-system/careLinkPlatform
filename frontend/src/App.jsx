import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./features/landing/LandingPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import DashboardPage from "./pages/PatientDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TelemedicinePage from "./pages/TelemedicinePage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import ChatbotPage from "./pages/ChatbotPage";
import DashboardShell from "./components/dashboard/DashboardShell";
import PatientProfilePage from "./features/patient/pages/PatientProfilePage";
import MedicalReportsPage from "./features/medical-reports/pages/MedicalReportsPage";
import GetAllMedicalReports from "./features/medical-reports/pages/GetAllMedicalReports";
import Calendar from "./features/calendar/PatientCalendar";
import DoctorProfilePage from "./features/doctor/pages/DoctorProfilePage";
import GetAllDoctorList from "./features/doctor/pages/getAllDoctorList";
import DoctorSlotsPage from "./features/slots/pages/DoctorSlotsPage";
import AppointmentFormPage from "./features/appointment/pages/AppointmentFormPage";
import PatientAppointmentsPage from "./features/appointment/pages/PatientAppointmentsPage";
import DoctorAppointmentsPage from "./features/appointment/pages/DoctorAppointmentsPage";
import UserManagementPage from "./features/userManagement/pages/userManagementPage";
import BasicFinancialTransactionMonitoringPage from "./features/paymentTransaction/pages/basicFinancialTransactionMonitoringPage";
import ManageSlotsPage from "./features/slots/pages/ManageSlotsPage";
import PaymentPage from "./features/payment/pages/PaymentPage";
import PaymentSuccessPage from "./features/payment/pages/PaymentSuccessPage";
import PaymentCancelPage from "./features/payment/pages/PaymentCancelPage";
import PrescriptionsPage from "./features/prescription/pages/PrescriptionsPage";

import "./App.css";

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
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route
          path="/payments"
          element={<BasicFinancialTransactionMonitoringPage />}
        />
        <Route
          path="/telemedicine/:appointmentId"
          element={<TelemedicinePage />}
        />
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/patient-profile" element={<PatientProfilePage />} />
        <Route path="/medical-reports" element={<MedicalReportsPage />} />
        <Route path="/all-medical-reports" element={<GetAllMedicalReports />} />
        <Route path="/calendar" element={<Calendar />} />

        <Route path="/doctor-profile" element={<DoctorProfilePage />} />
        <Route path="/find" element={<GetAllDoctorList />} />
        <Route
          path="/doctor/:doctorId/availability"
          element={<DoctorSlotsPage />}
        />
        <Route path="/appointments/book" element={<AppointmentFormPage />} />
        <Route path="/appointments" element={<PatientAppointmentsPage />} />
        <Route
          path="/doctor/appointments"
          element={<DoctorAppointmentsPage />}
        />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
     
        <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
        <Route path="/slots/manage" element={<ManageSlotsPage />} />
        <Route path="/prescriptions" element={<PrescriptionsPage />} />
        </Route>
    </Routes>
  );
}

export default App;

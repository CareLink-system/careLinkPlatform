import React from 'react'
import ProtectedRoute from '../components/dashboard/ProtectedRoute'
import RoleDashboardContent from '../components/dashboard/RoleDashboardContent'

const doctorDashboardConfig = {
  title: 'Doctor Dashboard',
  subtitle: 'Keep today’s consultations, patient follow-ups, and clinical priorities in one place.',
  heroBadge: 'Clinical Workflow',
  heroTitle: 'Everything you need to manage consults and patient care.',
  heroCopy: 'Review appointments, respond to follow-ups, and keep an eye on the patients who need attention next.',
  heroTags: ['Telemedicine', 'Follow-ups', 'Patient Notes'],
  heroStats: [
    { label: 'Today', value: '12' },
    { label: 'Waiting', value: '4' },
    { label: 'Follow-ups', value: '7' },
  ],
  stats: [
    { label: 'Appointments', value: '18', description: 'Scheduled across the week', delta: '+3 today' },
    { label: 'Pending reviews', value: '9', description: 'Notes and prescriptions to sign off', delta: '2 urgent' },
    { label: 'Virtual visits', value: '6', description: 'Telemedicine consultations this week', delta: 'Stable' },
  ],
  focusTitle: 'Consultation queue',
  focusSubtitle: 'The most important patient touchpoints for the day.',
  focusAction: 'Open schedule',
  focusItems: [
    { title: 'Morning rounds', description: 'Review lab updates and plan follow-ups for admitted patients.', meta: '5 patients' },
    { title: 'Telemedicine block', description: 'Two video visits and one medication review are waiting.', meta: '12:30 PM' },
    { title: 'Prescription review', description: 'Sign off on renewals and dosage adjustments.', meta: 'Needs review' },
    { title: 'New referrals', description: 'Check incoming referrals from the symptom checker pipeline.', meta: '3 new' },
  ],
  actionsTitle: 'Quick actions',
  actionsSubtitle: 'Shortcuts for the tasks doctors use most often.',
  actions: [
    { label: 'Start consultation', description: 'Join a live patient session.', icon: '🎥' },
    { label: 'Review patient record', description: 'Open the latest notes and history.', icon: '🩺' },
    { label: 'Write prescription', description: 'Prepare or renew a medication plan.', icon: '📋' },
  ],
  activityTitle: 'Recent activity',
  activitySubtitle: 'A quick look at what changed recently.',
  activity: [
    { title: 'Video visit completed', description: 'Patient follow-up finished successfully.', time: '5m', icon: '✓' },
    { title: 'Lab result reviewed', description: 'New result acknowledged and added to chart.', time: '18m', icon: '🧪' },
    { title: 'Prescription renewed', description: 'Medication refill signed and sent.', time: '1h', icon: '✎' },
  ],
  summaryTitle: 'Shift snapshot',
  summarySubtitle: 'A concise status view for the current workday.',
  summaryItems: [
    { label: 'Utilization', value: '74%', note: 'Busy but manageable' },
    { label: 'Average wait', value: '9 min', note: 'Within target' },
    { label: 'No-show rate', value: '6%', note: 'Healthy trend' },
  ],
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Doctor']} redirectTo="/doctor-dashboard">
      <RoleDashboardContent config={doctorDashboardConfig} />
    </ProtectedRoute>
  )
}

import React from 'react'
import { useParams } from 'react-router-dom'
import VideoRoom from '../components/VideoRoom'

export default function TelemedicinePage() {
  const { appointmentId } = useParams();
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Telemedicine — Appointment: {appointmentId}</h2>
      <VideoRoom appointmentId={appointmentId} />
    </div>
  )
}

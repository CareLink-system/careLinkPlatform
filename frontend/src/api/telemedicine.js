// Simple API wrapper to fetch Agora token for an appointment
const BASE = import.meta.env.VITE_TELEMEDICINE_API_BASE_URL || 'http://localhost:5007';

export async function getAgoraToken(appointmentId) {
  const url = `${BASE.replace(/\/$/, '')}/api/telemedicine/video/token/${appointmentId}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default { getAgoraToken };

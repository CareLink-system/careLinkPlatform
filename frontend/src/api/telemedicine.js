import axios from "axios";

const BASE =
  import.meta.env.VITE_TELEMEDICINE_API_BASE_URL || "http://localhost:5007";

const AUTH_STORAGE_KEY = 'carelink.auth';

function getAuthHeader() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const token = parsed?.token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

const apiClient = axios.create({
  baseURL: BASE.replace(/\/$/, ""),
  headers: { 'Content-Type': 'application/json' },
});

export async function getAgoraToken(appointmentId) {
  try {
    const res = await apiClient.get(`/api/telemedicine/video/token/${appointmentId}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    const statusText = err?.response?.statusText || err.message;
    throw new Error(`${status || "Error"} ${statusText}`);
  }
}

export async function startSession(appointmentId) {
  const res = await apiClient.post(`/api/telemedicine/session/${appointmentId}/start`, {}, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function endSession(appointmentId) {
  const res = await apiClient.post(`/api/telemedicine/session/${appointmentId}/end`, {}, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function postSessionMessage(appointmentId, message) {
  const res = await apiClient.post(
    `/api/telemedicine/session/${appointmentId}/messages`,
    { message },
    { headers: getAuthHeader() }
  );
  return res.data;
}

export async function postDoctorSessionNote(appointmentId, note) {
  const res = await apiClient.post(
    `/api/telemedicine/session/${appointmentId}/notes`,
    { note },
    { headers: getAuthHeader() }
  );
  return res.data;
}

export default {
  getAgoraToken,
  startSession,
  endSession,
  postSessionMessage,
  postDoctorSessionNote,
};

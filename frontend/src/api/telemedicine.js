import axios from "axios";

const PRIMARY_BASE = (
  import.meta.env.VITE_TELEMEDICINE_API_BASE_URL ||
  "https://localhost:5007"
).replace(/\/$/, "");

const FALLBACK_BASE = PRIMARY_BASE.startsWith("https://")
  ? PRIMARY_BASE.replace("https://", "http://")
  : PRIMARY_BASE.startsWith("http://")
    ? PRIMARY_BASE.replace("http://", "https://")
    : "";

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
  baseURL: PRIMARY_BASE,
  headers: { 'Content-Type': 'application/json' },
});

const fallbackClient = FALLBACK_BASE
  ? axios.create({
      baseURL: FALLBACK_BASE,
      headers: { 'Content-Type': 'application/json' },
    })
  : null;

function isNetworkError(err) {
  return !err?.response && (err?.code === 'ERR_NETWORK' || String(err?.message || '').includes('Network Error'));
}

async function withProtocolFallback(requestFn) {
  try {
    return await requestFn(apiClient);
  } catch (err) {
    if (!fallbackClient || !isNetworkError(err)) {
      throw err;
    }
    return await requestFn(fallbackClient);
  }
}

export async function getAgoraToken(appointmentId) {
  try {
    const res = await withProtocolFallback((client) =>
      client.get(`/api/telemedicine/video/token/${appointmentId}`, {
        headers: getAuthHeader(),
      })
    );
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    const statusText = err?.response?.statusText || err.message;
    throw new Error(`${status || "Error"} ${statusText}`);
  }
}

export async function startSession(appointmentId) {
  const res = await withProtocolFallback((client) =>
    client.post(`/api/telemedicine/session/${appointmentId}/start`, {}, {
      headers: getAuthHeader(),
    })
  );
  return res.data;
}

export async function endSession(appointmentId) {
  const res = await withProtocolFallback((client) =>
    client.post(`/api/telemedicine/session/${appointmentId}/end`, {}, {
      headers: getAuthHeader(),
    })
  );
  return res.data;
}

export async function postSessionMessage(appointmentId, message) {
  const res = await withProtocolFallback((client) =>
    client.post(
      `/api/telemedicine/session/${appointmentId}/messages`,
      { message },
      { headers: getAuthHeader() }
    )
  );
  return res.data;
}

export async function postDoctorSessionNote(appointmentId, note) {
  const res = await withProtocolFallback((client) =>
    client.post(
      `/api/telemedicine/session/${appointmentId}/notes`,
      { note },
      { headers: getAuthHeader() }
    )
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

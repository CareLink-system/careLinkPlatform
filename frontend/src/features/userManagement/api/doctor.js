// feature/userManagement/api/doctor.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

const AUTH_STORAGE_KEY = "carelink.auth";

// Helper function to get auth token
function getAuthToken() {
  try {
    const auth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!auth) return null;
    const parsed = JSON.parse(auth);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

// Helper function to set auth header
function setAuthHeader() {
  const token = getAuthToken();
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

// Helper function to generate request ID (UUID)
function generateRequestId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

// Error handler helper
function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors[0];
  }
  if (payload.message) return payload.message;
  if (payload.title) return payload.title;
  return fallback;
}

// Generic GET request
async function get(path, params = {}, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.get(path, {
      params,
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload;
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// Generic POST request
async function post(path, data, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.post(path, data, {
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload;
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// Generic PUT request
async function put(path, data, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.put(path, data, {
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload;
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// Generic DELETE request
async function del(path, headers = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.delete(path, {
      headers: {
        "X-Request-ID": generateRequestId(),
        "X-Correlation-ID": generateRequestId(),
        ...headers
      }
    });

    if (res.status === 204) {
      return { success: true };
    }

    const payload = res.data;
    if (res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload || { success: true };
  } catch (err) {
    const payload = err?.response?.data || null;
    throw new Error(
      getErrorMessage(
        payload,
        err.message || "Something went wrong. Please try again."
      )
    );
  }
}

// ==================== Doctor API Functions ====================

/**
 * Create a new doctor profile
 * @param {Object} doctorData - Doctor creation data
 * @param {number} doctorData.userId - User ID (required)
 * @param {string} doctorData.specializationId - Specialization ID (required)
 * @param {string} doctorData.licenseNumber - License number (required)
 * @param {string} doctorData.qualifications - Qualifications (optional)
 * @param {string} doctorData.experience - Years of experience (optional)
 * @param {string} doctorData.bio - Biography (optional)
 * @param {string} doctorData.department - Department (optional)
 * @param {number} doctorData.consultationFee - Consultation fee (optional)
 * @returns {Promise<Object>} - Created doctor data
 */
export async function createDoctor(doctorData) {
  if (!doctorData.userId) throw new Error("User ID is required");
  if (!doctorData.specializationId)
    throw new Error("Specialization ID is required");
  if (!doctorData.licenseNumber) throw new Error("License number is required");

  const payload = {
    userId: doctorData.userId,
    specializationId: doctorData.specializationId,
    licenseNumber: doctorData.licenseNumber,
    qualifications: doctorData.qualifications || null,
    experience: doctorData.experience || null,
    bio: doctorData.bio || null,
    department: doctorData.department || null,
    consultationFee: doctorData.consultationFee || 0
  };

  return post("/api/v1/doctors", payload);
}

/**
 * Get all doctors
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 * @param {string} params.searchTerm - Search term
 * @param {string} params.specializationId - Filter by specialization
 * @param {boolean} params.isAvailable - Filter by availability
 * @param {boolean} params.isVerified - Filter by verification status
 * @returns {Promise<Object>} - List of doctors
 */
export async function getDoctors(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.pageSize) queryParams.append("pageSize", params.pageSize);
  if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
  if (params.specializationId)
    queryParams.append("specializationId", params.specializationId);
  if (params.isAvailable !== undefined)
    queryParams.append("isAvailable", params.isAvailable);
  if (params.isVerified !== undefined)
    queryParams.append("isVerified", params.isVerified);

  const queryString = queryParams.toString();
  const url = queryString
    ? `/api/v1/doctors?${queryString}`
    : "/api/v1/doctors";

  return get(url);
}

/**
 * Get doctor by ID
 * @param {number} id - Doctor ID
 * @returns {Promise<Object>} - Doctor data
 */
export async function getDoctorById(id) {
  if (!id) throw new Error("Doctor ID is required");
  if (isNaN(id)) throw new Error("Doctor ID must be a number");
  return get(`/api/v1/doctors/${id}`);
}

/**
 * Update doctor information
 * @param {number} id - Doctor ID
 * @param {Object} doctorData - Doctor update data
 * @param {string} doctorData.specializationId - Specialization ID (required)
 * @param {string} doctorData.licenseNumber - License number (required)
 * @param {string} doctorData.qualifications - Qualifications
 * @param {string} doctorData.experience - Years of experience
 * @param {string} doctorData.bio - Biography
 * @param {string} doctorData.department - Department
 * @param {number} doctorData.consultationFee - Consultation fee
 * @param {boolean} doctorData.isAvailable - Availability status
 * @returns {Promise<Object>} - Updated doctor data
 */
export async function updateDoctor(id, doctorData) {
  if (!id) throw new Error("Doctor ID is required");
  if (isNaN(id)) throw new Error("Doctor ID must be a number");
  if (!doctorData.specializationId)
    throw new Error("Specialization ID is required");
  if (!doctorData.licenseNumber) throw new Error("License number is required");

  const payload = {
    specializationId: doctorData.specializationId,
    licenseNumber: doctorData.licenseNumber,
    qualifications: doctorData.qualifications || null,
    experience: doctorData.experience || null,
    bio: doctorData.bio || null,
    department: doctorData.department || null,
    consultationFee: doctorData.consultationFee || 0,
    isAvailable: doctorData.isAvailable ?? true
  };

  return put(`/api/v1/doctors/${id}`, payload);
}

/**
 * Delete doctor profile
 * @param {number} id - Doctor ID
 * @returns {Promise<Object>} - Success response
 */
export async function deleteDoctor(id) {
  if (!id) throw new Error("Doctor ID is required");
  if (isNaN(id)) throw new Error("Doctor ID must be a number");
  return del(`/api/v1/doctors/${id}`);
}

/**
 * Get all verified doctors
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - List of verified doctors
 */
export async function getVerifiedDoctors(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.pageSize) queryParams.append("pageSize", params.pageSize);
  if (params.searchTerm) queryParams.append("searchTerm", params.searchTerm);
  if (params.specializationId)
    queryParams.append("specializationId", params.specializationId);

  const queryString = queryParams.toString();
  const url = queryString
    ? `/api/v1/doctors/verified?${queryString}`
    : "/api/v1/doctors/verified";

  return get(url);
}

/**
 * Get doctors by specialization
 * @param {string} specializationId - Specialization ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - List of doctors by specialization
 */
export async function getDoctorsBySpecialization(
  specializationId,
  params = {}
) {
  if (!specializationId) throw new Error("Specialization ID is required");

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.pageSize) queryParams.append("pageSize", params.pageSize);
  if (params.isAvailable !== undefined)
    queryParams.append("isAvailable", params.isAvailable);

  const queryString = queryParams.toString();
  const url = queryString
    ? `/api/v1/doctors/specialization/${specializationId}?${queryString}`
    : `/api/v1/doctors/specialization/${specializationId}`;

  return get(url);
}

/**
 * Verify a doctor (Admin only)
 * @param {number} id - Doctor ID
 * @returns {Promise<Object>} - Verified doctor data
 */
export async function verifyDoctor(id) {
  if (!id) throw new Error("Doctor ID is required");
  if (isNaN(id)) throw new Error("Doctor ID must be a number");
  return put(`/api/v1/doctors/${id}/verify`, {});
}

/**
 * Get doctor by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Doctor data
 */
export async function getDoctorByUserId(userId) {
  if (!userId) throw new Error("User ID is required");
  return get(`/api/v1/doctors/user/${userId}`);
}

/**
 * Update doctor availability
 * @param {number} id - Doctor ID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise<Object>} - Updated doctor data
 */
export async function updateDoctorAvailability(id, isAvailable) {
  if (!id) throw new Error("Doctor ID is required");
  if (isNaN(id)) throw new Error("Doctor ID must be a number");

  // First get current doctor data
  const doctor = await getDoctorById(id);

  // Then update with new availability
  return updateDoctor(id, {
    specializationId: doctor.specializationId,
    licenseNumber: doctor.licenseNumber,
    qualifications: doctor.qualifications,
    experience: doctor.experience,
    bio: doctor.bio,
    department: doctor.department,
    consultationFee: doctor.consultationFee,
    isAvailable: isAvailable
  });
}

/**
 * Bulk get doctors by IDs
 * @param {number[]} ids - Array of doctor IDs
 * @returns {Promise<Object[]>} - List of doctors
 */
export async function getDoctorsByIds(ids) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Valid doctor IDs array is required");
  }

  // Use Promise.all for parallel requests
  const promises = ids.map((id) =>
    getDoctorById(id).catch((err) => ({
      error: true,
      id,
      message: err.message
    }))
  );
  const results = await Promise.all(promises);

  return results;
}

/**
 * Search doctors with advanced filters
 * @param {Object} filters - Search filters
 * @param {string} filters.query - Search query
 * @param {string} filters.specializationId - Specialization ID
 * @param {number} filters.minFee - Minimum consultation fee
 * @param {number} filters.maxFee - Maximum consultation fee
 * @param {number} filters.minRating - Minimum rating
 * @param {boolean} filters.isAvailable - Availability status
 * @param {boolean} filters.isVerified - Verification status
 * @param {number} filters.page - Page number
 * @param {number} filters.pageSize - Page size
 * @returns {Promise<Object>} - Search results
 */
export async function searchDoctors(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.query) queryParams.append("query", filters.query);
  if (filters.specializationId)
    queryParams.append("specializationId", filters.specializationId);
  if (filters.minFee !== undefined)
    queryParams.append("minFee", filters.minFee);
  if (filters.maxFee !== undefined)
    queryParams.append("maxFee", filters.maxFee);
  if (filters.minRating !== undefined)
    queryParams.append("minRating", filters.minRating);
  if (filters.isAvailable !== undefined)
    queryParams.append("isAvailable", filters.isAvailable);
  if (filters.isVerified !== undefined)
    queryParams.append("isVerified", filters.isVerified);
  if (filters.page) queryParams.append("page", filters.page);
  if (filters.pageSize) queryParams.append("pageSize", filters.pageSize);

  const queryString = queryParams.toString();
  const url = queryString
    ? `/api/v1/doctors/search?${queryString}`
    : "/api/v1/doctors/search";

  return get(url);
}

/**
 * Get doctor statistics (Admin only)
 * @returns {Promise<Object>} - Doctor statistics
 */
export async function getDoctorStatistics() {
  return get("/api/v1/doctors/statistics");
}

/**
 * Get top rated doctors
 * @param {number} limit - Number of doctors to return (default: 10)
 * @returns {Promise<Object>} - Top rated doctors
 */
export async function getTopRatedDoctors(limit = 10) {
  return get(`/api/v1/doctors/top-rated?limit=${limit}`);
}

/**
 * Get available doctors for today
 * @returns {Promise<Object>} - Available doctors
 */
export async function getAvailableDoctorsToday() {
  return get("/api/v1/doctors/available/today");
}

// ==================== Utility Functions ====================

/**
 * Set authentication token in axios defaults
 * @param {string} token - JWT token
 */
export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
  delete apiClient.defaults.headers.common["Authorization"];
}

/**
 * Initialize API client with stored auth token
 */
export function initializeApiClient() {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
  return apiClient;
}

// Export the api client for advanced use cases
export { apiClient };

// Default export with all functions
export default {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getVerifiedDoctors,
  getDoctorsBySpecialization,
  verifyDoctor,
  getDoctorByUserId,
  updateDoctorAvailability,
  getDoctorsByIds,
  searchDoctors,
  getDoctorStatistics,
  getTopRatedDoctors,
  getAvailableDoctorsToday,
  setAuthToken,
  clearAuthToken,
  initializeApiClient,
  apiClient
};

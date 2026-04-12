// feature/userManagement/api/user.js
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

// Error handler helper
function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors[0];
  }
  if (payload.message) return payload.message;
  if (payload.title) return payload.title;
  return fallback;
}

// Generic GET request
async function get(path, params = {}) {
  try {
    setAuthHeader();
    const res = await apiClient.get(path, { params });
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload.data;
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
async function put(path, data) {
  try {
    setAuthHeader();
    const res = await apiClient.put(path, data);
    const payload = res.data;

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload.data;
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
async function del(path) {
  try {
    setAuthHeader();
    const res = await apiClient.delete(path);

    // 204 No Content is successful but has no response body
    if (res.status === 204) {
      return { success: true };
    }

    const payload = res.data;
    if (res.status >= 400 || payload?.success === false) {
      throw new Error(
        getErrorMessage(payload, "Something went wrong. Please try again.")
      );
    }

    return payload?.data || { success: true };
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

// ==================== User API Functions ====================

/**
 * Get all users with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.pageNumber - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 10)
 * @param {string} params.searchTerm - Search term for filtering
 * @param {string} params.role - Filter by role (Patient, Doctor, Admin)
 * @returns {Promise<Object>} - Paginated user response
 */
export async function getUsers(params = {}) {
  const { pageNumber = 1, pageSize = 10, searchTerm, role } = params;
  const queryParams = {
    pageNumber,
    pageSize,
    ...(searchTerm && { searchTerm }),
    ...(role && { role })
  };
  return get("/api/v1/Auth/Users", queryParams);
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} - User response data
 */
export async function getUserById(id) {
  if (!id) throw new Error("User ID is required");
  return get(`/api/v1/Auth/Users/${id}`);
}

/**
 * Update user information (Admin only)
 * @param {string} id - User ID
 * @param {Object} userData - User update data
 * @param {string} userData.firstName - First name (required)
 * @param {string} userData.lastName - Last name (required)
 * @param {string} userData.role - User role
 * @param {string} userData.titles - Titles (Mr, Mrs, Ms, Dr, etc.)
 * @param {string} userData.phoneNumber - Phone number
 * @param {string} userData.fullName - Full name
 * @param {string} userData.designation - Designation
 * @param {boolean} userData.isActive - Active status
 * @returns {Promise<Object>} - Updated user data
 */
export async function updateUser(id, userData) {
  if (!id) throw new Error("User ID is required");
  if (!userData.firstName || !userData.lastName) {
    throw new Error("First name and last name are required");
  }
  return put(`/api/v1/Auth/Users/${id}`, userData);
}

/**
 * Soft delete a user (Admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} - Success response
 */
export async function deleteUser(id) {
  if (!id) throw new Error("User ID is required");
  return del(`/api/v1/Auth/Users/${id}`);
}

/**
 * Activate a user (Admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} - Updated user data
 */
export async function activateUser(id) {
  if (!id) throw new Error("User ID is required");
  return put(`/api/v1/Auth/Users/${id}/activate`, {});
}

/**
 * Deactivate a user (Admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} - Updated user data
 */
export async function deactivateUser(id) {
  if (!id) throw new Error("User ID is required");
  return put(`/api/v1/Auth/Users/${id}/deactivate`, {});
}

/**
 * Get current authenticated user profile
 * @returns {Promise<Object>} - Current user profile data
 */
export async function getCurrentUser() {
  return get("/api/v1/Auth/Users/me");
}

/**
 * Update current user profile
 * @param {Object} profileData - Profile update data
 * @param {string} profileData.firstName - First name
 * @param {string} profileData.lastName - Last name
 * @param {string} profileData.titles - Titles
 * @returns {Promise<Object>} - Updated user profile
 */
export async function updateCurrentUser(profileData) {
  return put("/api/v1/Auth/Users/me", profileData);
}

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password (min 6 chars)
 * @returns {Promise<Object>} - Success response
 */
export async function changePassword(passwordData) {
  if (!passwordData.currentPassword || !passwordData.newPassword) {
    throw new Error("Current password and new password are required");
  }
  if (passwordData.newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }
  return put("/api/v1/Auth/change-password", passwordData);
}

/**
 * Refresh authentication token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New token data
 */
export async function refreshToken(refreshToken) {
  if (!refreshToken) throw new Error("Refresh token is required");
  return put("/api/v1/Auth/refresh-token", { refreshToken });
}

/**
 * Logout user (invalidate token)
 * @returns {Promise<Object>} - Success response
 */
export async function logout() {
  try {
    await put("/api/v1/Auth/logout", {});
  } catch (error) {
    // Even if the API call fails, clear local storage
    console.error("Logout API error:", error);
  } finally {
    // Clear local storage regardless
    localStorage.removeItem(AUTH_STORAGE_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
  }
  return { success: true };
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
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  refreshToken,
  logout,
  setAuthToken,
  clearAuthToken,
  initializeApiClient,
  apiClient
};

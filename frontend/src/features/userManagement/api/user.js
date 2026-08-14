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

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== User API Functions ====================

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (params = {}) => {
  try {
    const { pageNumber = 1, pageSize = 10, searchTerm, role } = params;
    const queryParams = {
      pageNumber,
      pageSize,
      ...(searchTerm && { searchTerm }),
      ...(role && { role })
    };
    const res = await apiClient.get("/api/v1/Auth/Users", {
      params: queryParams
    });
    return { data: res.data?.data ?? res.data, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message
    };
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  if (!id) return { data: null, error: "User ID is required" };
  try {
    const res = await apiClient.get(`/api/v1/Auth/Users/${id}`);
    return { data: res.data?.data ?? res.data, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message
    };
  }
};

/**
 * Update user information (Admin only)
 */
export const updateUser = async (id, userData) => {
  if (!id) {
    return {
      data: null,
      error: "User ID is required",
      status: 400,
      details: null
    };
  }

  try {
    const res = await apiClient.put(`/api/v1/Auth/Users/${id}`, userData);

    return {
      data: res.data?.data ?? res.data,
      error: null,
      status: res.status,
      details: null
    };
  } catch (err) {
    const status = err?.response?.status ?? null;
    const responseData = err?.response?.data ?? null;

    let message = "Something went wrong. Please try again.";

    if (!err.response) {
      message =
        "Cannot connect to server. Check whether the backend is running.";
    } else if (status === 400) {
      message =
        responseData?.message ||
        responseData?.errors?.[0] ||
        "Invalid request data.";
    } else if (status === 401) {
      message = "You are not authenticated. Please log in again.";
    } else if (status === 403) {
      message = "You do not have permission to update this user.";
    } else if (status === 404) {
      message =
        responseData?.message ||
        "Update endpoint not found. Check backend route or API base URL.";
    } else if (status === 409) {
      message =
        responseData?.message || "A conflict occurred while updating the user.";
    } else if (status === 500) {
      message =
        responseData?.message ||
        "Internal server error occurred in the backend.";
    } else {
      message =
        responseData?.message ||
        responseData?.errors?.[0] ||
        err.message ||
        "Something went wrong. Please try again.";
    }

    console.error("updateUser error:", {
      status,
      url: err?.config?.url,
      method: err?.config?.method,
      responseData,
      fullError: err
    });

    return {
      data: null,
      error: message,
      status,
      details: responseData
    };
  }
};

/**
 * Delete a user (soft delete) - status = 99
 */
export const deleteUser = async (id) => {
  if (!id) return { data: null, error: "User ID is required" };
  return updateUser(id, { status: 99 });
};

/**
 * Activate a user - status = 1
 */
export const activateUser = async (id) => {
  if (!id) return { data: null, error: "User ID is required" };
  return updateUser(id, { status: 1 });
};

/**
 * Deactivate a user - status = 0
 */
export const deactivateUser = async (id) => {
  if (!id) return { data: null, error: "User ID is required" };
  return updateUser(id, { status: 0 });
};

/**
 * Get current authenticated user profile
 */
export const getCurrentUser = async () => {
  try {
    const res = await apiClient.get("/api/v1/Auth/Users/me");
    return { data: res.data?.data ?? res.data, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message
    };
  }
};

/**
 * Update current user profile
 */
export const updateCurrentUser = async (profileData) => {
  try {
    const res = await apiClient.put("/api/v1/Auth/Users/me", profileData);
    return { data: res.data?.data ?? res.data, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message
    };
  }
};

/**
 * Change user password
 */
export const changePassword = async (passwordData) => {
  if (!passwordData.currentPassword || !passwordData.newPassword) {
    return {
      data: null,
      error: "Current password and new password are required"
    };
  }
  if (passwordData.newPassword.length < 6) {
    return { data: null, error: "New password must be at least 6 characters" };
  }
  try {
    const res = await apiClient.put(
      "/api/v1/Auth/change-password",
      passwordData
    );
    return { data: res.data?.data ?? res.data, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message
    };
  }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (refreshTokenValue) => {
  if (!refreshTokenValue)
    return { data: null, error: "Refresh token is required" };
  try {
    const res = await apiClient.put("/api/v1/Auth/refresh-token", {
      refreshToken: refreshTokenValue
    });
    return { data: res.data?.data ?? res.data, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message
    };
  }
};

/**
 * Logout user (invalidate token)
 */
export const logout = async () => {
  try {
    await apiClient.put("/api/v1/Auth/logout", {});
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return { success: true };
};

// ==================== Utility Functions ====================

/**
 * Set authentication token manually
 */
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common["Authorization"];
};

/**
 * Initialize API client with stored auth token
 */
export const initializeApiClient = () => {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
  return apiClient;
};

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
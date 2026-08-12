import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/proxy/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach stored JWT ──────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle expired / missing token ────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail || "";

    const isTokenError =
      status === 401 ||
      detail.toLowerCase().includes("invalid") ||
      detail.toLowerCase().includes("expired") ||
      detail.toLowerCase().includes("token");

    if (isTokenError && typeof window !== "undefined") {
      // Try a silent token refresh first
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry the original request with the new token
        const newToken = localStorage.getItem("access_token");
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      }

      // Refresh failed — clear session and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    return Promise.reject(error);
  }
);

/**
 * Attempts to obtain a new access token using the stored refresh token.
 * Returns true if successful, false otherwise.
 */
async function tryRefreshToken() {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    const res = await fetch("/api/proxy/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    if (data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
      // Rotate the refresh token if a new one was issued
      if (data?.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default apiClient;

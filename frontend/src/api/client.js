import axios from "axios";

export const API_BASE_URL = "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach access token from localStorage to every request (if present),
// except for auth endpoints which should not send a JWT.
apiClient.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAuthEndpoint =
    url.includes("/api/login") ||
    url.includes("/api/institute/register") ||
    url.includes("/api/token/refresh");

  if (!isAuthEndpoint) {
    const token = window.localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Handle 401 responses by attempting a token refresh once, then retrying.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response || !error.config) {
      throw error;
    }

    const { status } = error.response;
    const originalRequest = error.config;

    // Do not try to refresh for auth endpoints themselves.
    const url = originalRequest.url || "";
    const isAuthEndpoint =
      url.includes("/api/login") ||
      url.includes("/api/institute/register") ||
      url.includes("/api/token/refresh");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = window.localStorage.getItem("refresh_token");

      if (!refreshToken) {
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("refresh_token");
        window.localStorage.removeItem("current_user");
        window.location.href = "/login";
        throw error;
      }

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/token/refresh/`,
          { refresh: refreshToken }
        );
        const newAccessToken = refreshResponse.data.access;
        window.localStorage.setItem("access_token", newAccessToken);

        // Update the auth header and retry the original request.
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed; clear tokens and redirect to login.
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("refresh_token");
        window.localStorage.removeItem("current_user");
        window.location.href = "/login";
        throw refreshError;
      }
    }

    throw error;
  }
);


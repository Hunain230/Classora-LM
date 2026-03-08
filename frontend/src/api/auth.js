import { apiClient } from "./client";

export async function loginRequest(email, password) {
  const response = await apiClient.post("/api/login", { email, password });
  return response.data; // { access, refresh, user: {...} }
}

export async function fetchMe() {
  const response = await apiClient.get("/api/me");
  return response.data;
}

export async function registerInstitute(data) {
  const response = await apiClient.post("/api/institute/register", data);
  return response.data;
}

export function logout() {
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("current_user");
}


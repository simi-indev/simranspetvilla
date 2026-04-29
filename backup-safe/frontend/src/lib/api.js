import axios from "axios";

const BACKEND_URL = "https://petvilla-api-x833.onrender.com";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export function setAdminToken(token) {
  // sessionStorage is cleared on tab close — narrower attack surface than localStorage.
  // For full XSS protection (httpOnly cookies) see PRD backlog: production hardening.
  if (token) {
    sessionStorage.setItem("pv_admin_token", token);
  } else {
    sessionStorage.removeItem("pv_admin_token");
  }
}

export function getAdminToken() {
  return sessionStorage.getItem("pv_admin_token");
}

export function adminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
// Add interceptor to handle token expiry (401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect if unauthorized
      sessionStorage.removeItem("pv_admin_token");
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Constants - real values, used as fallback. Live values come from useBusinessInfo hook.
export const WHATSAPP_NUMBER = "919988975056";
export const WHATSAPP_LINK = (msg = "Hi! I'd like to know more about Simran's PetVilla services.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

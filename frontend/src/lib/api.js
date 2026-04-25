import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem("pv_admin_token", token);
  } else {
    localStorage.removeItem("pv_admin_token");
  }
}

export function getAdminToken() {
  return localStorage.getItem("pv_admin_token");
}

export function adminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Constants
export const WHATSAPP_NUMBER = "919876543210"; // placeholder Pune number
export const WHATSAPP_LINK = (msg = "Hi! I'd like to know more about Simran's PetVilla services.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

"use client";

import axios from "axios";

export const ADMIN_TOKEN_KEY = "workcred_token";
export const ADMIN_USER_KEY = "workcred_user";

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 15000
});

adminApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : "";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_USER_KEY);
      window.localStorage.removeItem("workcred_demo_role");
    }

    return Promise.reject(error);
  }
);

export function getStoredAdminUser() {
  if (typeof window === "undefined") return null;

  try {
    const user = JSON.parse(window.localStorage.getItem(ADMIN_USER_KEY) || "null");
    const role = user?.role || user?.userType;
    return role === "admin" ? user : null;
  } catch (error) {
    return null;
  }
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_USER_KEY);
  window.localStorage.removeItem("workcred_demo_role");
}

export default adminApi;

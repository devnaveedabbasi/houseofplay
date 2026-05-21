import axios from "axios";
import hanldeError from "./hanldeError";
import { toast } from "react-hot-toast";
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

/**
 * Request interceptor
 * - Automatically includes JWT token from localStorage if available
 * - Handles FormData content type
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Try multiple token key possibilities for backward compatibility
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * FormData interceptor
 * Automatically set Content-Type for multipart/form-data
 */
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]; // Let the browser set it
  }
  return config;
});

/**
 * Response interceptor
 * - Handles 401 errors (unauthorized)
 * - Dispatches logout event on auth failure
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Dispatch custom event for logout
      window.dispatchEvent(
        new CustomEvent("unauthorized", {
          detail: { message: "Session expired. Please login again.", redirect: "/auth/login" },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

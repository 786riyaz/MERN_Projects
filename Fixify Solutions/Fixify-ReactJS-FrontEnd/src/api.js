// src/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
});

// Inject Authorization Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  // ===============================
  // AUTH
  // ===============================
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
  verifyOtp: (payload) => api.post("/auth/verify-otp", payload),
  resetPassword: (payload) => api.post("/auth/reset-password", payload),

  // ===============================
  // USERS
  // ===============================
  getProfile: () => api.get("/users/me"),
  updateProfile: (payload) => api.put("/users/me", payload),
  changePassword: (payload) => api.post("/users/change-password", payload),
  getAllUsers: () => api.get("/users/all"),

  // ===============================
  // SERVICES
  // ===============================
  getServices: () => api.get("/services/services"),
  createService: (payload) => api.post("/services/service", payload),
  updateService: (id, payload) => api.put(`/services/service/${id}`, payload),
  deleteService: (id) => api.delete(`/services/service/${id}`),

  // ===============================
  // BOOKINGS (Corrected)
  // ===============================

  // GET ALL with pagination + filters
  getBookings: (params = {}) => api.get("/bookings", { params }),

  // Create
  createBooking: (payload) => api.post("/bookings", payload),

  // Get by ID
  getBookingById: (id) => api.get(`/bookings/${id}`),

  // Update booking
  updateBooking: (id, payload) => api.put(`/bookings/${id}`, payload),

  // Cancel booking (PATCH!)
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),

  // Delete booking
  deleteBooking: (id) => api.delete(`/bookings/${id}`),

  // Assign contractor (PATCH!)
  assignContractor: (id, contractor_id) =>
    api.patch(`/bookings/${id}/assign`, { contractor_id }),

  // Reject (PATCH!)
  rejectBooking: (id, user_id) =>
    api.patch(`/bookings/${id}/reject`, { user_id }),

  // Customer specific
  getBookingsByCustomer: (customerId, params = {}) =>
    api.get(`/bookings/customer/${customerId}`, { params }),

  // Contractor specific
  getBookingsByContractor: (contractorId, params = {}) =>
    api.get(`/bookings/contractor/${contractorId}`, { params }),

  // Contractor rejected bookings
  getRejectedBookingsByContractor: (contractorId, params = {}) =>
    api.get(`/bookings/contractor/${contractorId}/rejected`, { params }),

  // Logs (Optional)
  getLogsList: () => api.get("/logs/backend-logs"),
  getLogContent: (filename) =>
    api.get(`/logs/backend-logs/${encodeURIComponent(filename)}`),
};

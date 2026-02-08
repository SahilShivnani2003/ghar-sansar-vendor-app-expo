import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const vendorAPI = {
  getVendor: (vendorId: string) => api.get(`/vendors/${vendorId}`),
  updateVendor: (vendorId: string, data: any) => api.put(`/vendors/${vendorId}`, data),
};

export const serviceAPI = {
  createService: (data: any, vendorId: string) => api.post(`/services?vendor_id=${vendorId}`, data),
  getServices: (vendorId?: string) => api.get(`/services${vendorId ? `?vendor_id=${vendorId}` : ''}`),
  getService: (serviceId: string) => api.get(`/services/${serviceId}`),
  updateService: (serviceId: string, data: any, vendorId: string) => api.put(`/services/${serviceId}?vendor_id=${vendorId}`, data),
  deleteService: (serviceId: string, vendorId: string) => api.delete(`/services/${serviceId}?vendor_id=${vendorId}`),
};

export const categoryAPI = {
  getCategories: (vendorId?: string) => api.get(`/categories${vendorId ? `?vendor_id=${vendorId}` : ''}`),
  createCategory: (data: any) => api.post('/categories', data),
  purchaseCategory: (categoryId: string, vendorId: string) => api.post(`/categories/${categoryId}/purchase?vendor_id=${vendorId}`),
};

export const inquiryAPI = {
  createInquiry: (data: any) => api.post('/inquiries', data),
  getInquiries: (vendorId: string) => api.get(`/inquiries?vendor_id=${vendorId}`),
  updateInquiry: (inquiryId: string, data: any, vendorId: string) => api.put(`/inquiries/${inquiryId}?vendor_id=${vendorId}`, data),
};

export const bookingAPI = {
  createBooking: (data: any) => api.post('/bookings', data),
  getBookings: (vendorId: string) => api.get(`/bookings?vendor_id=${vendorId}`),
  updateBooking: (bookingId: string, data: any, vendorId: string) => api.put(`/bookings/${bookingId}?vendor_id=${vendorId}`, data),
};

export const taskAPI = {
  createTask: (data: any, vendorId: string) => api.post(`/tasks?vendor_id=${vendorId}`, data),
  getTasks: (vendorId: string) => api.get(`/tasks?vendor_id=${vendorId}`),
  updateTask: (taskId: string, data: any, vendorId: string) => api.put(`/tasks/${taskId}?vendor_id=${vendorId}`, data),
  deleteTask: (taskId: string, vendorId: string) => api.delete(`/tasks/${taskId}?vendor_id=${vendorId}`),
};

export const logAPI = {
  getLogs: (vendorId: string) => api.get(`/logs?vendor_id=${vendorId}`),
};

export const dashboardAPI = {
  getStats: (vendorId: string) => api.get(`/dashboard/stats?vendor_id=${vendorId}`),
};

export const seedAPI = {
  seedCategories: () => api.post('/seed/categories'),
};

export default api;
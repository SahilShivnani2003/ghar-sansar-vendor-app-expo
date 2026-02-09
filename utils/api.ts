import axios from 'axios';

///const BASE_URL = "https://api.meragharsansaar.com/api/v1"
const BASE_URL = "http://localhost:8000/api/v1"
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getAllUsers: () => api.get('/auth/getAll'),
  getMyProfile: () => api.get('/auth/my-profile'),
  changeUserType: (data: any) => api.post('/auth/change-type', data),
  editUserPermission: (data: any) => api.put('/auth/update', data),
  deleteUser: (userId: string) => api.delete(`/auth/delete/${userId}`),
};

// Vendor APIs
export const vendorAPI = {
  login: (data: any) => api.post('/vendor/login', data),
  register: (data: any) => api.post('/vendor/register', data),
  getAllVendors: () => api.get('/vendor/getAll'),
  getVendor: (vendorId: string) => api.get(`/vendor/get/${vendorId}`),
  updateVendor: (vendorId: string, data: any) => api.put(`/vendor/update/${vendorId}`, data),
  updateVendorProfile: (vendorId: string, data: any) => api.put(`/vendor/update-profile/${vendorId}`, data),
  updateVendorPercentage: (vendorId: string, data: any) => api.put(`/vendor/update-percentage/${vendorId}`, data),
  updateWorkingHours: (vendorId: string, data: any) => api.put(`/vendor/working-hours/${vendorId}`, data),
  requestProfileUpdate: (data: any) => api.post('/vendor/request-update', data),
  deleteVendor: (vendorId: string) => api.delete(`/vendor/delete/${vendorId}`),
  getMyProfile: () => api.get('/vendor/my-profile'),
};

// Property APIs (formerly Service)
export const propertyAPI = {
  createProperty: (data: any) => api.post('/property/create', data),
  getVendorProperties: (vendorId: string) => api.post('/property/get-vendor-property', {vendor:vendorId}),
  getAllProperties: () => api.get('/property/getAll'),
  getProperty: (propertyId: string) => api.get(`/property/get/${propertyId}`),
  updateProperty: (propertyId: string, data: any) => api.put(`/property/update/${propertyId}`, data),
  updatePropertyStatus: (propertyId: string, data: any) => api.put(`/property/update-status/${propertyId}`, data),
  deleteProperty: (propertyId: string) => api.delete(`/property/delete/${propertyId}`),
};

// Category APIs
export const categoryAPI = {
  createCategory: (data: any) => api.post('/category/create', data),
  getAllCategories: () => api.get('/category/getAll'),
  updateCategory: (categoryId: string, data: any) => api.put(`/category/update/${categoryId}`, data),
  deleteCategory: (categoryId: string) => api.delete(`/category/delete/${categoryId}`),
  purchaseCategory: (data: any) => api.post('/category/purchase', data),
  getPurchasedCategories: (vendorId: string) => api.get(`/category/purchased/${vendorId}`),
  getCategoryPurchasers: (categoryId: string) => api.get(`/category/purchasers/${categoryId}`),
  getPendingCategoryPurchases: () => api.get('/category/pending'),
  approveCategoryPurchase: (purchaseId: string) => api.put(`/category/approve/${purchaseId}`),
  rejectCategoryPurchase: (purchaseId: string) => api.put(`/category/reject/${purchaseId}`),
};

// Contact APIs (formerly Inquiry)
export const contactAPI = {
  createContact: (data: any) => api.post('/contact/create', data),
  createGeneralContact: (data: any) => api.post('/contact/general', data),
  getAllContacts: (vendorId:string) => api.get(`/contact/getAll/${vendorId}`),
  getUserInquiry: (userId: string) => api.get(`/contact/user-inquiry/${userId}`),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data: any) => api.post('/booking/create', data),
  getAllBookings: () => api.get('/booking/getAll'),
  getVendorBookings: (vendorId: string) => api.get(`/booking/get/${vendorId}`),
  updateBookingStatus: (bookingId: string, data: any) => api.put(`/booking/update/${bookingId}`, data),
};

// Blog APIs
export const blogAPI = {
  createBlog: (data: any) => api.post('/blog/create', data),
  getAllBlogs: () => api.get('/blog/getAll'),
  getSingleBlog: (blogId: string) => api.get(`/blog/get/${blogId}`),
  deleteBlog: (blogId: string) => api.delete(`/blog/delete/${blogId}`),
  updateBlog: (blogId: string, data: any) => api.put(`/blog/${blogId}`, data),
};

// Dashboard APIs
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/stats'),
  getVendorStats: (vendorId: string) => api.get(`/dashboard/vendor-stats/${vendorId}`),
};

// Customer Support APIs
export const customerSupportAPI = {
  createSupport: (data: any) => api.post('/customer-support/create', data),
  getAllSupport: () => api.get('/customer-support/getAll'),
};

// Job APIs
export const jobAPI = {
  createJob: (data: any) => api.post('/job/create', data),
  getAllJobs: () => api.get('/job/getAll'),
  getJobById: (jobId: string) => api.get(`/job/get/${jobId}`),
};

// Career APIs
export const careerAPI = {
  createCareer: (data: any) => api.post('/career/create', data),
  getAllCareers: () => api.get('/career/getAll'),
};

// Rating APIs
export const ratingAPI = {
  addRating: (data: any) => api.post('/rating/create', data),
  getAllRatings: () => api.get('/rating/getAll'),
};

// Audit APIs
export const auditAPI = {
  addAudit: (data: any) => api.post('/audit/create', data),
  getAllAudits: () => api.get('/audit/getAll'),
};

// Image Upload API
export const imageAPI = {
  uploadMultiple: (formData: FormData) => api.post('/image/multi', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
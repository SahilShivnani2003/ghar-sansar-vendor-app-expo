export interface Vendor {
  id: string;
  email: string;
  name: string;
  phone: string;
  businessName?: string;
  businessDescription?: string;
  profileImage?: string;
  createdAt: string;
  category?:string;
}

export interface Service {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  duration: string;
  location: string;
  availability: string;
  terms: string;
  createdAt: string;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  isPurchased: boolean;
  vendorId?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  vendorId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  vendorId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Task {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
}

export interface Log {
  id: string;
  vendorId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  totalServices: number;
  newInquiries: number;
  totalBookings: number;
  totalEarnings: number;
}
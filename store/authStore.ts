import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vendor } from '../types';

interface AuthState {
  vendor: Vendor | null;
  isAuthenticated: boolean;
  setVendor: (vendor: Vendor | null) => void;
  logout: () => void;
  loadVendor: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  vendor: null,
  isAuthenticated: false,
  setVendor: async (vendor) => {
    if (vendor) {
      await AsyncStorage.setItem('vendor', JSON.stringify(vendor));
      set({ vendor, isAuthenticated: true });
    } else {
      await AsyncStorage.removeItem('vendor');
      set({ vendor: null, isAuthenticated: false });
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem('vendor');
    set({ vendor: null, isAuthenticated: false });
  },
  loadVendor: async () => {
    const vendorData = await AsyncStorage.getItem('vendor');
    if (vendorData) {
      const vendor = JSON.parse(vendorData);
      set({ vendor, isAuthenticated: true });
    }
  },
}));
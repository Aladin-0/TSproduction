// src/stores/serviceStore.ts - Fixed with is_free_for_user support
import { create } from 'zustand';
import apiClient from '../api';

interface ServiceIssue {
  id: number;
  description: string;
  price: string;
}

interface ServiceCategory {
  id: number;
  name: string;
  issues: ServiceIssue[];
  is_free_for_user?: boolean; // Add this field
}

interface ServiceState {
  categories: ServiceCategory[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching service categories...');
      
      // Use apiClient instead of direct axios to include auth headers
      const response = await apiClient.get('/services/api/categories/', {
        timeout: 5000
      });
      
      console.log('Service categories response:', response.data);
      
      // Validate response data
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected array');
      }
      
      set({ 
        categories: response.data,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Failed to fetch service categories:", error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to load service categories';
      set({ 
        categories: [], 
        loading: false,
        error: errorMessage
      });
    }
  },
}));
// src/stores/serviceStore.ts
import { create } from 'zustand';
import axios from 'axios';

interface ServiceIssue {
  id: number;
  description: string;
  price: string;
}

interface ServiceCategory {
  id: number;
  name: string;
  issues: ServiceIssue[];
}

interface ServiceState {
  categories: ServiceCategory[];
  fetchCategories: () => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set) => ({
  categories: [],
  fetchCategories: async () => {
    try {
      console.log('Fetching service categories...');
      // Use direct axios for public endpoints
      const response = await axios.get('http://127.0.0.1:8000/services/api/categories/', {
        timeout: 5000
      });
      console.log('Service categories response:', response.data);
      set({ categories: response.data });
    } catch (error) {
      console.error("Failed to fetch service categories:", error);
      // Set empty array on error
      set({ categories: [] });
    }
  },
}));
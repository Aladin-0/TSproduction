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
      const response = await axios.get('http://127.0.0.1:8000/services/api/categories/');
      set({ categories: response.data });
    } catch (error) {
      console.error("Failed to fetch service categories:", error);
    }
  },
}));
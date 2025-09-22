// src/stores/productStore.ts

import { create } from 'zustand';
import axios from 'axios';

// Define the shape of a single product
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

// Define the shape of our store's state
interface ProductState {
  products: Product[];
  fetchProducts: () => Promise<void>;
}

// Create the store
export const useProductStore = create<ProductState>((set) => ({
  products: [],
  fetchProducts: async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products/');
      set({ products: response.data });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  },
}));
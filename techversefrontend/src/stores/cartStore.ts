// src/stores/cartStore.ts - Fixed to avoid circular dependency
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  category: {
    name: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  currentUserId: string | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setCurrentUser: (userId: string | null) => void;
  switchUser: (userId: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currentUserId: null,

      setCurrentUser: (userId) => {
        const state = get();
        
        // If switching to a different user, clear current cart and load user's cart
        if (state.currentUserId !== userId) {
          console.log('Switching cart user from', state.currentUserId, 'to', userId);
          
          // Get the stored cart data for this user
          const storedData = localStorage.getItem('cart-storage');
          let userCarts = {};
          
          if (storedData) {
            try {
              const parsed = JSON.parse(storedData);
              userCarts = parsed.userCarts || {};
            } catch (error) {
              console.error('Error parsing stored cart data:', error);
            }
          }
          
          // Load this user's cart items
          const userCart = userId ? userCarts[userId] || [] : [];
          
          set({
            currentUserId: userId,
            items: userCart,
            isOpen: false // Close cart when switching users
          });
        }
      },

      switchUser: (userId) => {
        get().setCurrentUser(userId);
      },

      addToCart: (product, quantity = 1) => {
        const state = get();
        const items = state.items;
        const existingItem = items.find(item => item.product.id === product.id);

        let newItems;
        if (existingItem) {
          newItems = items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...items, { product, quantity }];
        }

        set({
          items: newItems,
          isOpen: true
        });
      },

      removeFromCart: (productId) => {
        set({
          items: get().items.filter(item => item.product.id !== productId)
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + (parseFloat(item.product.price) * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => {
        // Store cart data per user
        const storedData = localStorage.getItem('cart-storage');
        let userCarts = {};
        
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            userCarts = parsed.userCarts || {};
          } catch (error) {
            console.error('Error parsing stored cart data:', error);
          }
        }
        
        // Update the current user's cart
        if (state.currentUserId) {
          userCarts[state.currentUserId] = state.items;
        }
        
        return {
          userCarts,
          currentUserId: state.currentUserId
        };
      },
      onRehydrateStorage: () => (state) => {
        // When rehydrating, we need to restore the correct user's cart
        console.log('Rehydrating cart storage');
        if (state) {
          // The items will be set when setCurrentUser is called
          state.items = [];
        }
      }
    }
  )
);
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

interface CartStore {
  storeId: string | null;
  items: CartItem[];
  initStore: (storeId: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      storeId: null,
      items: [],

      initStore: (storeId: string) => {
        const currentStoreId = get().storeId;
        if (currentStoreId && currentStoreId !== storeId) {
          // Si el cliente cambia de tienda, limpiamos el carrito para no mezclar productos
          set({ storeId, items: [] });
        } else {
          set({ storeId });
        }
      },

      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex((i) => i.id === item.id);

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'feria-digital-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

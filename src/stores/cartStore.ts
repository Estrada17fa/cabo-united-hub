import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StoreProduct } from "@/lib/store-types";

export interface CartItem {
  /** handle + talla */
  key: string;
  handle: string;
  title: string;
  image: string | null;
  size: string;
  price: number;
  currency: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: StoreProduct, size: string, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setOpen: (isOpen) => set({ isOpen }),

      addItem: (product, size, quantity = 1) => {
        const key = `${product.handle}::${size}`;
        const items = [...get().items];
        const existing = items.findIndex((i) => i.key === key);
        if (existing >= 0) {
          items[existing] = {
            ...items[existing],
            quantity: items[existing].quantity + quantity,
          };
        } else {
          items.push({
            key,
            handle: product.handle,
            title: product.title,
            image: product.images[0] ?? null,
            size,
            price: product.price,
            currency: product.currency,
            quantity,
          });
        }
        set({ items });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: "lcu-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }) as any,
    },
  ),
);

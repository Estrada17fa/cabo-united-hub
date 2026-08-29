import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import type { StoreProduct } from "@/lib/store-types";
import {
  addLineToShopifyCart,
  createShopifyCart,
  getShopifyCart,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
} from "@/lib/shopify-storefront";

export interface CartItem {
  /** handle + talla */
  key: string;
  handle: string;
  title: string;
  image: string | null;
  size: string;
  variantId: string;
  price: number;
  currency: string;
  quantity: number;
  lineId: string | null;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: StoreProduct, size: string, quantity?: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

function findVariantId(product: StoreProduct, size: string): string | null {
  const variant = product.variants.find((v) => v.title === size);
  return variant?.id || null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      setOpen: (isOpen) => set({ isOpen }),

      addItem: async (product, size, quantity = 1) => {
        const variantId = findVariantId(product, size);
        if (!variantId) {
          toast.error("No encontramos esa variante");
          return;
        }

        const key = `${product.handle}::${size}`;
        const { items, cartId, checkoutUrl } = get();
        const existing = items.find((i) => i.key === key);

        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ variantId, quantity });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [
                  {
                    key,
                    handle: product.handle,
                    title: product.title,
                    image: product.images[0] ?? null,
                    size,
                    variantId,
                    price: product.price,
                    currency: product.currency,
                    quantity,
                    lineId: result.lineId,
                  },
                ],
                isOpen: true,
              });
            }
          } else if (existing) {
            if (!existing.lineId) {
              console.error("Cannot update quantity for item without lineId:", existing);
              return;
            }
            const newQuantity = existing.quantity + quantity;
            const result = await updateShopifyCartLine(cartId, existing.lineId, newQuantity);
            if (result.success) {
              set({
                items: get().items.map((i) =>
                  i.key === key ? { ...i, quantity: newQuantity } : i
                ),
                isOpen: true,
              });
            } else if (result.cartNotFound) {
              get().clearCart();
            }
          } else {
            const result = await addLineToShopifyCart(cartId, { variantId, quantity });
            if (result.success) {
              set({
                items: [
                  ...get().items,
                  {
                    key,
                    handle: product.handle,
                    title: product.title,
                    image: product.images[0] ?? null,
                    size,
                    variantId,
                    price: product.price,
                    currency: product.currency,
                    quantity,
                    lineId: result.lineId ?? null,
                  },
                ],
                isOpen: true,
              });
            } else if (result.cartNotFound) {
              get().clearCart();
            }
          }
        } catch (error) {
          console.error("Failed to add item:", error);
          toast.error("No se pudo agregar al carrito", {
            description: "Intenta de nuevo en un momento.",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (key, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(key);
          return;
        }

        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.key === key);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            set({
              items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
            });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (key) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.key === key);
        if (!item?.lineId || !cartId) {
          set({ items: items.filter((i) => i.key !== key) });
          return;
        }

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter((i) => i.key !== key);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const cart = await getShopifyCart(cartId);
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "lcu-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }) as any,
    }
  )
);

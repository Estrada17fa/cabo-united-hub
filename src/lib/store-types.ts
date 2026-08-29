/**
 * Modelo de producto propio de la tienda LCU.
 * Hoy se alimenta de datos de ejemplo; cuando conectemos el catálogo real
 * solo cambia el interior de `useProducts`, no las pantallas.
 */

export type StoreCategoryId = "jerseys" | "playeras" | "hoodies" | "accesorios";

export interface StoreCategory {
  id: StoreCategoryId;
  label: string;
}

export const STORE_CATEGORIES: StoreCategory[] = [
  { id: "jerseys", label: "Jerseys" },
  { id: "playeras", label: "Playeras" },
  { id: "hoodies", label: "Hoodies" },
  { id: "accesorios", label: "Accesorios" },
];

export interface StoreProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: StoreCategoryId;
  /** Etiqueta corta arriba del nombre (p. ej. "Temporada 25/26") */
  eyebrow?: string;
  price: number;
  /** Precio anterior; si existe y es mayor, la pieza está en oferta */
  compareAtPrice?: number | null;
  currency: string;
  images: string[];
  sizes: string[];
  soldOut?: boolean;
  tags: string[];
  /** Para el orden "Más nuevo" */
  createdAt: string;
}

export function formatMoney(amount: number, currency = "MXN") {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

export function isOnSale(p: StoreProduct) {
  return !!p.compareAtPrice && p.compareAtPrice > p.price;
}

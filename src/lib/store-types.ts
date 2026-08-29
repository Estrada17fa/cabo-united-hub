/**
 * Modelo de producto propio de la tienda LCU.
 * El catálogo viene de Shopify; estos tipos son la capa de presentación
 * que usan las pantallas de la tienda.
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

export interface StoreVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  availableForSale: boolean;
}

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
  /** Variantes reales de Shopify, necesarias para el checkout */
  variants: StoreVariant[];
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

/** Mapea un producto de Shopify a una categoría de la tienda LCU. */
export function mapShopifyCategory(productType: string, tags: string[], title: string): StoreCategoryId {
  const normalized = `${productType} ${tags.join(" ")} ${title}`.toLowerCase();

  if (normalized.includes("jersey")) return "jerseys";
  if (normalized.includes("hoodie") || normalized.includes("sudadera")) return "hoodies";
  if (normalized.includes("playera") || normalized.includes("camiseta") || normalized.includes("player")) {
    if (normalized.includes("jersey")) return "jerseys";
    return "playeras";
  }
  if (
    normalized.includes("gorra") ||
    normalized.includes("bufanda") ||
    normalized.includes("accesorio") ||
    normalized.includes("hat") ||
    normalized.includes("scarf")
  ) {
    return "accesorios";
  }

  return "accesorios";
}

export function mapShopifySize(variantTitle: string): string {
  const map: Record<string, string> = {
    chica: "CH",
    mediana: "M",
    grande: "G",
    "extra grande": "XG",
    "default title": "Única",
  };
  const lower = variantTitle.trim().toLowerCase();
  return map[lower] || variantTitle.trim();
}

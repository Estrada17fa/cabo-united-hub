import { useQuery } from "@tanstack/react-query";
import { MOCK_PRODUCTS } from "@/data/store-products-mock";
import type { StoreProduct } from "@/lib/store-types";

/**
 * Punto ÚNICO de entrada del catálogo.
 * Hoy devuelve datos de ejemplo. Cuando conectemos el catálogo real,
 * solo se cambia el cuerpo de estas dos funciones.
 */
async function fetchProducts(): Promise<StoreProduct[]> {
  return MOCK_PRODUCTS;
}

export function useProducts() {
  return useQuery({
    queryKey: ["store", "products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(handle: string | undefined) {
  return useQuery({
    queryKey: ["store", "product", handle],
    enabled: !!handle,
    queryFn: async (): Promise<StoreProduct | null> => {
      const list = await fetchProducts();
      return list.find((p) => p.handle === handle) ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

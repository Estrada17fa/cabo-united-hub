import { useQuery } from "@tanstack/react-query";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  storefrontApiRequest,
  type ShopifyProduct,
  type ShopifyProductNode,
} from "@/lib/shopify";

export function useShopifyProducts(opts?: { first?: number; query?: string }) {
  const first = opts?.first ?? 50;
  const query = opts?.query;
  return useQuery({
    queryKey: ["shopify", "products", first, query ?? null],
    queryFn: async (): Promise<ShopifyProduct[]> => {
      const data = await storefrontApiRequest<any>(PRODUCTS_QUERY, { first, query });
      return (data?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useShopifyProduct(handle: string | undefined) {
  return useQuery({
    queryKey: ["shopify", "product", handle],
    enabled: !!handle,
    queryFn: async (): Promise<ShopifyProductNode | null> => {
      const data = await storefrontApiRequest<any>(PRODUCT_BY_HANDLE_QUERY, { handle });
      return (data?.data?.product as ShopifyProductNode | null) ?? null;
    },
    staleTime: 1000 * 60 * 2,
  });
}
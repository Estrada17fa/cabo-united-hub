import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchShopifyProductByHandle,
  fetchShopifyProducts,
  type ShopifyProduct,
} from "@/lib/shopify-storefront";
import { mapShopifyCategory, mapShopifySize, type StoreProduct } from "@/lib/store-types";

function normalizeProduct(node: ShopifyProduct["node"]): StoreProduct {
  const variants = node.variants.edges.map(({ node: v }) => ({
    id: v.id,
    title: mapShopifySize(v.title),
    price: Number(v.price.amount),
    compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
    availableForSale: v.availableForSale,
  }));

  const availableVariants = variants.filter((v) => v.availableForSale);
  const minPrice = Math.min(...variants.map((v) => v.price));
  const compareAtPrice = variants[0]?.compareAtPrice ?? null;

  const images = node.images.edges.map(({ node }) => node.url);
  const sizes = variants.map((v) => v.title);

  const category = mapShopifyCategory(node.productType, node.tags, node.title);

  const eyebrow =
    node.tags.find((t) => ["Local", "Visita", "Portero", "Tercero"].includes(t)) ||
    node.productType ||
    undefined;

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    category,
    eyebrow,
    price: minPrice,
    compareAtPrice: compareAtPrice && compareAtPrice > minPrice ? compareAtPrice : null,
    currency: node.priceRange.minVariantPrice.currencyCode,
    images,
    sizes,
    variants,
    soldOut: availableVariants.length === 0,
    tags: node.tags,
    createdAt: node.createdAt,
  };
}

async function fetchProducts(): Promise<StoreProduct[]> {
  const edges = await fetchShopifyProducts();
  return edges.map((edge) => normalizeProduct(edge.node));
}

export function useProducts() {
  return useQuery({
    queryKey: ["store", "products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(handle: string | undefined) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["store", "product", handle],
    enabled: !!handle,
    queryFn: async (): Promise<StoreProduct | null> => {
      if (!handle) return null;
      const node = await fetchShopifyProductByHandle(handle);
      return node ? normalizeProduct(node) : null;
    },
    staleTime: 1000 * 60 * 5,
    // Si el catálogo ya está en caché, mostramos ese producto de inmediato
    // mientras llega el detalle completo (sin pantalla vacía).
    placeholderData: () => {
      if (!handle) return undefined;
      const list = qc.getQueryData<StoreProduct[]>(["store", "products"]);
      return list?.find((p) => p.handle === handle);
    },
  });
}

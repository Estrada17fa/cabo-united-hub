import { toast } from "sonner";

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_DOMAIN =
  import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "los-cabos-united.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN =
  import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "";

export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType: string;
    tags: string[];
    createdAt: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          compareAtPrice?: {
            amount: string;
            currencyCode: string;
          } | null;
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export async function storefrontApiRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T | undefined> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: se requiere un plan de pago", {
      description:
        "Tu tienda necesita un plan de Shopify activo para vender. Ve a admin.shopify.com para activarlo.",
    });
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`Shopify HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as T;
  const errors = (data as { errors?: Array<{ message: string }> }).errors;
  if (errors?.length) {
    throw new Error(`Shopify error: ${errors.map((e) => e.message).join(", ")}`);
  }
  return data;
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          productType
          tags
          createdAt
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProducts(
  searchQuery?: string
): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest<{ data: { products: { edges: ShopifyProduct[] } } }>(
    PRODUCTS_QUERY,
    { first: 100, query: searchQuery || undefined }
  );
  return data?.data?.products?.edges || [];
}

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      productType
      tags
      createdAt
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

export async function fetchShopifyProductByHandle(
  handle: string
): Promise<ShopifyProduct["node"] | null> {
  const data = await storefrontApiRequest<{ data: { product: ShopifyProduct["node"] | null } }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );
  return data?.data?.product || null;
}

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              merchandise {
                ... on ProductVariant { id }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              merchandise {
                ... on ProductVariant { id }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(
  userErrors: Array<{ field: string[] | null; message: string }>
): boolean {
  return userErrors.some(
    (e) =>
      e.message.toLowerCase().includes("cart not found") ||
      e.message.toLowerCase().includes("does not exist")
  );
}

export interface ShopifyCartLineInput {
  variantId: string;
  quantity: number;
}

export interface ShopifyCartCreateResult {
  cartId: string;
  checkoutUrl: string;
  lineId: string;
}

export async function createShopifyCart(
  item: ShopifyCartLineInput
): Promise<ShopifyCartCreateResult | null> {
  const data = await storefrontApiRequest<{
    data: {
      cartCreate: {
        cart: {
          id: string;
          checkoutUrl: string;
          lines: {
            edges: Array<{
              node: { id: string; merchandise: { id: string } };
            }>;
          };
        };
        userErrors: Array<{ field: string[] | null; message: string }>;
      };
    };
  }>(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error("Cart creation failed:", data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return {
    cartId: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
    lineId,
  };
}

export async function addLineToShopifyCart(
  cartId: string,
  item: ShopifyCartLineInput
): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    data: {
      cartLinesAdd: {
        cart: {
          lines: {
            edges: Array<{
              node: { id: string; merchandise: { id: string } };
            }>;
          };
        };
        userErrors: Array<{ field: string[] | null; message: string }>;
      };
    };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Add line failed:", userErrors);
    return { success: false };
  }

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    data: {
      cartLinesUpdate: {
        cart: { id: string };
        userErrors: Array<{ field: string[] | null; message: string }>;
      };
    };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Update line failed:", userErrors);
    return { success: false };
  }
  return { success: true };
}

export async function removeLineFromShopifyCart(
  cartId: string,
  lineId: string
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    data: {
      cartLinesRemove: {
        cart: { id: string };
        userErrors: Array<{ field: string[] | null; message: string }>;
      };
    };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Remove line failed:", userErrors);
    return { success: false };
  }
  return { success: true };
}

export async function getShopifyCart(cartId: string): Promise<{ totalQuantity: number } | null> {
  const data = await storefrontApiRequest<{ data: { cart: { totalQuantity: number } } }>(
    CART_QUERY,
    { id: cartId }
  );
  return data?.data?.cart || null;
}

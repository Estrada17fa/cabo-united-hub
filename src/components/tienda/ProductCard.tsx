import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

interface Props {
  product: ShopifyProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const node = product.node;
  const img = node.images.edges[0]?.node;
  const imgHover = node.images.edges[1]?.node ?? img;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants.edges[0]?.node;
  const soldOut = !node.variants.edges.some((v) => v.node.availableForSale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/tienda/producto/${node.handle}`}
        className="group block"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-card border border-border">
          {img && (
            <>
              <img
                src={img.url}
                alt={img.altText ?? node.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-0"
              />
              {imgHover && (
                <img
                  src={imgHover.url}
                  alt={imgHover.altText ?? node.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-[1.04]"
                />
              )}
            </>
          )}
          {soldOut && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border">
              Agotado
            </div>
          )}
          {firstVariant?.availableForSale && !soldOut && (
            <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
              <span className="px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-semibold uppercase tracking-wider">
                Ver
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-foreground truncate">
              {node.title}
            </h3>
            {node.productType && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{node.productType}</p>
            )}
          </div>
          <p className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
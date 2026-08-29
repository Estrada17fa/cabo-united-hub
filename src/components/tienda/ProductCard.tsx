import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatMoney, isOnSale, type StoreProduct } from "@/lib/store-types";

interface Props {
  product: StoreProduct;
  index?: number;
}

/** Tarjeta de producto: la foto manda, el chrome se hace a un lado. */
export function ProductCard({ product, index = 0 }: Props) {
  const img = product.images[0];
  const imgHover = product.images[1] ?? img;
  const sale = isOnSale(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.2) }}
    >
      <Link
        to={`/tienda/producto/${product.handle}`}
        className="group block overflow-hidden rounded-2xl border border-hairline bg-surface-1 transition-colors hover:border-white/20"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
          {img && (
            <>
              <img
                src={img}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
              />
              <img
                src={imgHover}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            </>
          )}

          {(product.soldOut || sale) && (
            <span
              className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                product.soldOut
                  ? "border border-hairline bg-black/70 text-muted-foreground backdrop-blur-sm"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {product.soldOut ? "Agotado" : "Oferta"}
            </span>
          )}
        </div>

        <div className="p-3">
          {product.eyebrow && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {product.eyebrow}
            </p>
          )}
          <h3 className="mb-1.5 line-clamp-2 text-[13px] font-bold leading-tight text-foreground">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-[15px] font-bold tabular-nums ${
                product.soldOut ? "text-muted-foreground" : sale ? "text-primary" : "text-foreground"
              }`}
            >
              {formatMoney(product.price, product.currency)}
            </span>
            {sale && (
              <span className="font-display text-[12px] tabular-nums text-muted-foreground line-through">
                {formatMoney(product.compareAtPrice!, product.currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

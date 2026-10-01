import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatMoney, isOnSale, normalizeStoreKey, type StoreProduct } from "@/lib/store-types";

interface Props {
  product: StoreProduct;
  index?: number;
}

/** Una sola etiqueta, por prioridad: Preventa > Nuevo. Ambas por tag estado:*. */
function productBadge(p: StoreProduct): string | null {
  const tag = (needle: string) =>
    p.tags.some((t) => normalizeStoreKey(t).replace(/\s/g, "") === needle);
  if (tag("estado:preventa")) return "Preventa";
  if (tag("estado:nuevo")) return "Nuevo";
  return null;
}

/** Tarjeta de producto: la foto manda, el chrome se hace a un lado. */
export function ProductCard({ product, index = 0 }: Props) {
  const images = product.images.slice(0, 5);
  const img = images[0];
  const hasMore = images.length > 1;
  const sale = isOnSale(product);
  const badge = product.soldOut ? null : productBadge(product);
  const [slide, setSlide] = useState(0);

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
              {/* Escritorio: segunda foto al pasar el mouse */}
              <div className="absolute inset-0 hidden md:block">
                <img
                  src={img}
                  alt={product.title}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hasMore ? "group-hover:opacity-0" : ""}`}
                />
                {hasMore && (
                  <img
                    src={images[1]}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                )}
              </div>
              {/* Móvil: deslizar entre fotos */}
              <div
                className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto scrollbar-hide md:hidden"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setSlide(Math.round(el.scrollLeft / el.clientWidth));
                }}
              >
                {images.map((src, i) => (
                  <img
                    key={src + i}
                    src={src}
                    alt={i === 0 ? product.title : ""}
                    loading="lazy"
                    className="h-full w-full shrink-0 snap-center object-cover"
                  />
                ))}
              </div>
              {hasMore && (
                <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1 md:hidden">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full bg-foreground transition-all ${i === slide ? "w-3 opacity-90" : "w-1 opacity-40"}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {(product.soldOut || sale) && (
            <span
              className={`absolute right-2.5 top-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                product.soldOut
                  ? "border border-hairline bg-black/70 text-muted-foreground backdrop-blur-sm"
                  : "bg-primary text-primary-foreground"
              } ${product.soldOut ? "!left-2.5 !right-auto" : ""}`}
            >
              {product.soldOut ? "Agotado" : "Oferta"}
            </span>
          )}
          {badge && (
            <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-background/70 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
              {badge}
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

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

interface Props {
  product: ShopifyProduct;
  index?: number;
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  "t-shirt": "PLAYERA",
  tshirt: "PLAYERA",
  shirt: "PLAYERA",
  jersey: "JERSEY",
  hoodie: "HOODIE",
  sweatshirt: "SUDADERA",
  embroidery: "BORDADO",
  cap: "GORRA",
  hat: "GORRA",
  accessory: "ACCESORIO",
  accessories: "ACCESORIOS",
};

function translateType(type?: string): string {
  if (!type) return "PIEZA OFICIAL";
  const key = type.toLowerCase().trim();
  return (TYPE_TRANSLATIONS[key] ?? type).toUpperCase();
}

export function EditorialProductCard({ product, index = 0 }: Props) {
  const node = product.node;
  const img = node.images.edges[0]?.node;
  const imgHover = node.images.edges[1]?.node ?? img;
  const price = node.priceRange.minVariantPrice;
  const totalVariants = node.variants.edges.length;
  const availableVariants = node.variants.edges.filter((v) => v.node.availableForSale).length;
  const soldOut = totalVariants > 0 && availableVariants === 0;
  const lowStock = !soldOut && totalVariants > 0 && availableVariants <= 2;

  const tags = (node.tags ?? []).map((t) => t.toLowerCase());
  const isNew = tags.includes("nuevo") || tags.includes("new") || index < 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.25) }}
    >
      <Link
        to={`/tienda/producto/${node.handle}`}
        className="group block rounded-xl overflow-hidden border border-white/[0.06] bg-card transition-all duration-300 hover:border-white/[0.12] hover:-translate-y-1"
      >
        {/* IMAGE — 65% */}
        <div className="relative aspect-square w-full overflow-hidden" style={{ background: "#0f0f0f" }}>
          {img && (
            <>
              <img
                src={img.url}
                alt={img.altText ?? node.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-0"
              />
              {imgHover && (
                <img
                  src={imgHover.url}
                  alt={imgHover.altText ?? node.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-contain p-4 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-[1.04]"
                />
              )}
            </>
          )}

          {/* TOP RIGHT badge */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
            {soldOut && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider">
                Agotado
              </span>
            )}
            {!soldOut && lowStock && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400/90 text-black text-[10px] font-bold uppercase tracking-wider">
                Últimas piezas
              </span>
            )}
            {!soldOut && !lowStock && isNew && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-black"
                style={{ background: "#00abc4" }}
              >
                Nuevo
              </span>
            )}
          </div>
        </div>

        {/* INFO — 35% */}
        <div className="p-3">
          <p
            className="text-[10px] font-semibold uppercase mb-1"
            style={{ letterSpacing: "0.08em", color: "#00abc4" }}
          >
            {translateType(node.productType)}
          </p>
          <h3
            className="text-[13px] font-bold text-foreground line-clamp-2 leading-tight mb-2"
            style={{ letterSpacing: "-0.01em" }}
          >
            {node.title}
          </h3>
          <div className="flex items-center justify-between">
            <p
              className={`text-base font-bold ${soldOut ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {formatPrice(price.amount, price.currencyCode)}
            </p>
            {!soldOut && (
              <span
                className="font-bold"
                style={{
                  background: "#00abc4",
                  color: "#000",
                  fontSize: "10px",
                  borderRadius: "6px",
                  padding: "4px 10px",
                }}
              >
                + Agregar
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

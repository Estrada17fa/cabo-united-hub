import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface Props {
  product: ShopifyProduct;
}

export function FeaturedDrop({ product }: Props) {
  const node = product.node;
  const img = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const sizeOption = node.options.find((o) => /size|talla/i.test(o.name));
  const sizes = sizeOption?.values ?? [];
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);

  const matchingVariant = useMemo(() => {
    if (!sizeOption || !selectedSize) return node.variants.edges[0]?.node;
    return (
      node.variants.edges.find((v) =>
        v.node.selectedOptions.some(
          (o) => o.name.toLowerCase() === sizeOption.name.toLowerCase() && o.value === selectedSize,
        ),
      )?.node ?? node.variants.edges[0]?.node
    );
  }, [node.variants.edges, sizeOption, selectedSize]);

  const onAdd = async () => {
    if (!matchingVariant) return;
    if (!matchingVariant.availableForSale) {
      toast.error("Variante no disponible");
      return;
    }
    await addItem({
      product,
      variantId: matchingVariant.id,
      variantTitle: matchingVariant.title,
      price: matchingVariant.price,
      quantity: 1,
      selectedOptions: matchingVariant.selectedOptions,
    });
    setOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-card"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* IMAGE */}
        <div
          className="relative w-full aspect-square md:aspect-auto md:h-[420px] overflow-hidden"
          style={{ background: "#0a0a0a" }}
        >
          {img && (
            <img
              src={img.url}
              alt={img.altText ?? node.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
          )}
          <div
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-black"
            style={{ background: "#00FF87", boxShadow: "0 4px 14px -4px #00FF8780" }}
          >
            <Flame className="w-3 h-3" />
            Más vendido
          </div>
        </div>

        {/* INFO */}
        <div className="p-6 md:p-8 flex flex-col justify-center gap-5">
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: "#00FF87", letterSpacing: "0.15em" }}
          >
            {(node.productType || "Pieza oficial").toUpperCase()}
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {node.title}
          </h2>
          <p className="text-3xl font-bold text-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </p>

          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const active = s === selectedSize;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] px-3 h-10 rounded-full text-[12px] font-semibold transition-all ${
                      active
                        ? "text-black"
                        : "bg-card border border-white/40 text-foreground hover:border-foreground"
                    }`}
                    style={active ? { background: "#00FF87" } : undefined}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={onAdd}
              disabled={!matchingVariant?.availableForSale}
              className="h-12 rounded-full text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#00FF87", boxShadow: "0 8px 20px -8px #00FF8780" }}
            >
              {matchingVariant?.availableForSale ? "Agregar al carrito" : "Agotado"}
            </button>
            <Link
              to={`/tienda/producto/${node.handle}`}
              className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver detalles →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

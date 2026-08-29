import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { useProduct } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, isOnSale } from "@/lib/store-types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TiendaProducto = () => {
  const { handle } = useParams();
  const { data: product, isLoading } = useProduct(handle);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setSize(product?.sizes.length === 1 ? product.sizes[0] : null);
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="pb-20">
        <ShopHeader />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pb-20">
        <ShopHeader />
        <div className="rounded-2xl border border-dashed border-hairline py-20 text-center">
          <p className="text-sm font-bold text-foreground">No encontramos esta pieza</p>
          <Link to="/tienda" className="mt-3 inline-block text-[12px] font-bold text-primary">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const sale = isOnSale(product);

  const handleAdd = () => {
    if (product.soldOut) return;
    if (!size) {
      toast.error("Elige una talla");
      return;
    }
    addItem(product, size, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
    setCartOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-36 md:pb-20"
    >
      <ShopHeader />

      <Link
        to="/tienda"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Tienda
      </Link>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* GALERÍA */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-2">
            <img
              src={product.images[activeImage] ?? product.images[0]}
              alt={product.title}
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-14 overflow-hidden rounded-xl border transition-colors ${
                    i === activeImage ? "border-primary" : "border-hairline"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          {product.eyebrow && (
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {product.eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            {product.title}
          </h1>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span
              className={`font-display text-xl font-bold tabular-nums ${
                sale ? "text-primary" : "text-foreground"
              }`}
            >
              {formatMoney(product.price, product.currency)}
            </span>
            {sale && (
              <span className="font-display text-sm tabular-nums text-muted-foreground line-through">
                {formatMoney(product.compareAtPrice!, product.currency)}
              </span>
            )}
            {product.soldOut && (
              <span className="rounded-md border border-hairline px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Agotado
              </span>
            )}
          </div>

          {/* TALLAS */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Talla
              </span>
              {!size && !product.soldOut && (
                <span className="text-[11px] text-muted-foreground">Elige una talla</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const active = s === size;
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    disabled={product.soldOut}
                    className={`min-w-[52px] rounded-xl border px-3 py-2 text-[12px] font-bold transition-colors disabled:opacity-40 ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-hairline bg-surface-1 text-foreground hover:border-white/25"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CANTIDAD */}
          <div className="mt-5">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cantidad
            </span>
            <div className="inline-flex items-center gap-1 rounded-xl border border-hairline bg-surface-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-9 w-9 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Disminuir"
              >
                −
              </button>
              <span className="w-8 text-center font-display text-[13px] font-bold tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="h-9 w-9 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA desktop */}
          <button
            onClick={handleAdd}
            disabled={product.soldOut}
            className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 md:inline-flex"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Agregado
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                {product.soldOut ? "Agotado" : "Agregar al carrito"}
              </>
            )}
          </button>

          <div className="mt-6">
            <Accordion type="single" collapsible defaultValue="desc">
              <AccordionItem value="desc" className="border-hairline">
                <AccordionTrigger className="text-[12px] font-bold">Descripción</AccordionTrigger>
                <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="envio" className="border-hairline">
                <AccordionTrigger className="text-[12px] font-bold">
                  Envíos y cambios
                </AccordionTrigger>
                <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">
                  Entrega en Los Cabos en 2 a 4 días hábiles y envío al resto del país en 3 a 7
                  días. Cambios de talla dentro de los primeros 15 días con la etiqueta intacta.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* CTA móvil fijo */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface-1/95 p-3 backdrop-blur md:hidden">
        <button
          onClick={handleAdd}
          disabled={product.soldOut}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[13px] font-bold text-primary-foreground disabled:opacity-40"
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" /> Agregado
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {product.soldOut
                ? "Agotado"
                : `Agregar · ${formatMoney(product.price * quantity, product.currency)}`}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default TiendaProducto;

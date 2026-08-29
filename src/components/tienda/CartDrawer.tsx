import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/store-types";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const setOpen = useCartStore((s) => s.setOpen);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const syncCart = useCartStore((s) => s.syncCart);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const currency = items[0]?.currency ?? "MXN";

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) syncCart();
  };

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setOpen(false);
    } else {
      toast.error("No pudimos generar el checkout", {
        description: "Agrega un producto e intenta de nuevo.",
      });
    }
  };

  const busy = isLoading || isSyncing;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-hairline bg-surface-1 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-hairline px-5 py-4 text-left">
          <SheetTitle className="font-display text-base font-bold text-foreground">
            Tu carrito
          </SheetTitle>
          <SheetDescription className="text-[11px] text-muted-foreground">
            {totalItems === 0
              ? "Todavía no agregas nada"
              : `${totalItems} ${totalItems === 1 ? "pieza" : "piezas"}`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-hairline bg-surface-2">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">Carrito vacío</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Arma tu look del Cabos United en la tienda oficial.
            </p>
            <Link
              to="/tienda"
              onClick={() => setOpen(false)}
              className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-primary-foreground"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.key}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-hairline bg-surface-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/tienda/producto/${item.handle}`}
                            onClick={() => setOpen(false)}
                            className="line-clamp-2 text-[13px] font-bold text-foreground transition-colors hover:text-primary"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => removeItem(item.key)}
                            aria-label="Quitar"
                            className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Talla {item.size}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 rounded-xl border border-hairline bg-surface-2">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              aria-label="Disminuir"
                              disabled={busy}
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-display text-[12px] font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              aria-label="Aumentar"
                              disabled={busy}
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="font-display text-[13px] font-bold tabular-nums text-foreground">
                            {formatMoney(item.price * item.quantity, item.currency)}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <div className="space-y-3 border-t border-hairline p-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg font-bold tabular-nums text-foreground">
                  {formatMoney(subtotal, currency)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Envío e impuestos se calculan al pagar.
              </p>
              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" /> Pagar con Shopify
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

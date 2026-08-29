import { useEffect } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const {
    items,
    isOpen,
    setOpen,
    isLoading,
    isSyncing,
    updateQuantity,
    removeItem,
    getCheckoutUrl,
    syncCart,
  } = useCartStore();

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce(
    (s, i) => s + parseFloat(i.price.amount) * i.quantity,
    0,
  );
  const currency = items[0]?.price.currencyCode ?? "MXN";

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      setOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col h-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <SheetTitle className="text-xl font-semibold">Tu carrito</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {totalItems === 0
              ? "Tu carrito está vacío"
              : `${totalItems} ${totalItems === 1 ? "artículo" : "artículos"}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-base font-normal text-foreground mb-1">
                Aún no agregas nada
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Explora la tienda oficial y arma tu look del Cabos United.
              </p>
              <Button asChild onClick={() => setOpen(false)}>
                <Link to="/tienda">Ver productos</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="space-y-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const img = item.product.node.images.edges[0]?.node;
                      return (
                        <motion.li
                          key={item.variantId}
                          layout
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 24, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="flex gap-4"
                        >
                          <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                            {img && (
                              <img
                                src={img.url}
                                alt={img.altText ?? item.product.node.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/tienda/producto/${item.product.node.handle}`}
                                onClick={() => setOpen(false)}
                                className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                              >
                                {item.product.node.title}
                              </Link>
                              <button
                                onClick={() => removeItem(item.variantId)}
                                aria-label="Eliminar"
                                className="text-muted-foreground hover:text-destructive transition-colors p-1 -m-1 flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {item.selectedOptions.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.selectedOptions.map((o) => o.value).join(" · ")}
                              </p>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center gap-1 rounded-full border border-border bg-card">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.variantId, item.quantity - 1)
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label="Disminuir"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.variantId, item.quantity + 1)
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label="Aumentar"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-sm font-semibold">
                                {formatPrice(
                                  parseFloat(item.price.amount) * item.quantity,
                                  item.price.currencyCode,
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>

              <div className="flex-shrink-0 px-6 py-5 border-t border-border bg-card/40 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(totalPrice, currency)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground -mt-2">
                  Envío e impuestos calculados en el checkout.
                </p>
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isLoading || isSyncing || items.length === 0}
                  className="w-full rounded-full font-semibold"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Ir a pagar
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
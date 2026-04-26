import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";

export function ShopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const setCartOpen = useCartStore((s) => s.setOpen);
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/tienda/buscar?q=${encodeURIComponent(q.trim())}`);
  };

  const onShop = location.pathname === "/tienda";

  return (
    <div className="flex items-center justify-between gap-3 mb-8 md:mb-12">
      <Link
        to="/tienda"
        className="text-label tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
      >
        {onShop ? "TIENDA OFICIAL" : "← Volver a la tienda"}
      </Link>

      <div className="flex items-center gap-2">
        <form onSubmit={onSearch} className="hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar producto…"
              className="h-10 w-64 rounded-full bg-card border border-border pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </form>

        <button
          onClick={() => navigate("/tienda/buscar")}
          aria-label="Buscar"
          className="sm:hidden h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCartOpen(true)}
          aria-label="Abrir carrito"
          className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
}
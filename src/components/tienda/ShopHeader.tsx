import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";

export function ShopHeader() {
  const navigate = useNavigate();
  const setCartOpen = useCartStore((s) => s.setOpen);
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/tienda/buscar?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="mb-6 md:mb-8">
      <div
        className="rounded-2xl border border-white/[0.06] bg-card p-3 md:p-3.5 flex items-center gap-2 md:gap-3"
        style={{ boxShadow: "0 4px 20px -8px rgba(0,0,0,0.5)" }}
      >
        {/* Buscador */}
        <form onSubmit={onSearch} className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar jerseys, playeras, accesorios…"
              className="h-11 w-full rounded-xl bg-background/40 border border-white/[0.06] pl-10 md:pl-11 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#00abc4]/60 transition-colors"
            />
          </div>
        </form>

        {/* Botón Ver Carrito */}
        <button
          onClick={() => setCartOpen(true)}
          aria-label="Ver carrito"
          className="relative shrink-0 inline-flex items-center gap-2 h-11 px-3 md:px-4 rounded-xl font-bold text-[12px] md:text-[13px] transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "#00abc4",
            color: "#000",
            boxShadow: "0 4px 14px -4px #00abc480",
          }}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Ver Carrito</span>
          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="min-w-[20px] h-[20px] px-1 rounded-full bg-black text-[10px] font-bold text-white flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
}

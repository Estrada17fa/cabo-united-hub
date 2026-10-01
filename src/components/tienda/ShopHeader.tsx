import { useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useSearchStore } from "@/stores/searchStore";
import { Button } from "@/components/ui/button";
import { ShopSortSheet, type ShopSortOption } from "@/components/tienda/ShopSortSheet";

interface ShopHeaderProps {
  sort: string;
  sortOptions: ShopSortOption[];
  onSortChange: (value: string) => void;
}

export function ShopHeader({ sort, sortOptions, onSortChange }: ShopHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const setCartOpen = useCartStore((s) => s.setOpen);
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== "/tienda") navigate("/tienda");
  };

  const onChange = (val: string) => {
    setQuery(val);
    if (val && location.pathname !== "/tienda") navigate("/tienda");
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center gap-2">
        <form onSubmit={onSearch} className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Buscar jerseys, playeras, accesorios…"
              className="h-11 w-full rounded-xl border border-hairline bg-surface-1 pl-10 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40 md:pl-11"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </form>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCartOpen(true)}
          aria-label="Ver carrito"
          title="Ver carrito"
          className="relative h-11 w-11 shrink-0 rounded-xl border border-hairline bg-surface-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        >
          <ShoppingBag className="h-4 w-4" />
          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-display text-[9px] font-bold text-background"
            >
              {totalItems}
            </motion.span>
          )}
        </Button>
        <ShopSortSheet value={sort} options={sortOptions} onChange={onSortChange} />
      </div>
    </div>
  );
}

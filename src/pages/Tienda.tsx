import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { HeroCarousel } from "@/components/tienda/HeroCarousel";
import { PromoBanner } from "@/components/tienda/PromoBanner";
import { ProductCard } from "@/components/tienda/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useShopBanners } from "@/hooks/useShopContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchStore } from "@/stores/searchStore";
import { STORE_CATEGORIES, type StoreCategoryId } from "@/lib/store-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Filter = "todo" | StoreCategoryId;

type SortKey = "newest" | "price-asc" | "price-desc" | "name";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Más nuevo" },
  { key: "price-asc", label: "Precio: menor a mayor" },
  { key: "price-desc", label: "Precio: mayor a menor" },
  { key: "name", label: "Nombre A-Z" },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todo", label: "Todo" },
  ...STORE_CATEGORIES.map((c) => ({ id: c.id as Filter, label: c.label })),
];

const Tienda = () => {
  const { data: products, isLoading, error } = useProducts();
  const { data: banners } = useShopBanners();
  const [filter, setFilter] = useState<Filter>("todo");
  const [sort, setSort] = useState<SortKey>("newest");
  const searchQuery = useSearchStore((s) => s.query);
  const term = searchQuery.trim().toLowerCase();
  const isSearching = term.length > 0;

  const list = useMemo(() => {
    if (!products) return [];
    const filtered = products.filter((p) => {
      if (term) {
        return (
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
        );
      }
      return filter === "todo" || p.category === filter;
    });

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [products, filter, sort, term]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Más nuevo";
  const activeLabel = FILTERS.find((f) => f.id === filter)?.label ?? "Todo";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pb-20"
    >
      {!isSearching && (
        <>
          {/* 1. HERO EDITORIAL */}
          <section className="mb-4 md:mb-6">
            <HeroCarousel />
          </section>

          {/* 2. BANNERS PROMOCIONALES */}
          {banners && banners.length > 0 && (
            <section className="mb-6 space-y-3">
              {banners.map((b) => (
                <PromoBanner key={b.id} banner={b} />
              ))}
            </section>
          )}
        </>
      )}

      {/* 3. BUSCADOR + CARRITO */}
      <ShopHeader />

      {/* 4. FILTROS + ORDEN */}
      {!isSearching && (
        <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border border-hairline bg-surface-1 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-hairline bg-surface-1 px-3.5 py-2 text-[12px] font-semibold text-foreground">
                Ordenar: <span className="font-normal text-muted-foreground">{sortLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-hairline bg-surface-1">
              {SORTS.map((s) => (
                <DropdownMenuItem
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className="cursor-pointer text-xs"
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      )}

      {/* 5. GRILLA */}
      <motion.section
        key={`${filter}-${sort}-${term}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-4 flex items-end justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-bold text-foreground">
              {isSearching ? `Resultados para "${searchQuery}"` : activeLabel}
            </span>
            {list.length > 0 && (
              <>
                {" · "}
                <span className="font-display tabular-nums">{list.length}</span>{" "}
                {list.length === 1 ? "pieza" : "piezas"}
              </>
            )}
          </p>
          {filter !== "todo" && !isSearching && (
            <button
              onClick={() => setFilter("todo")}
              className="text-[12px] font-bold text-primary"
            >
              Ver todos
            </button>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-hairline py-16 text-center text-sm text-muted-foreground">
            No pudimos cargar la tienda. Intenta más tarde.
          </div>
        )}

        {!isLoading && !error && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-hairline py-16 text-center">
            <p className="text-sm font-bold text-foreground">Sin piezas por ahora</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {isSearching
                ? "Prueba con otra palabra."
                : `Aún no hay productos en ${activeLabel}.`}
            </p>
          </div>
        )}

        {list.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default Tienda;

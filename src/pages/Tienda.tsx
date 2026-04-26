import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Shield } from "lucide-react";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { EditorialProductCard } from "@/components/tienda/EditorialProductCard";
import { FeaturedDrop } from "@/components/tienda/FeaturedDrop";
import { useShopifyProducts } from "@/hooks/useShopify";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShopifyProduct } from "@/lib/shopify";

type FilterKey =
  | "todo"
  | "jerseys"
  | "playeras"
  | "hoodies"
  | "accesorios"
  | "limitada";

const FILTERS: { key: FilterKey; label: string; match: (p: ShopifyProduct) => boolean }[] = [
  { key: "todo", label: "Todo", match: () => true },
  {
    key: "jerseys",
    label: "Jerseys",
    match: (p) => /jersey|camiseta de juego/i.test(p.node.productType ?? "") || (p.node.tags ?? []).some((t) => /jersey/i.test(t)),
  },
  {
    key: "playeras",
    label: "Playeras",
    match: (p) =>
      /t-?shirt|playera|tee|shirt/i.test(p.node.productType ?? "") ||
      (p.node.tags ?? []).some((t) => /playera|tshirt|t-shirt/i.test(t)),
  },
  {
    key: "hoodies",
    label: "Hoodies",
    match: (p) =>
      /hoodie|sudadera|sweatshirt/i.test(p.node.productType ?? "") ||
      (p.node.tags ?? []).some((t) => /hoodie|sudadera/i.test(t)),
  },
  {
    key: "accesorios",
    label: "Accesorios",
    match: (p) =>
      /accessor|gorra|cap|hat|bag|bolsa/i.test(p.node.productType ?? "") ||
      (p.node.tags ?? []).some((t) => /accesor|gorra|cap|bag/i.test(t)),
  },
  {
    key: "limitada",
    label: "Edición Limitada",
    match: (p) => (p.node.tags ?? []).some((t) => /limit|edition|edicion/i.test(t)),
  },
];

type SortKey = "newest" | "price-asc" | "price-desc" | "name";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Más nuevo" },
  { key: "price-asc", label: "Precio: menor a mayor" },
  { key: "price-desc", label: "Precio: mayor a menor" },
  { key: "name", label: "Nombre A-Z" },
];

const Tienda = () => {
  const { data: products, isLoading, error } = useShopifyProducts({ first: 50 });
  const [filter, setFilter] = useState<FilterKey>("todo");
  const [sort, setSort] = useState<SortKey>("newest");

  const featured = products?.[0];

  const filteredAndSorted = useMemo(() => {
    if (!products) return [];
    const f = FILTERS.find((x) => x.key === filter)!;
    const list = products.filter(f.match);
    const sorted = [...list];
    if (sort === "price-asc") {
      sorted.sort(
        (a, b) =>
          parseFloat(a.node.priceRange.minVariantPrice.amount) -
          parseFloat(b.node.priceRange.minVariantPrice.amount),
      );
    } else if (sort === "price-desc") {
      sorted.sort(
        (a, b) =>
          parseFloat(b.node.priceRange.minVariantPrice.amount) -
          parseFloat(a.node.priceRange.minVariantPrice.amount),
      );
    } else if (sort === "name") {
      sorted.sort((a, b) => a.node.title.localeCompare(b.node.title));
    }
    return sorted;
  }, [products, filter, sort]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Más nuevo";

  return (
    <div className="pb-20">
      <ShopHeader />

      {/* EDITORIAL HERO */}
      <section className="relative mb-10 md:mb-14">
        {/* Watermark shield (desktop) */}
        <div
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ opacity: 0.06 }}
          aria-hidden
        >
          <Shield className="w-[200px] h-[200px] text-foreground" strokeWidth={1.2} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-3xl"
        >
          <p
            className="text-[11px] font-semibold uppercase mb-4"
            style={{ color: "#00FF87", letterSpacing: "0.15em" }}
          >
            Tienda Oficial
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[0.95] mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Viste los colores
          </h1>
          <p className="text-base text-muted-foreground">
            Merch exclusivo de los Amos del Paraíso
          </p>
        </motion.div>

        {/* Filter pills + sort */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FILTERS.map((f) => {
              const active = f.key === filter;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                    active
                      ? "text-black"
                      : "bg-card border border-white/40 text-foreground hover:border-foreground"
                  }`}
                  style={
                    active
                      ? { background: "#00FF87", boxShadow: "0 4px 14px -4px #00FF8780" }
                      : undefined
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold bg-card border border-border text-foreground hover:border-white/40 transition-colors">
                Ordenar: <span className="text-muted-foreground font-medium">{sortLabel}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              {SORTS.map((s) => (
                <DropdownMenuItem
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className="text-xs cursor-pointer"
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* FEATURED DROP */}
      {featured && (
        <section className="mb-12 md:mb-16">
          <FeaturedDrop product={featured} />
        </section>
      )}

      {/* PRODUCTS GRID */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p
              className="text-[11px] font-semibold uppercase mb-1.5 text-muted-foreground"
              style={{ letterSpacing: "0.15em" }}
            >
              Drop completo
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Toda la colección
            </h2>
          </div>
          {filteredAndSorted.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "pieza" : "piezas"}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-muted-foreground">
            No pudimos cargar la tienda. Intenta más tarde.
          </div>
        )}

        {!isLoading && !error && filteredAndSorted.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="text-base font-semibold mb-1">No products found</p>
            <p className="text-sm text-muted-foreground">
              Aún no hay piezas en esta categoría.
            </p>
          </div>
        )}

        {filteredAndSorted.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAndSorted.map((p, i) => (
              <EditorialProductCard key={p.node.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Tienda;

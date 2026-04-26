import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Shield } from "lucide-react";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { EditorialProductCard } from "@/components/tienda/EditorialProductCard";
import { HeroCarousel } from "@/components/tienda/HeroCarousel";
import { CategoryTabs } from "@/components/tienda/CategoryTabs";
import { useShopifyProducts } from "@/hooks/useShopify";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchStore } from "@/stores/searchStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShopifyProduct } from "@/lib/shopify";

/* ========== Categorías principales (audiencia) ========== */
type CategoryKey = "jerseys" | "hombre" | "mujer" | "nino" | "accesorios" | "limitada";

const isJersey = (p: ShopifyProduct) =>
  /jersey|camiseta de juego|kit oficial/i.test(p.node.productType ?? "") ||
  (p.node.tags ?? []).some((t) => /jersey|kit-oficial|jersey-oficial/i.test(t));

const CATEGORIES: { id: CategoryKey; label: string; match: (p: ShopifyProduct) => boolean }[] = [
  {
    id: "jerseys",
    label: "Jerseys Oficiales",
    match: isJersey,
  },
  {
    id: "hombre",
    label: "Hombre",
    match: (p) =>
      (p.node.tags ?? []).some((t) => /hombre|men|man|masculino/i.test(t)) ||
      // por defecto, productos sin clasificación clara entran a "Hombre"
      !(p.node.tags ?? []).some((t) =>
        /mujer|women|woman|niño|nino|kid|child|accesor|gorra|cap|bag|limit|edition|edicion/i.test(t),
      ),
  },
  {
    id: "mujer",
    label: "Mujer",
    match: (p) => (p.node.tags ?? []).some((t) => /mujer|women|woman|femenino/i.test(t)),
  },
  {
    id: "nino",
    label: "Niño",
    match: (p) => (p.node.tags ?? []).some((t) => /niño|nino|kid|child|infantil|junior/i.test(t)),
  },
  {
    id: "accesorios",
    label: "Accesorios",
    match: (p) =>
      /accessor|gorra|cap|hat|bag|bolsa|bufanda|scarf/i.test(p.node.productType ?? "") ||
      (p.node.tags ?? []).some((t) => /accesor|gorra|cap|bag|bufanda/i.test(t)),
  },
  {
    id: "limitada",
    label: "Edición Limitada",
    match: (p) =>
      (p.node.tags ?? []).some((t) => /limit|edition|edicion|drop|exclusive/i.test(t)),
  },
];

/* ========== Sub-filtros por tipo de prenda ========== */
type SubFilterKey = "todo" | "jerseys" | "playeras" | "hoodies" | "pants" | "accesorios";

const SUB_FILTERS: { key: SubFilterKey; label: string; match: (p: ShopifyProduct) => boolean }[] = [
  { key: "todo", label: "Todo", match: () => true },
  {
    key: "jerseys",
    label: "Jerseys",
    match: (p) =>
      /jersey|camiseta de juego/i.test(p.node.productType ?? "") ||
      (p.node.tags ?? []).some((t) => /jersey/i.test(t)),
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
    key: "pants",
    label: "Pants",
    match: (p) =>
      /pant|short|jogger|legging/i.test(p.node.productType ?? "") ||
      (p.node.tags ?? []).some((t) => /pant|short|jogger/i.test(t)),
  },
  {
    key: "accesorios",
    label: "Accesorios",
    match: (p) =>
      /accessor|gorra|cap|hat|bag|bolsa/i.test(p.node.productType ?? "") ||
      (p.node.tags ?? []).some((t) => /accesor|gorra|cap|bag/i.test(t)),
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
  const [category, setCategory] = useState<CategoryKey>("jerseys");
  const [subFilter, setSubFilter] = useState<SubFilterKey>("todo");
  const [sort, setSort] = useState<SortKey>("newest");
  const searchQuery = useSearchStore((s) => s.query);

  // Jerseys oficiales destacados: hasta 4 jerseys del catálogo
  const featuredJerseys = useMemo(() => {
    if (!products) return [];
    const jerseys = products.filter(isJersey);
    const list = jerseys.length > 0 ? jerseys : products;
    return list.slice(0, 4);
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    if (!products) return [];
    const cat = CATEGORIES.find((x) => x.id === category)!;
    const sub = SUB_FILTERS.find((x) => x.key === subFilter)!;
    const term = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      // Si hay búsqueda activa, ignorar categoría/subfiltro y buscar en todo
      if (term) {
        const n = p.node;
        return (
          n.title.toLowerCase().includes(term) ||
          n.description?.toLowerCase().includes(term) ||
          n.productType?.toLowerCase().includes(term) ||
          n.vendor?.toLowerCase().includes(term) ||
          n.tags?.some((t) => t.toLowerCase().includes(term))
        );
      }
      return cat.match(p) && sub.match(p);
    });
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
  }, [products, category, subFilter, sort, searchQuery]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Más nuevo";
  const activeCategoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? "";
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="pb-20">
      <ShopHeader />

      {!isSearching && (
        <>
          {/* HERO CAROUSEL — full width */}
          <section className="mb-10 md:mb-14">
            <HeroCarousel />
          </section>

          {/* JERSEYS OFICIALES — Sección destacada */}
          <section
        className="my-8 relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 md:p-7"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(0,171,196,0.18), transparent 60%), linear-gradient(180deg, rgba(0,171,196,0.06) 0%, transparent 100%), #0d0d0d",
        }}
      >
        {/* Glow accent */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30"
          style={{ background: "#00abc4" }}
        />

        <div className="relative flex items-end justify-between mb-5">
          <div>
            <p
              className="font-semibold uppercase mb-1.5 inline-flex items-center gap-1.5"
              style={{ color: "#00abc4", letterSpacing: "0.15em", fontSize: "10px" }}
            >
              <Shield className="w-3 h-3" />
              Jerseys Oficiales
            </p>
            <h2
              className="font-bold text-foreground"
              style={{ letterSpacing: "-0.02em", fontSize: "22px" }}
            >
              Viste los colores del equipo
            </h2>
          </div>
          <button
            onClick={() => {
              setCategory("jerseys");
              setSubFilter("todo");
              document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="font-semibold whitespace-nowrap hover:opacity-80 transition-opacity"
            style={{ color: "#00abc4", fontSize: "12px" }}
          >
            Ver todos →
          </button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && featuredJerseys.length > 0 && (
          <>
            {/* Mobile: horizontal scroll snap */}
            <div className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-1 px-1 pb-2 relative">
              {featuredJerseys.map((p, i) => (
                <div
                  key={p.node.id}
                  className="snap-start shrink-0"
                  style={{ width: "72vw" }}
                >
                  <EditorialProductCard product={p} index={i} />
                </div>
              ))}
            </div>
            {/* Desktop: 4-col grid */}
            <div className="hidden md:grid grid-cols-4 gap-3 relative">
              {featuredJerseys.map((p, i) => (
                <EditorialProductCard key={p.node.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}
          </section>

          {/* CATEGORÍAS PRINCIPALES (estilo Match Zone) */}
          <section id="catalogo" className="mb-6">
        <CategoryTabs
          tabs={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
          activeTab={category}
          onTabChange={(id) => {
            setCategory(id as CategoryKey);
            setSubFilter("todo");
          }}
        />
          </section>

          {/* SUB-FILTROS + SORT */}
          <section className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {SUB_FILTERS.map((f) => {
            const active = f.key === subFilter;
            return (
              <button
                key={f.key}
                onClick={() => setSubFilter(f.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "text-black"
                    : "bg-card border border-white/40 text-foreground hover:border-foreground"
                }`}
                style={
                  active
                    ? { background: "#00abc4", boxShadow: "0 4px 14px -4px #00abc480" }
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
              Ordenar:{" "}
              <span className="text-muted-foreground font-medium">{sortLabel}</span>
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
          </section>
        </>
      )}

      {/* GRID DE PRODUCTOS */}
      <motion.section
        key={`${category}-${subFilter}-${sort}-${searchQuery}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-end justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">
              {isSearching ? `Resultados para "${searchQuery}"` : activeCategoryLabel}
            </span>
            {filteredAndSorted.length > 0 && (
              <>
                {" · "}
                {filteredAndSorted.length}{" "}
                {filteredAndSorted.length === 1 ? "pieza" : "piezas"}
              </>
            )}
          </p>
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
            <p className="text-base font-semibold mb-1">Sin piezas por ahora</p>
            <p className="text-sm text-muted-foreground">
              Aún no hay productos en {activeCategoryLabel}
              {subFilter !== "todo" ? ` · ${SUB_FILTERS.find((s) => s.key === subFilter)?.label}` : ""}.
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
      </motion.section>
    </div>
  );
};

export default Tienda;

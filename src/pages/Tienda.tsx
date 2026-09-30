import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { HeroCarousel } from "@/components/tienda/HeroCarousel";
import { PromoBanner } from "@/components/tienda/PromoBanner";
import { ProductCard } from "@/components/tienda/ProductCard";
import { ShopTabs } from "@/components/tienda/ShopTabs";
import { useProducts } from "@/hooks/useProducts";
import { useShopBanners } from "@/hooks/useShopContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchStore } from "@/stores/searchStore";
import {
  STORE_EQUIPACION_LABELS,
  STORE_LINE_LABELS,
  STORE_SECTION_LABELS,
  storeTypeLabel,
  type StoreLine,
  type StoreProduct,
} from "@/lib/store-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortKey = "newest" | "price-asc" | "price-desc" | "name";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Más nuevo" },
  { key: "price-asc", label: "Precio: menor a mayor" },
  { key: "price-desc", label: "Precio: mayor a menor" },
  { key: "name", label: "Nombre A-Z" },
];

const LINE_ORDER: StoreLine[] = ["oficial", "streetwear", "otros"];
const SECTION_ORDER = ["hombre", "mujer", "nino", "accesorios"];
const EQUIPACION_ORDER = ["local", "visita", "portero", "tercero"];

const sortByOrder = (ids: string[], order: string[]) =>
  [...ids].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });

const uniq = (arr: string[]) => [...new Set(arr)];

/** Redirige links viejos (?categoria=jerseys, etc.) a la URL nueva. */
const LEGACY_CATEGORY: Record<string, Record<string, string>> = {
  jerseys: { linea: "oficial" },
  playeras: { linea: "streetwear", tipo: "playera" },
  hoodies: { linea: "streetwear", tipo: "hoodie" },
  accesorios: { linea: "streetwear", seccion: "accesorios" },
};

const Tienda = () => {
  const { data: products, isLoading, error } = useProducts();
  const { data: banners } = useShopBanners();
  const [params, setParams] = useSearchParams();
  const searchQuery = useSearchStore((s) => s.query);
  const term = searchQuery.trim().toLowerCase();
  const isSearching = term.length > 0;

  const sort = (SORTS.some((s) => s.key === params.get("orden"))
    ? params.get("orden")
    : "newest") as SortKey;

  // Redirección de parámetros viejos
  useEffect(() => {
    const legacy = params.get("categoria");
    if (!legacy) return;
    const next = new URLSearchParams(params);
    next.delete("categoria");
    const mapped = LEGACY_CATEGORY[legacy];
    if (mapped) {
      for (const [k, v] of Object.entries(mapped)) next.set(k, v);
    }
    setParams(next, { replace: true });
  }, [params, setParams]);

  const all = products ?? [];

  // ---- Nivel 1: líneas con al menos 1 producto ----
  const lines = useMemo(
    () => LINE_ORDER.filter((l) => all.some((p) => p.line === l)),
    [all],
  );

  const rawLine = params.get("linea") as StoreLine | null;
  const line: StoreLine =
    rawLine && lines.includes(rawLine) ? rawLine : (lines[0] ?? "oficial");

  const lineProducts = useMemo(() => all.filter((p) => p.line === line), [all, line]);

  // ---- Nivel 2: secciones (streetwear) o equipaciones (oficial) ----
  const lineSections = useMemo(
    () => sortByOrder(uniq(lineProducts.flatMap((p) => p.sections)), SECTION_ORDER),
    [lineProducts],
  );
  const lineEquipaciones = useMemo(
    () =>
      sortByOrder(
        uniq(lineProducts.map((p) => p.equipacion).filter((e): e is string => !!e)),
        EQUIPACION_ORDER,
      ),
    [lineProducts],
  );

  const showSections = line === "streetwear" ? lineSections.length > 0 : lineSections.length > 1;
  const showEquipaciones = line === "oficial" && lineEquipaciones.length > 0;

  const rawSeccion = params.get("seccion");
  const seccion =
    showSections && rawSeccion && lineSections.includes(rawSeccion) ? rawSeccion : "todo";

  const rawEquip = params.get("equipacion");
  const equipacion =
    showEquipaciones && rawEquip && lineEquipaciones.includes(rawEquip) ? rawEquip : "todo";

  const level2Products = useMemo(
    () =>
      lineProducts.filter((p) => {
        if (showSections && seccion !== "todo" && !p.sections.includes(seccion)) return false;
        if (showEquipaciones && equipacion !== "todo" && p.equipacion !== equipacion) return false;
        return true;
      }),
    [lineProducts, showSections, seccion, showEquipaciones, equipacion],
  );

  // ---- Nivel 3: tipos de prenda de la selección actual ----
  const level3Types = useMemo(
    () => uniq(level2Products.map((p) => p.garmentType)),
    [level2Products],
  );
  const showTypes = level3Types.length > 1;

  const rawTipo = params.get("tipo");
  const tipo = showTypes && rawTipo && level3Types.includes(rawTipo) ? rawTipo : "todo";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const selectLine = (l: StoreLine) => {
    const next = new URLSearchParams(params);
    next.set("linea", l);
    next.delete("seccion");
    next.delete("equipacion");
    next.delete("tipo");
    setParams(next, { replace: true });
  };

  // ---- Lista final ----
  const list = useMemo(() => {
    const filtered = term
      ? all.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.tags.some((t) => t.toLowerCase().includes(term)),
        )
      : level2Products.filter((p) => tipo === "todo" || p.garmentType === tipo);

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [all, level2Products, tipo, sort, term]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Más nuevo";

  const activeLabel = useMemo(() => {
    const parts: string[] = [STORE_LINE_LABELS[line]];
    if (showEquipaciones && equipacion !== "todo")
      parts.push(STORE_EQUIPACION_LABELS[equipacion] ?? equipacion);
    if (showSections && seccion !== "todo")
      parts.push(STORE_SECTION_LABELS[seccion] ?? seccion);
    if (showTypes && tipo !== "todo") parts.push(storeTypeLabel(tipo));
    return parts.join(" · ");
  }, [line, showEquipaciones, equipacion, showSections, seccion, showTypes, tipo]);

  const isDefaultView =
    line === (lines[0] ?? "oficial") && seccion === "todo" && equipacion === "todo" && tipo === "todo";

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

      {/* 4. NAVEGACIÓN EN NIVELES + ORDEN */}
      {!isSearching && (
        <section className="mb-6 space-y-2.5">
          <div className="flex items-end justify-between gap-3">
            <ShopTabs
              size="lg"
              options={lines.map((l) => ({ id: l, label: STORE_LINE_LABELS[l] }))}
              value={line}
              onChange={(id) => selectLine(id as StoreLine)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="mb-1 inline-flex shrink-0 items-center gap-2 rounded-xl border border-hairline bg-surface-1 px-3.5 py-2 text-[12px] font-semibold text-foreground">
                  Ordenar: <span className="font-normal text-muted-foreground">{sortLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-hairline bg-surface-1">
                {SORTS.map((s) => (
                  <DropdownMenuItem
                    key={s.key}
                    onClick={() => setParam("orden", s.key === "newest" ? null : s.key)}
                    className="cursor-pointer text-xs"
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {showEquipaciones && (
            <ShopTabs
              options={[
                { id: "todo", label: "Todo" },
                ...lineEquipaciones.map((e) => ({
                  id: e,
                  label: STORE_EQUIPACION_LABELS[e] ?? e,
                })),
              ]}
              value={equipacion}
              onChange={(id) => {
                setParam("equipacion", id === "todo" ? null : id);
                if (id !== equipacion) setParam("tipo", null);
              }}
            />
          )}

          {showSections && (
            <ShopTabs
              options={[
                { id: "todo", label: "Todo" },
                ...lineSections.map((s) => ({
                  id: s,
                  label: STORE_SECTION_LABELS[s] ?? s,
                })),
              ]}
              value={seccion}
              onChange={(id) => {
                const next = new URLSearchParams(params);
                if (id === "todo") next.delete("seccion");
                else next.set("seccion", id);
                next.delete("tipo");
                setParams(next, { replace: true });
              }}
            />
          )}

          {showTypes && (
            <ShopTabs
              options={[
                { id: "todo", label: "Todo" },
                ...level3Types.map((t) => ({ id: t, label: storeTypeLabel(t) })),
              ]}
              value={tipo}
              onChange={(id) => setParam("tipo", id === "todo" ? null : id)}
            />
          )}
        </section>
      )}

      {/* 5. GRILLA */}
      <motion.section
        key={`${line}-${seccion}-${equipacion}-${tipo}-${sort}-${term}`}
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
          {!isDefaultView && !isSearching && (
            <button
              onClick={() => setParams({}, { replace: true })}
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
            {list.map((p: StoreProduct, i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default Tienda;

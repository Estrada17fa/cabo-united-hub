import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { HeroCarousel } from "@/components/tienda/HeroCarousel";
import { PromoBanner } from "@/components/tienda/PromoBanner";
import { ProductCard } from "@/components/tienda/ProductCard";
import { ShopTabs } from "@/components/tienda/ShopTabs";
import { StoreLineTiles } from "@/components/tienda/StoreLineTiles";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useShopBanners, useStoreLineCovers } from "@/hooks/useShopContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchStore } from "@/stores/searchStore";
import {
  equipacionLabel,
  sectionLabel,
  STORE_LINE_LABELS,
  storeTypeLabel,
  type StoreLine,
  type StoreProduct,
} from "@/lib/store-types";

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
  const { data: lineCovers } = useStoreLineCovers();

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

  // Un nivel solo aparece si hay 2+ opciones reales (sin contar "Todo").
  const showSections = lineSections.length > 1;
  const showEquipaciones = line === "oficial" && lineEquipaciones.length > 1;

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

  /** Cada miga guarda los parámetros de URL que la llevan a ese nivel. */
  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; keep: Record<string, string> }[] = [
      { label: STORE_LINE_LABELS[line], keep: { linea: line } },
    ];
    let keep: Record<string, string> = { linea: line };
    if (showEquipaciones && equipacion !== "todo") {
      keep = { ...keep, equipacion };
      crumbs.push({ label: equipacionLabel(equipacion), keep });
    }
    if (showSections && seccion !== "todo") {
      keep = { ...keep, seccion };
      crumbs.push({ label: sectionLabel(seccion), keep });
    }
    if (showTypes && tipo !== "todo") {
      keep = { ...keep, tipo };
      crumbs.push({ label: storeTypeLabel(tipo), keep });
    }
    return crumbs;
  }, [line, showEquipaciones, equipacion, showSections, seccion, showTypes, tipo]);
  const breadcrumbParts = breadcrumbs.map((c) => c.label);

  const goToCrumb = (keep: Record<string, string>) => {
    const next = new URLSearchParams(keep);
    const orden = params.get("orden");
    if (orden) next.set("orden", orden);
    setParams(next, { replace: true });
  };

  const activeLabel = breadcrumbParts.join(" · ");
  const resultTitle = isSearching
    ? `Resultados para “${searchQuery}”`
    : (breadcrumbParts[breadcrumbParts.length - 1] ?? STORE_LINE_LABELS[line]);

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
          {/* 3. LÍNEAS (departamentos) */}
          <section className="mb-3">
            <StoreLineTiles lines={lines} products={all} covers={lineCovers} value={line} onChange={selectLine} />
          </section>
        </>
      )}

      {/* 4. BUSCADOR + CARRITO + ORDEN */}
      <ShopHeader
        sort={sort}
        sortOptions={SORTS}
        onSortChange={(value) => setParam("orden", value === "newest" ? null : value)}
      />

      {/* 5. FILTROS EN NIVELES */}
      {!isSearching && (
        <>
          {(showEquipaciones || showSections || showTypes) && (
            <div className="sticky top-[6.75rem] z-20 -mx-3 mb-4 bg-background px-3 py-2 sm:top-[6.5rem] sm:-mx-4 sm:px-4">
              <div className="space-y-2">
                {showEquipaciones && (
                  <div className="overflow-x-auto scrollbar-hide">
                    <ShopTabs
                      ariaLabel="Equipación"
                      options={[
                        { id: "todo", label: "Todo" },
                        ...lineEquipaciones.map((e) => ({
                          id: e,
                          label: equipacionLabel(e),
                        })),
                      ]}
                      value={equipacion}
                      onChange={(id) => {
                        const next = new URLSearchParams(params);
                        if (id === "todo") next.delete("equipacion");
                        else next.set("equipacion", id);
                        next.delete("tipo");
                        setParams(next, { replace: true });
                      }}
                    />
                  </div>
                )}

                {showSections && (
                  <div className="overflow-x-auto scrollbar-hide">
                    <ShopTabs
                      ariaLabel="Sección"
                      options={[
                        { id: "todo", label: "Todo" },
                        ...lineSections.map((s) => ({
                          id: s,
                          label: sectionLabel(s),
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
                  </div>
                )}

                {showTypes && (
                  <ShopTabs
                    variant="type"
                    ariaLabel="Tipo de prenda"
                    options={[
                      { id: "todo", label: "Todo" },
                      ...level3Types.map((t) => ({ id: t, label: storeTypeLabel(t) })),
                    ]}
                    value={tipo}
                    onChange={(id) => setParam("tipo", id === "todo" ? null : id)}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. GRILLA */}
      <motion.section
        key={`${line}-${seccion}-${equipacion}-${tipo}-${sort}-${term}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="sr-only">{resultTitle}</h1>
        <div className="mb-2.5 flex min-h-5 items-center justify-between gap-3">
          <div className="min-w-0">
            {isSearching ? (
              <p className="truncate text-[11px] font-medium text-muted-foreground">{resultTitle}</p>
            ) : (
              breadcrumbs.length >= 2 && (
                <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  {breadcrumbs.map((c, i) => {
                    const last = i === breadcrumbs.length - 1;
                    return (
                      <span key={c.label + i} className="flex items-center gap-1">
                        {i > 0 && <span aria-hidden>/</span>}
                        {last ? (
                          <span aria-current="page" className="text-foreground/80">{c.label}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => goToCrumb(c.keep)}
                            className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            {c.label}
                          </button>
                        )}
                      </span>
                    );
                  })}
                </nav>
              )
            )}
          </div>
          <span className="shrink-0 font-display text-[11px] font-medium tabular-nums text-muted-foreground">
            {list.length} {list.length === 1 ? "producto" : "productos"}
          </span>
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

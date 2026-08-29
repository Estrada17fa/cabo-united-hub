import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { ProductCard } from "@/components/tienda/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const TiendaBuscar = () => {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const { data: products, isLoading } = useProducts();

  useEffect(() => {
    const t = setTimeout(() => {
      if (q) setParams({ q }, { replace: true });
      else setParams({}, { replace: true });
    }, 200);
    return () => clearTimeout(t);
  }, [q, setParams]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term)),
    );
  }, [products, q]);

  return (
    <div className="pb-20">
      <ShopHeader />

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar jerseys, playeras, accesorios…"
          className="h-11 w-full rounded-xl border border-hairline bg-surface-1 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline py-16 text-center">
          <p className="text-sm font-bold text-foreground">Sin resultados</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Prueba con otra palabra.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TiendaBuscar;

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { ProductCard } from "@/components/tienda/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopify";
import { Skeleton } from "@/components/ui/skeleton";

const TiendaBuscar = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const { data: products, isLoading } = useShopifyProducts({ first: 100 });

  useEffect(() => {
    const handle = setTimeout(() => {
      if (q) setParams({ q }, { replace: true });
      else setParams({}, { replace: true });
    }, 200);
    return () => clearTimeout(handle);
  }, [q, setParams]);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!q.trim()) return products;
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      const n = p.node;
      return (
        n.title.toLowerCase().includes(term) ||
        n.description?.toLowerCase().includes(term) ||
        n.productType?.toLowerCase().includes(term) ||
        n.vendor?.toLowerCase().includes(term) ||
        n.tags?.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [products, q]);

  return (
    <div className="pb-16">
      <ShopHeader />

      <div className="max-w-2xl mx-auto mb-10 md:mb-14">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar jersey, accesorio, edición…"
            className="h-14 w-full rounded-full bg-card border border-border pl-12 pr-5 text-base placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        {q && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"} para "{q}"
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-normal mb-2">Sin resultados</p>
          <p className="text-sm text-muted-foreground">
            Intenta con otra palabra o explora todo el catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={p.node.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TiendaBuscar;
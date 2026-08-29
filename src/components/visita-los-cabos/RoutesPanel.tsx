import { useState } from "react";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { LCU_CYAN } from "@/lib/visita-los-cabos-data";
import { useFanRoutes } from "@/hooks/useVisitaLosCabos";
import { useCategoryMeta } from "@/hooks/usePlaceCategories";
import { CategoryIcon } from "./CategoryIcon";

interface RoutesPanelProps {
  onSelectPlace?: (placeId: string) => void;
}

export function RoutesPanel({ onSelectPlace }: RoutesPanelProps) {
  const { data: routes = [], isLoading } = useFanRoutes();
  const { metaFor } = useCategoryMeta();
  const [openId, setOpenId] = useState<string | null>(null);


  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-foreground leading-tight">
          Rutas del Amo
        </h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Itinerarios curados para fans de LC United
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-[92px] rounded-2xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <p className="text-[12px] text-muted-foreground bg-card border border-border rounded-2xl p-4 leading-relaxed">
          Estamos armando las rutas. Muy pronto vas a poder recorrer Los Cabos
          como un Amo del Paraíso.
        </p>
      ) : (
        <div className="space-y-2.5">
          {routes.map((route) => {
            const open = openId === route.id;
            return (
              <div
                key={route.id}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenId(open ? null : route.id)}
                  className="w-full text-left p-4 group"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0"
                      style={route.color ? { borderColor: `${route.color}55` } : undefined}
                    >
                      <CategoryIcon
                        name={route.icon}
                        className="w-[18px] h-[18px]"
                        style={{ color: route.color || LCU_CYAN }}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-bold text-foreground leading-tight">
                        {route.name}
                      </h3>
                      {route.description && (
                        <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                          {route.description}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-2 font-semibold font-display tabular-nums">
                        {route.stops.length} paradas
                        {route.duration ? ` · ${route.duration}` : ""}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {open && route.stops.length > 0 && (
                  <ol className="border-t border-border divide-y divide-border">
                    {route.stops.map((stop, i) => {
                      const meta =
                        CATEGORY_META[stop.category] ?? CATEGORY_META.restaurantes;
                      return (
                        <li key={stop.placeId}>
                          <button
                            onClick={() => onSelectPlace?.(stop.placeId)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-surface-2 transition-colors"
                          >
                            <span
                              className="w-5 text-[11px] font-bold font-display tabular-nums"
                              style={{ color: meta.color }}
                            >
                              {i + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12px] font-semibold text-foreground truncate">
                                {stop.name}
                              </span>
                              {stop.area && (
                                <span className="block text-[10px] text-muted-foreground truncate">
                                  {stop.area}
                                </span>
                              )}
                            </span>
                            <CategoryIcon
                              name={meta.icon}
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: meta.color }}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Business CTA */}
      <div
        className="rounded-2xl border p-4 mt-2"
        style={{
          background:
            "linear-gradient(135deg, hsl(0 0% 8%) 0%, hsl(0 0% 5%) 100%)",
          borderColor: `${LCU_CYAN}40`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: LCU_CYAN }} />
          <p
            className="text-[10px] uppercase tracking-wider font-semibold"
            style={{ color: LCU_CYAN }}
          >
            ¿Eres un negocio en Los Cabos?
          </p>
        </div>
        <p className="text-[13px] text-foreground font-semibold leading-tight mb-3">
          Llega a miles de fans de Los Cabos United
        </p>
        <a
          href="/contacto"
          className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all"
          style={{
            backgroundColor: LCU_CYAN,
            color: "hsl(0 0% 8%)",
            boxShadow: `0 4px 14px -4px ${LCU_CYAN}80`,
          }}
        >
          Quiero aparecer en el mapa
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

import { ArrowRight, Sparkles } from "lucide-react";
import { FAN_ROUTES, LCU_CYAN } from "@/lib/visita-los-cabos-data";
import { CategoryIcon } from "./CategoryIcon";

export function RoutesPanel() {
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

      <div className="space-y-2.5">
        {FAN_ROUTES.map((route) => (
          <button
            key={route.id}
            className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:border-foreground/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                <CategoryIcon name={route.icon} className="w-[18px] h-[18px] text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-bold text-foreground leading-tight">
                  {route.name}
                </h3>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                  {route.description}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2 font-semibold font-display tabular-nums">
                  {route.stops} paradas · {route.duration}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </div>
          </button>
        ))}
      </div>

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

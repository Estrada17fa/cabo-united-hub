import { MapPin, Check } from "lucide-react";
import { CardShell } from "./CardShell";

const GREEN = "hsl(152 76% 50%)";

export function VisitasCard({ index, onClick }: { index: number; onClick: () => void }) {
  return (
    <CardShell index={index} onClick={onClick} className="md:col-span-3 min-h-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: GREEN, background: "hsl(152 76% 50% / 0.12)" }}>
          +50 PTS
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          📍 Activo
        </span>
      </div>
      <h3 className="text-sm md:text-base font-extrabold tracking-tight text-foreground mb-2">
        Visitas al Paraíso
      </h3>

      {/* Map placeholder */}
      <div
        className="relative rounded-lg overflow-hidden mb-2"
        style={{
          height: 60,
          background: "linear-gradient(135deg, hsl(140 30% 14%), hsl(200 30% 12%))",
          border: "1px solid hsl(0 0% 100% / 0.06)",
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 30% 40%, hsl(0 0% 100% / 0.08) 0, transparent 40%), radial-gradient(circle at 70% 60%, hsl(0 0% 100% / 0.06) 0, transparent 40%)",
        }} />
        <MapPin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5" style={{ color: GREEN }} />
      </div>

      {/* Live ticker */}
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Check className="w-2.5 h-2.5 shrink-0" style={{ color: GREEN }} />
          <span className="truncate">@rafa_sjc · Sunset MonaLisa · 2h</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Check className="w-2.5 h-2.5 shrink-0" style={{ color: GREEN }} />
          <span className="truncate">@cabos_fan · Acre Rest · 5h</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-white/5">
        <span className="text-[10px] text-muted-foreground">12 lugares</span>
        <span className="text-[10px] font-bold" style={{ color: GREEN }}>
          Visitar →
        </span>
      </div>
    </CardShell>
  );
}

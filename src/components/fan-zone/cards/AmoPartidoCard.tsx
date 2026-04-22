import { CardShell } from "./CardShell";

export function AmoPartidoCard({ index }: { index: number }) {
  return (
    <CardShell index={index} inactive className="md:col-span-6 min-h-[180px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-extrabold tracking-tight text-foreground">
          👑 Amo del Partido
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-muted-foreground" style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
          Bloqueado
        </span>
      </div>

      {/* Player silhouettes */}
      <div className="flex-1 flex items-center justify-center gap-4 my-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5" style={{ opacity: 0.4 }}>
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-base font-extrabold text-muted-foreground"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px dashed hsl(0 0% 100% / 0.15)",
                filter: "blur(0.5px)",
              }}
            >
              ?
            </div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">--</span>
          </div>
        ))}
      </div>

      <div className="text-center mb-2">
        <p className="text-[11px] text-muted-foreground">Se activa al minuto 70 del partido</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 mt-0.5">
          Próximo: Dom 27 Abr
        </p>
      </div>

      <div className="pt-3 border-t border-white/5">
        <span className="text-[11px] font-bold text-muted-foreground/60">
          Votación no disponible
        </span>
      </div>
    </CardShell>
  );
}

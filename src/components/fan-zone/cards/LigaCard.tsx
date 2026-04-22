import { CardShell } from "./CardShell";

const GREEN = "hsl(152 76% 50%)";

const ROWS = [
  { rank: 1, medal: "🥇", user: "carlos_b", pts: "18,200" },
  { rank: 2, medal: "🥈", user: "mariana_lc", pts: "17,450" },
  { rank: 3, medal: "🥉", user: "pericues22", pts: "16,800" },
  { rank: 4, medal: "", user: "diego_lcu", pts: "15,100" },
];

export function LigaCard({ index, onClick }: { index: number; onClick: () => void }) {
  return (
    <CardShell index={index} onClick={onClick} className="md:col-span-4 min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm md:text-base font-extrabold tracking-tight text-foreground">
          🏆 Liga de Amos
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Sem 16
        </span>
      </div>

      <div className="flex-1 space-y-0.5">
        {ROWS.map((r) => (
          <div key={r.rank} className="flex items-center gap-2 px-1.5 py-1 rounded-md text-[11px]">
            <span className="w-7 text-muted-foreground text-center">
              {r.medal || `#${r.rank}`}
            </span>
            <span className="flex-1 truncate text-foreground/90">{r.user}</span>
            <span className="font-bold text-foreground tabular-nums">{r.pts}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-white/10 my-1" />
        <div
          className="flex items-center gap-2 px-1.5 py-1 rounded-md text-[11px]"
          style={{
            background: "hsl(152 76% 50% / 0.08)",
            borderLeft: `2px solid ${GREEN}`,
          }}
        >
          <span className="w-7 text-center" style={{ color: GREEN }}>#42</span>
          <span className="flex-1 truncate font-semibold text-foreground">Emilio E.</span>
          <span className="font-extrabold tabular-nums" style={{ color: GREEN }}>12,450</span>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-white/5">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">Premios:</p>
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: "hsl(45 100% 55%)", background: "hsl(45 100% 55% / 0.1)" }}>
            🥇 2 Boletos
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: "hsl(0 0% 75%)", background: "hsl(0 0% 75% / 0.08)" }}>
            🥈 Jersey
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: "hsl(25 70% 55%)", background: "hsl(25 70% 55% / 0.1)" }}>
            🥉 30%
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">Ver ranking completo →</span>
      </div>
    </CardShell>
  );
}

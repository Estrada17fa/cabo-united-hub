import { CardShell } from "./CardShell";

const PURPLE = "hsl(270 80% 65%)";

export function TriviaCard({ index, onClick }: { index: number; onClick: () => void }) {
  const options = ["2017", "2019", "2021", "2023"];

  return (
    <CardShell index={index} onClick={onClick} className="md:col-span-6 min-h-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base md:text-lg font-extrabold tracking-tight text-foreground">
          Trivia del Paraíso
        </h3>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: PURPLE, background: "hsl(270 80% 65% / 0.12)" }}>
          +75 PTS
        </span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
        5 preguntas · Semana 16
      </p>

      {/* Question bubble */}
      <div className="rounded-lg p-3 mb-3" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
        <p className="text-xs md:text-sm font-semibold text-foreground mb-3">
          ¿En qué año se fundó Los Cabos United?
        </p>
        <div className="grid grid-cols-2 gap-1.5" onClick={(e) => e.stopPropagation()}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className="py-1.5 rounded-md text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-[11px] text-muted-foreground">
            3/5 · 45 pts
          </span>
          <span className="text-[11px] tracking-widest" style={{ color: PURPLE }}>
            ●●●<span className="text-muted-foreground/40">○○</span>
          </span>
        </div>
        <span className="text-[11px] md:text-xs font-bold" style={{ color: PURPLE }}>
          Continuar Trivia →
        </span>
      </div>
    </CardShell>
  );
}

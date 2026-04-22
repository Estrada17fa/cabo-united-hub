import { CardShell } from "./CardShell";

const PINK = "hsl(336 80% 70%)";
const GREEN = "hsl(152 76% 50%)";

// 4-3-3 formation, y from 0 (bottom = own goal area / GK) to 100 (top = attack)
const POSITIONS = [
  // GK
  { x: 50, y: 8, label: "GK" },
  // Defenders (4)
  { x: 18, y: 28 }, { x: 38, y: 28 }, { x: 62, y: 28 }, { x: 82, y: 28 },
  // Midfielders (3)
  { x: 25, y: 55 }, { x: 50, y: 55 }, { x: 75, y: 55 },
  // Forwards (3)
  { x: 22, y: 80 }, { x: 50, y: 82 }, { x: 78, y: 80 },
];

const FILLED = [0, 1, 2, 5, 6, 9, 10, 7]; // 8 of 11 selected
const INITIALS = ["RG", "JM", "AL", "CP", "DV", "EM", "MR", "TS"];

export function ArmaTu11Card({ index, onClick }: { index: number; onClick: () => void }) {
  let initialIdx = 0;

  return (
    <CardShell index={index} onClick={onClick} className="md:col-span-5 min-h-[220px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base md:text-lg font-extrabold tracking-tight text-foreground">
          Arma tu 11
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: GREEN, background: "hsl(152 76% 50% / 0.12)" }}>
            ABIERTA
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: PINK, background: "hsl(336 80% 70% / 0.12)" }}>
            +100 PTS
          </span>
        </div>
      </div>

      {/* Pitch */}
      <div className="relative flex-1 rounded-lg overflow-hidden my-2" style={{ background: "hsl(140 40% 12%)", minHeight: 120 }}>
        {/* pitch lines */}
        <div className="absolute inset-2 border rounded-sm" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }} />
        <div className="absolute left-2 right-2 top-1/2 h-px" style={{ background: "hsl(0 0% 100% / 0.06)" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }} />
        {/* dots */}
        {POSITIONS.map((pos, i) => {
          const filled = FILLED.includes(i);
          const init = filled ? INITIALS[initialIdx++] : null;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[8px] font-extrabold transition-transform"
              style={{
                left: `${pos.x}%`,
                bottom: `${pos.y}%`,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: filled ? GREEN : "hsl(0 0% 0% / 0.5)",
                border: filled ? "none" : "1px dashed hsl(0 0% 100% / 0.25)",
                color: filled ? "hsl(0 0% 0%)" : "hsl(0 0% 60%)",
              }}
            >
              {filled ? init : "+"}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
        <span className="text-[10px] md:text-[11px] text-muted-foreground">
          8 de 11 posiciones elegidas
        </span>
        <span className="text-[11px] md:text-xs font-bold" style={{ color: GREEN }}>
          Completar alineación →
        </span>
      </div>
    </CardShell>
  );
}

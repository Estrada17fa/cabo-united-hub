import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const RULES = [
  { pts: "3", text: "Ganar de local" },
  { pts: "4", text: "Ganar de visita por 2 goles o más" },
  { pts: "3", text: "Ganar de visita por 1 gol" },
  { pts: "1+1", text: "Empate de 2+ goles: penales, 1 pt cada uno y 1 extra al ganador" },
  { pts: "1", text: "Empate 0-0 o 1-1, sin penales" },
];

/** Tira informativa: el esquema de puntos del torneo, sin ensuciar la tabla. */
export function ScoringRules() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-2">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 text-sm font-semibold text-foreground">Cómo se puntúa</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 px-4 pb-3"
          >
            {RULES.map((r) => (
              <li key={r.text} className="flex items-start gap-2.5">
                <span className="mt-0.5 min-w-[34px] rounded-full bg-primary/15 py-0.5 text-center text-[11px] font-bold text-primary">
                  {r.pts}
                </span>
                <span className="text-xs text-muted-foreground">{r.text}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

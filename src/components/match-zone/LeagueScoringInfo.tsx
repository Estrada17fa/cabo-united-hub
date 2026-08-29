import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Scale } from "lucide-react";

const RULES = [
  { pts: "3", label: "Victoria de local", detail: "Ganar en casa" },
  { pts: "4", label: "Victoria de visita", detail: "Con 2+ goles de diferencia" },
  { pts: "3", label: "Victoria de visita", detail: "Con 1 gol de diferencia" },
  { pts: "1+1", label: "Empate 2-2 o más", detail: "Penales: 1 pt y 1 extra al ganador" },
  { pts: "1", label: "Empate 0-0 / 1-1", detail: "Sin penales" },
];

export function LeagueScoringInfo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-card border border-white/[0.07] bg-surface-1 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <span className="grid place-items-center w-7 h-7 rounded-full bg-primary/15 text-primary shrink-0">
          <Scale className="w-3.5 h-3.5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
            Cómo se puntúa
          </span>
          <span className="block text-[11px] text-muted-foreground truncate">
            Local 3 · Visita 4 · Empate a penales
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-muted-foreground">
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-1.5">
              {RULES.map((r) => (
                <div
                  key={`${r.pts}-${r.label}-${r.detail}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/40 px-2.5 py-2"
                >
                  <span className="min-w-[34px] rounded-lg bg-primary/15 px-1.5 py-0.5 text-center text-[11px] font-semibold text-primary tabular-nums">
                    {r.pts}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[11px] font-bold text-foreground">{r.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{r.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

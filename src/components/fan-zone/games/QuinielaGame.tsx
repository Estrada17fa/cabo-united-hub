import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react";

type Pick = "L" | "E" | "V" | null;

const MOCK_MATCHES = [
  { id: "lcu", home: "Los Cabos United", away: "Real Cabos", locked: true, label: "Partido obligatorio" },
  { id: "m2", home: "Tritones Vallarta", away: "Cimarrones B", locked: false, label: "Elige" },
  { id: "m3", home: "Inter Playa", away: "Mazorqueros", locked: false, label: "Elige" },
];

export function QuinielaGame({ onClose }: { onClose: () => void }) {
  const [picks, setPicks] = useState<Record<string, Pick>>({});

  const allPicked = MOCK_MATCHES.every((m) => picks[m.id]);

  const handleSubmit = () => {
    toast.success("¡Quiniela guardada!", {
      description: "Te avisamos cuando termine la jornada.",
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Predice el resultado de los 3 partidos. <span className="text-primary font-bold">+10 pts</span> por acierto.
      </p>

      {MOCK_MATCHES.map((match, idx) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="rounded-xl border p-4"
          style={{
            backgroundColor: "hsl(0 0% 7%)",
            borderColor: match.locked ? "hsl(180 100% 50% / 0.3)" : "hsl(0 0% 100% / 0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{
                color: match.locked ? "hsl(180 100% 60%)" : "hsl(0 0% 60%)",
                backgroundColor: match.locked ? "hsl(180 100% 50% / 0.1)" : "hsl(0 0% 100% / 0.04)",
              }}
            >
              {match.locked && <Lock className="w-2.5 h-2.5" />}
              {match.label}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3 text-center">
            <div className="text-sm font-bold truncate">{match.home}</div>
            <div className="text-xs text-muted-foreground font-mono">VS</div>
            <div className="text-sm font-bold truncate">{match.away}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["L", "E", "V"] as const).map((opt) => {
              const isActive = picks[match.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setPicks({ ...picks, [match.id]: opt })}
                  className="rounded-full py-2.5 text-xs font-extrabold uppercase tracking-widest border transition-all"
                  style={{
                    backgroundColor: isActive ? "hsl(180 100% 50%)" : "hsl(0 0% 0% / 0.5)",
                    color: isActive ? "hsl(0 0% 8%)" : "hsl(0 0% 90%)",
                    borderColor: isActive ? "hsl(180 100% 60%)" : "hsl(0 0% 100% / 0.1)",
                  }}
                >
                  {opt === "L" ? "Local" : opt === "E" ? "Empate" : "Visita"}
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={!allPicked}
        className="w-full font-extrabold uppercase tracking-widest"
        style={{
          backgroundColor: allPicked ? "hsl(142 76% 50%)" : "hsl(0 0% 15%)",
          color: allPicked ? "hsl(0 0% 8%)" : "hsl(0 0% 50%)",
        }}
      >
        Guardar predicción
      </Button>
    </div>
  );
}
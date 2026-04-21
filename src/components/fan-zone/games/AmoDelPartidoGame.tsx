import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Star, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MOCK_LINEUP = [
  { id: "p1", name: "L. Robles", num: 1, votes: 12 },
  { id: "p2", name: "C. Vela Jr.", num: 2, votes: 18 },
  { id: "p3", name: "R. Márquez", num: 4, votes: 24 },
  { id: "p4", name: "S. Núñez", num: 5, votes: 9 },
  { id: "p5", name: "E. Pacheco", num: 3, votes: 7 },
  { id: "p6", name: "A. Solís", num: 6, votes: 15 },
  { id: "p7", name: "M. Ortega", num: 8, votes: 21 },
  { id: "p8", name: "J. Cárdenas", num: 10, votes: 32 },
  { id: "p9", name: "D. Hernández", num: 9, votes: 48 },
  { id: "p10", name: "F. Aguilar", num: 11, votes: 19 },
  { id: "p11", name: "B. Romero", num: 7, votes: 11 },
];

export function AmoDelPartidoGame({ onClose }: { onClose: () => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [voted, setVoted] = useState<string | null>(null);

  const totalVotes = MOCK_LINEUP.reduce((sum, p) => sum + p.votes, 0) + (voted ? 1 : 0);

  if (!unlocked) {
    return (
      <div className="text-center py-6 space-y-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: "hsl(0 0% 100% / 0.05)", border: "2px solid hsl(0 0% 100% / 0.1)" }}
        >
          <Lock className="w-10 h-10 text-muted-foreground" />
        </motion.div>
        <div>
          <h3 className="text-lg font-extrabold mb-1">Bloqueado por ahora</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            La votación se activa al <span className="text-primary font-bold">minuto 70</span> del partido de Los Cabos United.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            backgroundColor: "hsl(0 0% 0% / 0.5)",
            borderColor: "hsl(180 100% 50% / 0.3)",
          }}
        >
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">Espera al inicio del partido</span>
        </div>

        <div
          className="rounded-xl border p-4 mx-auto max-w-xs flex items-center justify-between"
          style={{ backgroundColor: "hsl(0 0% 7%)", borderColor: "hsl(0 0% 100% / 0.08)" }}
        >
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Modo dev</div>
            <div className="text-xs font-bold">Simular partido activo</div>
          </div>
          <Switch checked={unlocked} onCheckedChange={setUnlocked} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-3 flex items-center justify-between"
        style={{ backgroundColor: "hsl(0 84% 60% / 0.1)", borderColor: "hsl(0 84% 60% / 0.4)" }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "hsl(0 84% 60%)" }}
          />
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "hsl(0 84% 70%)" }}>
            Votación activa · Min 73
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{totalVotes} votos</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Vota por el mejor jugador de Los Cabos United. <span className="text-primary font-bold">+5 pts</span>.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {MOCK_LINEUP.map((p) => {
          const isVoted = voted === p.id;
          const votes = p.votes + (isVoted ? 1 : 0);
          const pct = Math.round((votes / totalVotes) * 100);
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setVoted(p.id);
                toast.success(`¡Voto registrado por #${p.num}!`);
              }}
              className="rounded-xl border p-3 text-left relative overflow-hidden"
              style={{
                backgroundColor: "hsl(0 0% 7%)",
                borderColor: isVoted ? "hsl(180 100% 50%)" : "hsl(0 0% 100% / 0.08)",
              }}
            >
              <div
                className="absolute inset-y-0 left-0 opacity-20"
                style={{ width: `${pct}%`, backgroundColor: isVoted ? "hsl(180 100% 50%)" : "hsl(0 0% 100%)" }}
              />
              <div className="relative flex items-center gap-2 mb-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold"
                  style={{
                    backgroundColor: isVoted ? "hsl(180 100% 50%)" : "hsl(180 100% 50% / 0.15)",
                    color: isVoted ? "hsl(0 0% 8%)" : "hsl(180 100% 70%)",
                  }}
                >
                  {p.num}
                </div>
                {isVoted && <Star className="w-3 h-3 fill-primary text-primary" />}
              </div>
              <div className="relative text-xs font-bold truncate">{p.name}</div>
              <div className="relative text-[10px] text-muted-foreground tabular-nums mt-0.5">{pct}% · {votes}</div>
            </motion.button>
          );
        })}
      </div>

      <Button
        onClick={onClose}
        variant="outline"
        className="w-full font-bold"
      >
        Cerrar
      </Button>
    </div>
  );
}
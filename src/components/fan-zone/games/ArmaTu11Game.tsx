import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

const MOCK_PLAYERS = [
  { id: "p1", name: "L. Robles", num: 1, pos: "POR" },
  { id: "p2", name: "C. Vela Jr.", num: 2, pos: "DEF" },
  { id: "p3", name: "R. Márquez", num: 4, pos: "DEF" },
  { id: "p4", name: "S. Núñez", num: 5, pos: "DEF" },
  { id: "p5", name: "E. Pacheco", num: 3, pos: "DEF" },
  { id: "p6", name: "A. Solís", num: 6, pos: "MED" },
  { id: "p7", name: "M. Ortega", num: 8, pos: "MED" },
  { id: "p8", name: "J. Cárdenas", num: 10, pos: "MED" },
  { id: "p9", name: "D. Hernández", num: 9, pos: "DEL" },
  { id: "p10", name: "F. Aguilar", num: 11, pos: "DEL" },
  { id: "p11", name: "B. Romero", num: 7, pos: "DEL" },
  { id: "p12", name: "K. Domínguez", num: 14, pos: "MED" },
  { id: "p13", name: "T. Reyes", num: 17, pos: "DEF" },
  { id: "p14", name: "I. Mendoza", num: 19, pos: "DEL" },
];

// 4-3-3: 1 POR, 4 DEF, 3 MED, 3 DEL
const FORMATION = [
  { row: "DEL", count: 3, top: "12%" },
  { row: "MED", count: 3, top: "38%" },
  { row: "DEF", count: 4, top: "64%" },
  { row: "POR", count: 1, top: "88%" },
];

type SlotKey = string; // `${row}-${idx}`

export function ArmaTu11Game({ onClose }: { onClose: () => void }) {
  const [lineup, setLineup] = useState<Record<SlotKey, string>>({});
  const [pickerSlot, setPickerSlot] = useState<{ key: SlotKey; pos: string } | null>(null);

  const selectedIds = new Set(Object.values(lineup));
  const filledCount = selectedIds.size;

  const handlePick = (playerId: string) => {
    if (!pickerSlot) return;
    setLineup({ ...lineup, [pickerSlot.key]: playerId });
    setPickerSlot(null);
  };

  const handleClear = (key: SlotKey) => {
    const next = { ...lineup };
    delete next[key];
    setLineup(next);
  };

  const handleSubmit = () => {
    toast.success("¡Tu 11 está guardado!", { description: "Suma puntos según el rendimiento real." });
    onClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Forma 4-3-3. <span className="text-primary font-bold">+5</span> gol ·{" "}
        <span className="text-primary font-bold">+3</span> asist ·{" "}
        <span className="text-primary font-bold">+5</span> portería 0.
      </p>

      {/* Cancha */}
      <div
        className="relative rounded-2xl overflow-hidden mx-auto"
        style={{
          aspectRatio: "3/4",
          maxWidth: "340px",
          background: "linear-gradient(180deg, hsl(142 60% 18%) 0%, hsl(142 70% 12%) 100%)",
          border: "2px solid hsl(0 0% 100% / 0.1)",
        }}
      >
        {/* lines */}
        <div className="absolute inset-3 border-2 rounded-lg pointer-events-none" style={{ borderColor: "hsl(0 0% 100% / 0.25)" }} />
        <div className="absolute left-3 right-3 top-1/2 h-[2px]" style={{ backgroundColor: "hsl(0 0% 100% / 0.25)" }} />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 rounded-full"
          style={{ borderColor: "hsl(0 0% 100% / 0.25)" }}
        />

        {FORMATION.map((row) =>
          Array.from({ length: row.count }).map((_, i) => {
            const key = `${row.row}-${i}`;
            const playerId = lineup[key];
            const player = MOCK_PLAYERS.find((p) => p.id === playerId);
            const left = `${((i + 1) / (row.count + 1)) * 100}%`;

            return (
              <button
                key={key}
                onClick={() => (player ? handleClear(key) : setPickerSlot({ key, pos: row.row }))}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                style={{ left, top: row.top }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs border-2"
                  style={{
                    backgroundColor: player ? "hsl(180 100% 50%)" : "hsl(0 0% 0% / 0.6)",
                    color: player ? "hsl(0 0% 8%)" : "hsl(180 100% 60%)",
                    borderColor: player ? "hsl(180 100% 70%)" : "hsl(180 100% 50% / 0.4)",
                  }}
                >
                  {player ? player.num : <Plus className="w-4 h-4" />}
                </div>
                {player && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white whitespace-nowrap"
                  >
                    {player.name}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className="text-primary font-extrabold">{filledCount}</span>/11 seleccionados
        </span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={filledCount < 11}
        className="w-full font-extrabold uppercase tracking-widest"
        style={{
          backgroundColor: filledCount === 11 ? "hsl(142 76% 50%)" : "hsl(0 0% 15%)",
          color: filledCount === 11 ? "hsl(0 0% 8%)" : "hsl(0 0% 50%)",
        }}
      >
        Guardar mi 11
      </Button>

      {/* Player picker overlay */}
      {pickerSlot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-black/80 flex items-end md:items-center justify-center p-4"
          onClick={() => setPickerSlot(null)}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border max-h-[70vh] flex flex-col"
            style={{ backgroundColor: "hsl(0 0% 7%)", borderColor: "hsl(180 100% 50% / 0.3)" }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
              <div>
                <h4 className="font-extrabold text-sm">Elige jugador</h4>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Posición: {pickerSlot.pos}</p>
              </div>
              <button onClick={() => setPickerSlot(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(0 0% 100% / 0.05)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {MOCK_PLAYERS.filter((p) => p.pos === pickerSlot.pos).map((p) => {
                const taken = selectedIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={taken}
                    onClick={() => handlePick(p.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs"
                      style={{ backgroundColor: "hsl(180 100% 50% / 0.15)", color: "hsl(180 100% 70%)" }}
                    >
                      {p.num}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{p.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.pos}</div>
                    </div>
                    {taken && <span className="text-[10px] text-muted-foreground">Elegido</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
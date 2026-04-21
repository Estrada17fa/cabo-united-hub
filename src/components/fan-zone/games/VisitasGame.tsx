import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, MapPin, QrCode, Camera, X } from "lucide-react";
import { toast } from "sonner";

const MOCK_VENUES = [
  { id: "v1", name: "Arco de Cabo San Lucas", area: "Cabo San Lucas", visited: true },
  { id: "v2", name: "Médano Beach", area: "Cabo San Lucas", visited: true },
  { id: "v3", name: "Plaza Mijares", area: "San José del Cabo", visited: false },
  { id: "v4", name: "Distrito del Arte", area: "San José del Cabo", visited: false },
  { id: "v5", name: "Estero San José", area: "San José del Cabo", visited: false },
  { id: "v6", name: "Estadio Don Koll", area: "Los Cabos", visited: true },
];

export function VisitasGame({ onClose: _onClose }: { onClose: () => void }) {
  const [scanning, setScanning] = useState<string | null>(null);

  const visitedCount = MOCK_VENUES.filter((v) => v.visited).length;

  const handleSimulate = () => {
    toast.success("¡QR escaneado! +15 pts", { description: "Visita verificada correctamente." });
    setScanning(null);
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-4 flex items-center justify-between"
        style={{ backgroundColor: "hsl(336 80% 77% / 0.08)", borderColor: "hsl(336 80% 77% / 0.3)" }}
      >
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Tu progreso</div>
          <div className="text-lg font-extrabold">
            {visitedCount}<span className="text-muted-foreground">/{MOCK_VENUES.length}</span> lugares
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Ganados</div>
          <div className="text-lg font-extrabold" style={{ color: "hsl(336 80% 80%)" }}>
            +{visitedCount * 15} pts
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Escanea el código QR físico en cada lugar para verificar tu visita.{" "}
        <span className="font-bold" style={{ color: "hsl(336 80% 80%)" }}>+15 pts</span> por lugar.
      </p>

      <ul className="space-y-2">
        {MOCK_VENUES.map((venue, i) => (
          <motion.li
            key={venue.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border p-3 flex items-center gap-3"
            style={{
              backgroundColor: "hsl(0 0% 7%)",
              borderColor: venue.visited ? "hsl(142 76% 50% / 0.3)" : "hsl(0 0% 100% / 0.08)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: venue.visited ? "hsl(142 76% 50% / 0.15)" : "hsl(0 0% 100% / 0.05)",
              }}
            >
              {venue.visited ? (
                <Check className="w-5 h-5" style={{ color: "hsl(142 76% 60%)" }} />
              ) : (
                <MapPin className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{venue.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{venue.area}</div>
            </div>
            {!venue.visited && (
              <button
                onClick={() => setScanning(venue.id)}
                className="rounded-full p-2 border"
                style={{
                  backgroundColor: "hsl(336 80% 77% / 0.1)",
                  borderColor: "hsl(336 80% 77% / 0.4)",
                  color: "hsl(336 80% 80%)",
                }}
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}
          </motion.li>
        ))}
      </ul>

      {scanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setScanning(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border p-6 text-center"
            style={{ backgroundColor: "hsl(0 0% 7%)", borderColor: "hsl(336 80% 77% / 0.3)" }}
          >
            <button
              onClick={() => setScanning(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "hsl(0 0% 100% / 0.05)" }}
            >
              <X className="w-4 h-4" />
            </button>
            <div
              className="aspect-square rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed relative overflow-hidden"
              style={{ backgroundColor: "hsl(0 0% 0% / 0.5)", borderColor: "hsl(336 80% 77% / 0.5)" }}
            >
              <Camera className="w-16 h-16 text-muted-foreground" />
              <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1"
                style={{ backgroundColor: "hsl(336 80% 77%)", boxShadow: "0 0 20px hsl(336 80% 77%)" }}
              />
            </div>
            <h4 className="font-extrabold text-base mb-1">Escaneando…</h4>
            <p className="text-xs text-muted-foreground mb-4">Acércate al código QR del lugar</p>
            <Button
              onClick={handleSimulate}
              className="w-full font-extrabold uppercase tracking-widest"
              style={{ backgroundColor: "hsl(336 80% 77%)", color: "hsl(0 0% 10%)" }}
            >
              Simular escaneo
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
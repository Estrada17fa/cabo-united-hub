import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import lcuCrest from "@/assets/lcu-crest.png";

const MOCK_MATCH = { home: "Los Cabos United", away: "Real Cabos", date: "Sáb 26 Abr · 18:00" };

function Stepper({ value, setValue, label }: { value: number; setValue: (v: number) => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</span>
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setValue(Math.min(9, value + 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center border"
          style={{ backgroundColor: "hsl(0 0% 100% / 0.05)", borderColor: "hsl(0 0% 100% / 0.1)" }}
        >
          <Plus className="w-4 h-4" />
        </button>
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-extrabold tabular-nums border"
          style={{
            backgroundColor: "hsl(0 0% 0% / 0.5)",
            borderColor: "hsl(180 100% 50% / 0.3)",
            color: "hsl(180 100% 60%)",
          }}
        >
          {value}
        </div>
        <button
          onClick={() => setValue(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center border"
          style={{ backgroundColor: "hsl(0 0% 100% / 0.05)", borderColor: "hsl(0 0% 100% / 0.1)" }}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function MarcadorExactoGame({ onClose }: { onClose: () => void }) {
  const [home, setHome] = useState(2);
  const [away, setAway] = useState(1);

  const handleSubmit = () => {
    toast.success(`¡Marcador enviado: ${home}-${away}!`, {
      description: "+25 pts si aciertas exacto.",
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground text-center">
        Predice el marcador final exacto. <span className="text-primary font-bold">+25 pts</span> si aciertas.
      </p>

      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Próximo partido</div>
        <div className="text-sm font-bold">{MOCK_MATCH.date}</div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "hsl(0 0% 100% / 0.05)" }}
          >
            <img src={lcuCrest} alt="LCU" className="w-12 h-12 object-contain" />
          </div>
          <Stepper value={home} setValue={setHome} label={MOCK_MATCH.home.split(" ")[0]} />
        </div>

        <div className="text-3xl font-extrabold text-muted-foreground self-start mt-6">−</div>

        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-extrabold"
            style={{ backgroundColor: "hsl(0 0% 100% / 0.05)", color: "hsl(0 0% 60%)" }}
          >
            RC
          </div>
          <Stepper value={away} setValue={setAway} label="Rival" />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full font-extrabold uppercase tracking-widest"
        style={{ backgroundColor: "hsl(142 76% 50%)", color: "hsl(0 0% 8%)" }}
      >
        Enviar marcador
      </Button>
    </div>
  );
}
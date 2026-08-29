import { useEffect, useState } from "react";
import { Minus, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LcuButton } from "@/components/ui-lcu";
import { toast } from "sonner";
import type { Match } from "./types";
import { TeamCrest } from "./TeamCrest";

interface Props {
  match: Match;
}

/** Predicción de marcador antes del silbatazo. Acierto = premio en Fan Zone. */
export function PredictionCard({ match }: Props) {
  const { user } = useAuth();
  const [home, setHome] = useState(1);
  const [away, setAway] = useState(0);
  const [saved, setSaved] = useState<{ home: number; away: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const closed = match.phase !== "scheduled";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("match_predictions")
      .select("home_score, away_score")
      .eq("match_id", match.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSaved({ home: data.home_score, away: data.away_score });
          setHome(data.home_score);
          setAway(data.away_score);
        }
      });
  }, [user?.id, match.id]);

  const submit = async () => {
    if (!user) {
      toast.info("Crea tu cuenta para participar y ganar XP");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("match_predictions")
      .upsert(
        { user_id: user.id, match_id: match.id, home_score: home, away_score: away },
        { onConflict: "user_id,match_id" }
      );
    setBusy(false);
    if (error) {
      toast.error("No pudimos guardar tu pronóstico");
      return;
    }
    setSaved({ home, away });
    toast.success("¡Pronóstico registrado!");
  };

  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-brand-accent" />
        <h3 className="text-sm font-bold text-foreground">Tu pronóstico</h3>
      </div>

      {closed ? (
        <p className="text-xs text-muted-foreground">
          {saved
            ? `Pronosticaste ${saved.home}-${saved.away}. Los aciertos se premian al cierre.`
            : "Los pronósticos se cerraron al arrancar el partido."}
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <Stepper
              team={match.home_team}
              value={home}
              onChange={setHome}
            />
            <span className="text-sm font-semibold text-muted-foreground">vs</span>
            <Stepper team={match.away_team} value={away} onChange={setAway} />
          </div>
          <LcuButton className="mt-4 w-full" onClick={submit} disabled={busy}>
            {saved ? "Actualizar pronóstico" : "Enviar pronóstico"}
          </LcuButton>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Marcador exacto: +150 XP · Resultado correcto: +50 XP
          </p>
        </>
      )}
    </div>
  );
}

function Stepper({
  team,
  value,
  onChange,
}: {
  team?: Match["home_team"];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <TeamCrest team={team} size="md" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="Restar gol"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-muted-foreground"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-xl font-bold tabular-nums text-foreground">{value}</span>
        <button
          onClick={() => onChange(Math.min(15, value + 1))}
          aria-label="Sumar gol"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-muted-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

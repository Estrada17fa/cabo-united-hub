import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeasonKey, useTeams } from "@/hooks/useLeague";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { Field, Hint, adminInput } from "@/components/admin/AdminUI";

interface Row {
  home_team_id: string;
  away_team_id: string;
  kickoff_at: string;
  venue: string;
}

const emptyRow = (): Row => ({ home_team_id: "", away_team_id: "", kickoff_at: "", venue: "" });

export function MatchdayBuilder({
  open,
  onOpenChange,
  suggestedMatchday,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** jornada máxima existente + 1 */
  suggestedMatchday: number;
}) {
  const season = useSeasonKey();
  const qc = useQueryClient();
  const { data: teams } = useTeams();
  const [matchday, setMatchday] = useState(String(suggestedMatchday));
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMatchday(String(suggestedMatchday));
    setRows([emptyRow(), emptyRow()]);
  }, [open, suggestedMatchday]);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  /** La sede se toma automáticamente del equipo local. */
  const setHome = (i: number, id: string) => {
    const venue = teams?.find((t) => t.id === id)?.venue ?? "";
    setRows((rs) =>
      rs.map((r, idx) =>
        idx === i
          ? { ...r, home_team_id: id, venue, away_team_id: r.away_team_id === id ? "" : r.away_team_id }
          : r
      )
    );
  };

  const save = async () => {
    if (!matchday) return toast.error("Indica el número de jornada");

    const filled = rows.filter((r) => r.home_team_id || r.away_team_id || r.kickoff_at);
    if (!filled.length) return toast.error("Captura al menos un enfrentamiento");
    if (filled.some((r) => !r.home_team_id || !r.away_team_id))
      return toast.error("Cada enfrentamiento necesita local y visitante");
    if (filled.some((r) => r.home_team_id === r.away_team_id))
      return toast.error("Un equipo no puede jugar contra sí mismo");
    if (filled.some((r) => !r.kickoff_at))
      return toast.error("Cada partido necesita su fecha y hora");

    const ids = filled.flatMap((r) => [r.home_team_id, r.away_team_id]);
    if (new Set(ids).size !== ids.length) return toast.error("Hay equipos repetidos en la jornada");

    setSaving(true);
    const payload = filled.map((r) => ({
      season,
      matchday: Number(matchday),
      stage: "regular",
      home_team_id: r.home_team_id,
      away_team_id: r.away_team_id,
      kickoff_at: new Date(r.kickoff_at).toISOString(),
      venue: r.venue.trim() || null,
      phase: "scheduled",
      home_score: 0,
      away_score: 0,
    }));

    const { error } = await supabase.from("matches").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar la jornada", { description: error.message });

    toast.success(`Jornada ${matchday} creada con ${payload.length} partidos`);
    qc.invalidateQueries({ queryKey: ["lcu-matches"] });
    qc.invalidateQueries({ queryKey: ["lcu-standings"] });
    onOpenChange(false);
  };

  return (
    <AdminSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Jornada completa"
      footer={
        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar jornada"}
        </button>
      }
    >
      <Field label="Número de jornada">
        <input
          type="number"
          min={1}
          className={adminInput}
          value={matchday}
          onChange={(e) => setMatchday(e.target.value)}
        />
      </Field>
      <Hint>
        Cada partido lleva su propia fecha y hora. La sede se toma automáticamente del equipo local. El
        marcador se captura después, al editar el partido.
      </Hint>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-hairline bg-surface-2 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Partido {i + 1}
              </span>
              {rows.length > 1 && (
                <button
                  onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <select
                className={adminInput}
                value={r.home_team_id}
                onChange={(e) => setHome(i, e.target.value)}
              >
                <option value="">— Local —</option>
                {teams
                  ?.filter((t) => t.id !== r.away_team_id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <select
                className={adminInput}
                value={r.away_team_id}
                onChange={(e) => update(i, { away_team_id: e.target.value })}
              >
                <option value="">— Visitante —</option>
                {teams
                  ?.filter((t) => t.id !== r.home_team_id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <input
                type="datetime-local"
                className={adminInput}
                value={r.kickoff_at}
                onChange={(e) => update(i, { kickoff_at: e.target.value })}
              />
              <input
                readOnly
                className={`${adminInput} cursor-not-allowed opacity-70`}
                placeholder="Sede del equipo local"
                value={r.venue}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setRows((rs) => [...rs, emptyRow()])}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-bold text-foreground hover:border-primary/50"
      >
        <Plus className="h-3.5 w-3.5" /> Agregar partido
      </button>
    </AdminSheet>
  );
}

import { useState } from "react";
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
  time: string;
  venue: string;
  venueTouched: boolean;
}

const emptyRow = (time: string): Row => ({
  home_team_id: "",
  away_team_id: "",
  time,
  venue: "",
  venueTouched: false,
});

export function MatchdayBuilder({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const season = useSeasonKey();
  const qc = useQueryClient();
  const { data: teams } = useTeams();
  const [matchday, setMatchday] = useState("");
  const [date, setDate] = useState("");
  const [baseTime, setBaseTime] = useState("18:00");
  const [rows, setRows] = useState<Row[]>([emptyRow("18:00"), emptyRow("18:00")]);
  const [saving, setSaving] = useState(false);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const setHome = (i: number, id: string) => {
    const venue = teams?.find((t) => t.id === id)?.venue ?? "";
    setRows((rs) =>
      rs.map((r, idx) =>
        idx === i ? { ...r, home_team_id: id, venue: r.venueTouched ? r.venue : venue } : r
      )
    );
  };

  const save = async () => {
    if (!matchday) return toast.error("Indica el número de jornada");
    if (!date) return toast.error("Indica la fecha de la jornada");

    const filled = rows.filter((r) => r.home_team_id && r.away_team_id);
    if (!filled.length) return toast.error("Captura al menos un cruce");
    if (filled.some((r) => r.home_team_id === r.away_team_id))
      return toast.error("Un equipo no puede jugar contra sí mismo");

    const ids = filled.flatMap((r) => [r.home_team_id, r.away_team_id]);
    if (new Set(ids).size !== ids.length)
      return toast.error("Hay equipos repetidos en la jornada");

    setSaving(true);
    const payload = filled.map((r) => ({
      season,
      matchday: Number(matchday),
      stage: "regular",
      home_team_id: r.home_team_id,
      away_team_id: r.away_team_id,
      kickoff_at: new Date(`${date}T${r.time || baseTime}`).toISOString(),
      venue: r.venue.trim() || null,
      phase: "scheduled",
    }));

    const { error } = await supabase.from("matches").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar la jornada", { description: error.message });

    toast.success(`Jornada ${matchday} creada con ${payload.length} partidos`);
    qc.invalidateQueries({ queryKey: ["lcu-matches"] });
    setRows([emptyRow(baseTime), emptyRow(baseTime)]);
    setMatchday("");
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
      <div className="grid grid-cols-3 gap-3">
        <Field label="Jornada">
          <input
            type="number"
            className={adminInput}
            value={matchday}
            onChange={(e) => setMatchday(e.target.value)}
          />
        </Field>
        <Field label="Fecha">
          <input type="date" className={adminInput} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Hora base">
          <input
            type="time"
            className={adminInput}
            value={baseTime}
            onChange={(e) => {
              setBaseTime(e.target.value);
              setRows((rs) => rs.map((r) => (r.time ? r : { ...r, time: e.target.value })));
            }}
          />
        </Field>
      </div>
      <Hint>La sede se autollena con la del equipo local; puedes cambiarla por partido.</Hint>

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
              <select className={adminInput} value={r.home_team_id} onChange={(e) => setHome(i, e.target.value)}>
                <option value="">— Local —</option>
                {teams?.map((t) => (
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
                {teams?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <input
                  type="time"
                  className={adminInput}
                  value={r.time}
                  onChange={(e) => update(i, { time: e.target.value })}
                />
                <input
                  className={adminInput}
                  placeholder="Sede"
                  value={r.venue}
                  onChange={(e) => update(i, { venue: e.target.value, venueTouched: true })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setRows((rs) => [...rs, emptyRow(baseTime)])}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-bold text-foreground hover:border-primary/50"
      >
        <Plus className="h-3.5 w-3.5" /> Agregar partido
      </button>
    </AdminSheet>
  );
}

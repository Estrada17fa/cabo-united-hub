import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeasonGroups, useSeasonKey, useTeams } from "@/hooks/useLeague";
import type { Match } from "@/components/match-zone/types";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, Hint, adminInput } from "@/components/admin/AdminUI";

/** Etiqueta para partidos entre equipos de grupos distintos. */
export const INTERZONAL = "Interzonal";

const PHASES = [
  { value: "scheduled", label: "Programado" },
  { value: "first_half", label: "1er tiempo" },
  { value: "halftime", label: "Medio tiempo" },
  { value: "second_half", label: "2do tiempo" },
  { value: "finished", label: "Finalizado" },
  { value: "postponed", label: "Pospuesto" },
  { value: "canceled", label: "Cancelado" },
];

const EVENT_TYPES = [
  { value: "goal", label: "Gol" },
  { value: "own_goal", label: "Autogol" },
  { value: "penalty_goal", label: "Penal anotado" },
  { value: "penalty_miss", label: "Penal fallado" },
  { value: "yellow", label: "Tarjeta amarilla" },
  { value: "red", label: "Tarjeta roja" },
  { value: "substitution", label: "Cambio" },
  { value: "note", label: "Nota (MT / Final)" },
  { value: "var", label: "VAR" },
];

interface FormState {
  matchday: string;
  group_name: string;
  stage: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_at: string;
  venue: string;
  phase: string;
  home_score: number;
  away_score: number;
  home_pens: string;
  away_pens: string;
  manual_score: boolean;
  stream_url: string;
  tickets_url: string;
  highlights_url: string;
  is_featured: boolean;
}

const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

const EMPTY: FormState = {
  matchday: "",
  group_name: "",
  stage: "regular",
  home_team_id: "",
  away_team_id: "",
  kickoff_at: "",
  venue: "",
  phase: "scheduled",
  home_score: 0,
  away_score: 0,
  home_pens: "",
  away_pens: "",
  manual_score: true,
  stream_url: "",
  tickets_url: "",
  highlights_url: "",
  is_featured: false,
};

export function MatchSheet({
  open,
  onOpenChange,
  match,
  defaultMatchday,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** null = nuevo partido */
  match: Match | null;
  /** jornada sugerida al crear */
  defaultMatchday?: number;
}) {
  const season = useSeasonKey();
  const groups = useSeasonGroups();
  const qc = useQueryClient();
  const { data: teams } = useTeams();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const groupTouched = useRef(false);

  useEffect(() => {
    if (!open) return;
    groupTouched.current = !!match?.group_name;
    if (match) {
      setForm({
        matchday: match.matchday != null ? String(match.matchday) : "",
        group_name: match.group_name ?? "",
        stage: match.stage ?? "regular",
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        kickoff_at: toLocalInput(match.kickoff_at),
        venue: match.venue ?? "",
        phase: match.phase,
        home_score: match.home_score ?? 0,
        away_score: match.away_score ?? 0,
        home_pens: match.home_pens != null ? String(match.home_pens) : "",
        away_pens: match.away_pens != null ? String(match.away_pens) : "",
        manual_score: match.manual_score ?? true,
        stream_url: match.stream_url ?? "",
        tickets_url: match.tickets_url ?? "",
        highlights_url: match.highlights_url ?? "",
        is_featured: match.is_featured ?? false,
      });
    } else {
      setForm({ ...EMPTY, matchday: defaultMatchday ? String(defaultMatchday) : "" });
    }
  }, [open, match, defaultMatchday]);

  /** Grupo sugerido: el común de ambos equipos, o Interzonal si son de grupos distintos. */
  const suggestGroup = (homeId: string, awayId: string, current: string) => {
    if (groupTouched.current) return current;
    const h = teams?.find((t) => t.id === homeId)?.group_name ?? "";
    const a = teams?.find((t) => t.id === awayId)?.group_name ?? "";
    if (!h || !a) return h || a || current;
    return h === a ? h : INTERZONAL;
  };

  /** Sede derivada del equipo local (no se edita a mano). */
  const setHome = (id: string) => {
    const venue = teams?.find((t) => t.id === id)?.venue ?? "";
    setForm((f) => {
      const away = f.away_team_id === id ? "" : f.away_team_id;
      return {
        ...f,
        home_team_id: id,
        venue,
        away_team_id: away,
        group_name: suggestGroup(id, away, f.group_name),
      };
    });
  };

  const setAway = (id: string) => {
    setForm((f) => ({
      ...f,
      away_team_id: id,
      group_name: suggestGroup(f.home_team_id, id, f.group_name),
    }));
  };



  /** El link de transmisión solo aplica a nuestros partidos. */
  const isOurs = useMemo(() => {
    const ids = [form.home_team_id, form.away_team_id].filter(Boolean);
    return !!teams?.some((t) => t.is_ours && ids.includes(t.id));
  }, [teams, form.home_team_id, form.away_team_id]);

  const { data: events } = useQuery({
    queryKey: ["admin-match-events", match?.id],
    enabled: !!match?.id && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_events")
        .select("*")
        .eq("match_id", match!.id)
        .order("minute");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [ev, setEv] = useState({ minute: "", type: "goal", team_id: "", player_name: "", description: "" });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["lcu-matches"] });
    qc.invalidateQueries({ queryKey: ["lcu-standings"] });
    qc.invalidateQueries({ queryKey: ["admin-match-events", match?.id] });
  };

  const save = async () => {
    if (!form.home_team_id || !form.away_team_id) return toast.error("Elige local y visitante");
    if (form.home_team_id === form.away_team_id) return toast.error("Los equipos deben ser distintos");
    if (!form.kickoff_at) return toast.error("Falta la fecha y hora");

    setSaving(true);
    const base = {
      season,
      matchday: form.matchday ? Number(form.matchday) : null,
      group_name: form.group_name.trim() || null,
      stage: form.stage,
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      kickoff_at: new Date(form.kickoff_at).toISOString(),
      venue: form.venue.trim() || null,
      stream_url: isOurs ? form.stream_url.trim() || null : null,
      is_featured: form.is_featured,
    };

    /** Marcador, penales y estado solo se capturan al editar. */
    const payload = match
      ? {
          ...base,
          phase: form.phase,
          home_score: form.home_score,
          away_score: form.away_score,
          home_pens: form.home_pens === "" ? null : Number(form.home_pens),
          away_pens: form.away_pens === "" ? null : Number(form.away_pens),
          manual_score: form.manual_score,
          tickets_url: form.tickets_url.trim() || null,
          highlights_url: form.highlights_url.trim() || null,
        }
      : { ...base, phase: "scheduled", home_score: 0, away_score: 0 };

    if (form.is_featured) {
      await supabase.from("matches").update({ is_featured: false } as never).eq("season", season);
    }

    const { error } = match
      ? await supabase.from("matches").update(payload as never).eq("id", match.id)
      : await supabase.from("matches").insert(payload as never);

    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Partido guardado");
    invalidate();
    onOpenChange(false);
  };

  const remove = async () => {
    if (!match) return;
    const { error } = await supabase.from("matches").delete().eq("id", match.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Partido eliminado");
    invalidate();
    onOpenChange(false);
  };

  const addEvent = async () => {
    if (!match) return toast.error("Guarda el partido antes de agregar eventos");
    if (ev.minute === "") return toast.error("Indica el minuto");
    const { error } = await supabase.from("match_events").insert({
      match_id: match.id,
      minute: Number(ev.minute),
      type: ev.type,
      team_id: ev.team_id || null,
      player_name: ev.player_name.trim() || null,
      description: ev.description.trim() || null,
    } as never);
    if (error) return toast.error("No se pudo agregar", { description: error.message });
    setEv({ minute: "", type: "goal", team_id: "", player_name: "", description: "" });
    invalidate();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("match_events").delete().eq("id", id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    invalidate();
  };

  const teamName = useMemo(
    () => (id?: string | null) =>
      teams?.find((t) => t.id === id)?.short_name || teams?.find((t) => t.id === id)?.name || "",
    [teams]
  );

  return (
    <AdminSheet
      open={open}
      onOpenChange={onOpenChange}
      title={match ? "Editar partido" : "Nuevo partido"}
      footer={
        <div className="space-y-2">
          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar partido"}
          </button>
          {match && (
            <button
              onClick={remove}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar partido
            </button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Field label="Jornada">
          <input
            type="number"
            className={adminInput}
            value={form.matchday}
            onChange={(e) => setForm({ ...form, matchday: e.target.value })}
          />
        </Field>
        <Field label="Grupo">
          {groups.length ? (
            <select
              className={adminInput}
              value={form.group_name}
              onChange={(e) => {
                groupTouched.current = true;
                setForm({ ...form, group_name: e.target.value });
              }}
            >
              <option value="">Sin grupo</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  Grupo {g}
                </option>
              ))}
              <option value={INTERZONAL}>Interzonal</option>
            </select>
          ) : (
            <input
              className={adminInput}
              value={form.group_name}
              onChange={(e) => {
                groupTouched.current = true;
                setForm({ ...form, group_name: e.target.value });
              }}
            />
          )}
        </Field>
        <Field label="Fase">
          <select
            className={adminInput}
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
          >
            <option value="regular">Regular</option>
            <option value="final">Fase final</option>
          </select>
        </Field>
      </div>

      <Field label="Local">
        <select className={adminInput} value={form.home_team_id} onChange={(e) => setHome(e.target.value)}>
          <option value="">— Elegir —</option>
          {teams
            ?.filter((t) => t.id !== form.away_team_id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
      </Field>
      <Field label="Visitante">
        <select
          className={adminInput}
          value={form.away_team_id}
          onChange={(e) => setAway(e.target.value)}
        >
          <option value="">— Elegir —</option>
          {teams
            ?.filter((t) => t.id !== form.home_team_id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
      </Field>

      <Field label="Fecha y hora">
        <input
          type="datetime-local"
          className={adminInput}
          value={form.kickoff_at}
          onChange={(e) => setForm({ ...form, kickoff_at: e.target.value })}
        />
      </Field>
      <Field label="Sede (del equipo local)">
        <input
          readOnly
          className={`${adminInput} cursor-not-allowed opacity-70`}
          value={form.venue}
          placeholder="Se toma de la sede del local"
        />
      </Field>

      {isOurs && (
        <Field label="Link de transmisión (Match Zone)">
          <input
            className={adminInput}
            value={form.stream_url}
            placeholder="https://…"
            onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
          />
        </Field>
      )}

      {match ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado">
              <select
                className={adminInput}
                value={form.phase}
                onChange={(e) => setForm({ ...form, phase: e.target.value })}
              >
                {PHASES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Marcador (L - V)">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  className={adminInput}
                  value={form.home_score}
                  onChange={(e) => setForm({ ...form, home_score: Number(e.target.value) })}
                />
                <input
                  type="number"
                  min={0}
                  className={adminInput}
                  value={form.away_score}
                  onChange={(e) => setForm({ ...form, away_score: Number(e.target.value) })}
                />
              </div>
            </Field>
          </div>

          <Field label="Penales (L - V, opcional)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                className={adminInput}
                value={form.home_pens}
                onChange={(e) => setForm({ ...form, home_pens: e.target.value })}
              />
              <input
                type="number"
                min={0}
                className={adminInput}
                value={form.away_pens}
                onChange={(e) => setForm({ ...form, away_pens: e.target.value })}
              />
            </div>
          </Field>

          <Field label="Link de boletos">
            <input
              className={adminInput}
              value={form.tickets_url}
              onChange={(e) => setForm({ ...form, tickets_url: e.target.value })}
            />
          </Field>
          <Field label="Link de resumen">
            <input
              className={adminInput}
              value={form.highlights_url}
              onChange={(e) => setForm({ ...form, highlights_url: e.target.value })}
            />
          </Field>
        </>
      ) : (
        <Hint>El marcador, los penales y los eventos se capturan después, al editar el partido.</Hint>
      )}

      <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <input
          type="checkbox"
          checked={form.is_featured}
          onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        Partido destacado (el que aparece en Inicio y Match Zone)
      </label>

      {match && (
        <>
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <input
              type="checkbox"
              checked={form.manual_score}
              onChange={(e) => setForm({ ...form, manual_score: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            Marcador manual (si lo desactivas se calcula con los goles del timeline)
          </label>

          <div className="rounded-xl border border-hairline bg-surface-2 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Eventos del timeline
            </p>
            {!events?.length ? (
              <EmptyRow text="Sin eventos." />
            ) : (
              <div className="mb-3 space-y-1.5">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-1 px-2.5 py-1.5"
                  >
                    <span className="font-mono text-xs font-bold tabular-nums text-primary">{e.minute}'</span>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                      {EVENT_TYPES.find((t) => t.value === e.type)?.label ?? e.type}
                      {e.player_name ? ` · ${e.player_name}` : ""}
                      {e.team_id ? ` · ${teamName(e.team_id)}` : ""}
                    </span>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Field label="Minuto">
                <input
                  type="number"
                  className={adminInput}
                  value={ev.minute}
                  onChange={(e) => setEv({ ...ev, minute: e.target.value })}
                />
              </Field>
              <Field label="Tipo">
                <select
                  className={adminInput}
                  value={ev.type}
                  onChange={(e) => setEv({ ...ev, type: e.target.value })}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Equipo">
                <select
                  className={adminInput}
                  value={ev.team_id}
                  onChange={(e) => setEv({ ...ev, team_id: e.target.value })}
                >
                  <option value="">—</option>
                  {[form.home_team_id, form.away_team_id].filter(Boolean).map((id) => (
                    <option key={id} value={id}>
                      {teamName(id)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jugador">
                <input
                  className={adminInput}
                  value={ev.player_name}
                  onChange={(e) => setEv({ ...ev, player_name: e.target.value })}
                />
              </Field>
            </div>
            <button
              onClick={addEvent}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-bold text-foreground hover:border-primary/50"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar evento
            </button>
          </div>
        </>
      )}
    </AdminSheet>
  );
}

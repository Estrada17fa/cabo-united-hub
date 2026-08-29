import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { LcuTabs, LcuButton } from "@/components/ui-lcu";
import { SEASON, useMatches, useScorers, useSeasons, useStandings, useTeams } from "@/hooks/useLeague";
import { useMatchEvents } from "@/hooks/useMatchZone";
import { PHASE_LABEL, EVENT_LABEL, isLivePhase } from "@/components/match-zone/types";
import type { Match, MatchEventType, MatchPhase, Team } from "@/components/match-zone/types";
import { TeamCrest } from "@/components/match-zone/TeamCrest";
import { formatKickoff } from "@/lib/matchClock";

const card = "rounded-2xl border border-border bg-card p-4";
const input =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-primary";
const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

export default function MatchZoneAdmin() {
  const [tab, setTab] = useState("live");

  return (
    <div className="space-y-4">
      <LcuTabs
        layoutId="mz-admin"
        value={tab}
        onChange={setTab}
        variant="underline"
        items={[
          { id: "live", label: "En vivo" },
          { id: "matches", label: "Partidos" },
          { id: "teams", label: "Equipos" },
          { id: "standings", label: "Posiciones" },
          { id: "scorers", label: "Goleo" },
          { id: "tournament", label: "Torneo" },
        ]}
      />
      {tab === "live" && <LiveTab />}
      {tab === "matches" && <MatchesTab />}
      {tab === "teams" && <TeamsTab />}
      {tab === "standings" && <StandingsTab />}
      {tab === "scorers" && <ScorersTab />}
      {tab === "tournament" && <TournamentTab />}
    </div>
  );
}

/* ---------------------------------- utils --------------------------------- */

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["lcu-matches"] });
    qc.invalidateQueries({ queryKey: ["lcu-teams"] });
    qc.invalidateQueries({ queryKey: ["lcu-standings"] });
    qc.invalidateQueries({ queryKey: ["lcu-scorers"] });
  };
}

const teamLabel = (t?: Team | null) => t?.short_name || t?.name || "—";

/* --------------------------------- En vivo -------------------------------- */

const PHASES: MatchPhase[] = ["scheduled", "first_half", "halftime", "second_half", "finished"];

function LiveTab() {
  const { data: matches = [] } = useMatches();
  const invalidate = useInvalidate();
  const [id, setId] = useState("");

  const active = useMemo(
    () => matches.find((m) => m.id === id) ?? matches.find((m) => isLivePhase(m.phase)) ?? matches.find((m) => m.phase === "scheduled"),
    [matches, id]
  );

  const { data: events = [] } = useMatchEvents(active?.id);
  const [stream, setStream] = useState("");
  const [stoppage, setStoppage] = useState(0);

  useEffect(() => {
    setStream(active?.stream_url ?? "");
    setStoppage(active?.stoppage_minutes ?? 0);
  }, [active?.id]);

  const patch = async (values: Partial<Match>) => {
    if (!active) return;
    const { error } = await supabase.from("matches").update(values as never).eq("id", active.id);
    if (error) return toast.error(error.message);
    invalidate();
    toast.success("Actualizado");
  };

  const setPhase = (phase: MatchPhase) => {
    const now = new Date().toISOString();
    const extra: Partial<Match> = { phase };
    if (phase === "first_half" && !active?.first_half_started_at) extra.first_half_started_at = now;
    if (phase === "second_half" && !active?.second_half_started_at) extra.second_half_started_at = now;
    patch(extra);
  };

  const setFeatured = async () => {
    if (!active) return;
    await supabase.from("matches").update({ is_featured: false } as never).eq("season", SEASON);
    await patch({ is_featured: true });
  };

  if (!matches.length)
    return <p className={`${card} text-sm text-muted-foreground`}>Crea primero un partido en la pestaña Partidos.</p>;

  return (
    <div className="space-y-4">
      <div className={card}>
        <label className={label}>Partido a controlar</label>
        <select className={input} value={active?.id ?? ""} onChange={(e) => setId(e.target.value)}>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {teamLabel(m.home_team)} vs {teamLabel(m.away_team)} · {formatKickoff(m.kickoff_at).date}
            </option>
          ))}
        </select>
      </div>

      {active && (
        <>
          <div className={card}>
            <p className={label}>Fase del partido</p>
            <div className="flex flex-wrap gap-2">
              {PHASES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPhase(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active.phase === p
                      ? "bg-brand-primary text-background"
                      : "bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {PHASE_LABEL[p]}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div className="w-32">
                <label className={label}>Compensación</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={stoppage}
                  onChange={(e) => setStoppage(Number(e.target.value))}
                />
              </div>
              <LcuButton size="sm" onClick={() => patch({ stoppage_minutes: stoppage })}>
                <Save className="mr-1 h-3.5 w-3.5" /> Guardar
              </LcuButton>
              <LcuButton size="sm" variant="ghost" onClick={setFeatured}>
                {active.is_featured ? "Destacado" : "Destacar"}
              </LcuButton>
            </div>
          </div>

          <div className={card}>
            <p className={label}>Marcador</p>
            <div className="flex items-center gap-3">
              <ScoreStep
                team={active.home_team}
                value={active.home_score}
                onChange={(v) => patch({ home_score: v, manual_score: true })}
              />
              <span className="text-muted-foreground">-</span>
              <ScoreStep
                team={active.away_team}
                value={active.away_score}
                onChange={(v) => patch({ away_score: v, manual_score: true })}
              />
            </div>
            {active.phase === "finished" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className={label}>Penales local</label>
                  <input
                    type="number"
                    className={input}
                    defaultValue={active.home_pens ?? ""}
                    onBlur={(e) =>
                      patch({ home_pens: e.target.value === "" ? null : Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className={label}>Penales visita</label>
                  <input
                    type="number"
                    className={input}
                    defaultValue={active.away_pens ?? ""}
                    onBlur={(e) =>
                      patch({ away_pens: e.target.value === "" ? null : Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className={card}>
            <label className={label}>Link de transmisión (YouTube / Facebook)</label>
            <div className="flex gap-2">
              <input className={input} value={stream} onChange={(e) => setStream(e.target.value)} />
              <LcuButton size="sm" onClick={() => patch({ stream_url: stream.trim() || null })}>
                <Save className="h-3.5 w-3.5" />
              </LcuButton>
            </div>
          </div>

          <EventsEditor match={active} events={events} />
        </>
      )}
    </div>
  );
}

function ScoreStep({
  team,
  value,
  onChange,
}: {
  team?: Team | null;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <TeamCrest team={team} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {teamLabel(team)}
      </span>
      <button
        className="h-8 w-8 rounded-full bg-white/5 text-foreground"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        −
      </button>
      <span className="w-6 text-center text-lg font-bold tabular-nums text-foreground">{value}</span>
      <button
        className="h-8 w-8 rounded-full bg-brand-primary/15 text-brand-primary"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

const EVENT_TYPES = Object.keys(EVENT_LABEL) as MatchEventType[];

function EventsEditor({ match, events }: { match: Match; events: { id: string; minute: number; type: MatchEventType; player_name: string | null; team_id: string | null }[] }) {
  const invalidate = useInvalidate();
  const [form, setForm] = useState({
    minute: 1,
    type: "goal" as MatchEventType,
    team_id: match.home_team_id,
    player_name: "",
    description: "",
  });

  const add = async () => {
    const { error } = await supabase.from("match_events").insert({
      match_id: match.id,
      minute: form.minute,
      type: form.type,
      team_id: form.team_id,
      player_name: form.player_name.trim() || null,
      description: form.description.trim() || null,
    } as never);
    if (error) return toast.error(error.message);
    setForm({ ...form, player_name: "", description: "" });
    invalidate();
    toast.success("Evento agregado");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("match_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  return (
    <div className={card}>
      <p className={label}>Línea del tiempo</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Minuto</label>
          <input
            type="number"
            min={0}
            className={input}
            value={form.minute}
            onChange={(e) => setForm({ ...form, minute: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={label}>Tipo</label>
          <select
            className={input}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as MatchEventType })}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Equipo</label>
          <select
            className={input}
            value={form.team_id}
            onChange={(e) => setForm({ ...form, team_id: e.target.value })}
          >
            <option value={match.home_team_id}>{teamLabel(match.home_team)}</option>
            <option value={match.away_team_id}>{teamLabel(match.away_team)}</option>
          </select>
        </div>
        <div>
          <label className={label}>Jugador</label>
          <input
            className={input}
            value={form.player_name}
            onChange={(e) => setForm({ ...form, player_name: e.target.value })}
          />
        </div>
      </div>
      <LcuButton className="mt-3 w-full" size="sm" onClick={add}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar evento
      </LcuButton>

      <ul className="mt-3 divide-y divide-border">
        {events.map((e) => (
          <li key={e.id} className="flex items-center gap-2 py-2 text-sm">
            <span className="w-8 tabular-nums text-muted-foreground">{e.minute}'</span>
            <span className="flex-1 truncate text-foreground">
              {EVENT_LABEL[e.type]} {e.player_name ? `· ${e.player_name}` : ""}
            </span>
            <button onClick={() => remove(e.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- Partidos -------------------------------- */

const emptyMatch = {
  matchday: 1,
  group_name: "",
  stage: "regular" as const,
  home_team_id: "",
  away_team_id: "",
  kickoff_at: "",
  venue: "",
  tickets_url: "",
};

function MatchesTab() {
  const { data: teams = [] } = useTeams();
  const { data: matches = [], isLoading } = useMatches();
  const invalidate = useInvalidate();
  const [form, setForm] = useState(emptyMatch);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!form.home_team_id || !form.away_team_id || !form.kickoff_at)
      return toast.error("Equipos y fecha son obligatorios");
    if (form.home_team_id === form.away_team_id) return toast.error("Elige equipos distintos");
    setBusy(true);
    const { error } = await supabase.from("matches").insert({
      season: SEASON,
      matchday: form.matchday,
      group_name: form.group_name || null,
      stage: form.stage,
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      kickoff_at: new Date(form.kickoff_at).toISOString(),
      venue: form.venue || null,
      tickets_url: form.tickets_url || null,
    } as never);
    setBusy(false);
    if (error) return toast.error(error.message);
    setForm(emptyMatch);
    invalidate();
    toast.success("Partido creado");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <p className={label}>Nuevo partido</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>Local</label>
            <select
              className={input}
              value={form.home_team_id}
              onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
            >
              <option value="">Selecciona</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Visita</label>
            <select
              className={input}
              value={form.away_team_id}
              onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
            >
              <option value="">Selecciona</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Fecha y hora</label>
            <input
              type="datetime-local"
              className={input}
              value={form.kickoff_at}
              onChange={(e) => setForm({ ...form, kickoff_at: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Jornada</label>
            <input
              type="number"
              min={1}
              className={input}
              value={form.matchday}
              onChange={(e) => setForm({ ...form, matchday: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={label}>Grupo</label>
            <input
              className={input}
              placeholder="A / B"
              value={form.group_name}
              onChange={(e) => setForm({ ...form, group_name: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Fase</label>
            <select
              className={input}
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value as "regular" })}
            >
              <option value="regular">Regular</option>
              <option value="final">Fase final</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={label}>Sede</label>
            <input
              className={input}
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className={label}>Link de boletos (solo local)</label>
            <input
              className={input}
              value={form.tickets_url}
              onChange={(e) => setForm({ ...form, tickets_url: e.target.value })}
            />
          </div>
        </div>
        <LcuButton className="mt-3 w-full" onClick={create} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
          Crear partido
        </LcuButton>
      </div>

      <div className={card}>
        <p className={label}>Calendario ({matches.length})</p>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />}
        <ul className="divide-y divide-border">
          {matches.map((m) => (
            <li key={m.id} className="flex items-center gap-2 py-2.5 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {teamLabel(m.home_team)} {m.home_score}-{m.away_score} {teamLabel(m.away_team)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatKickoff(m.kickoff_at).date} · {PHASE_LABEL[m.phase]}
                  {m.matchday ? ` · J${m.matchday}` : ""}
                </p>
              </div>
              <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --------------------------------- Equipos -------------------------------- */

function TeamsTab() {
  const { data: teams = [] } = useTeams();
  const invalidate = useInvalidate();
  const [form, setForm] = useState({ name: "", short_name: "", city: "", group_name: "", logo_url: "" });

  const create = async () => {
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    const { error } = await supabase.from("teams").insert({
      season: SEASON,
      name: form.name.trim(),
      short_name: form.short_name.trim() || null,
      city: form.city.trim() || null,
      group_name: form.group_name.trim() || null,
      logo_url: form.logo_url.trim() || null,
    } as never);
    if (error) return toast.error(error.message);
    setForm({ name: "", short_name: "", city: "", group_name: "", logo_url: "" });
    invalidate();
    toast.success("Equipo creado");
  };

  const markOurs = async (id: string) => {
    await supabase.from("teams").update({ is_ours: false } as never).eq("season", SEASON);
    const { error } = await supabase.from("teams").update({ is_ours: true } as never).eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
    toast.success("Equipo propio actualizado");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <p className={label}>Nuevo equipo</p>
        <div className="grid grid-cols-2 gap-2">
          <input className={input} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={input} placeholder="Nombre corto" value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} />
          <input className={input} placeholder="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className={input} placeholder="Grupo (A/B)" value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })} />
          <input className={`${input} col-span-2`} placeholder="URL del escudo" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
        </div>
        <LcuButton className="mt-3 w-full" onClick={create}>
          <Plus className="mr-1 h-4 w-4" /> Crear equipo
        </LcuButton>
      </div>

      <div className={card}>
        <p className={label}>Equipos ({teams.length})</p>
        <ul className="divide-y divide-border">
          {teams.map((t) => (
            <li key={t.id} className="flex items-center gap-2 py-2.5">
              <TeamCrest team={t} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {t.name}
                {t.group_name ? ` · ${t.group_name}` : ""}
              </span>
              <button
                onClick={() => markOurs(t.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  t.is_ours ? "bg-brand-primary/15 text-brand-primary" : "bg-white/5 text-muted-foreground"
                }`}
              >
                {t.is_ours ? "Nuestro" : "Marcar nuestro"}
              </button>
              <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------- Posiciones -------------------------------- */

function StandingsTab() {
  const { data: standings = [] } = useStandings();
  const invalidate = useInvalidate();
  const [busy, setBusy] = useState(false);

  const recalc = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("admin_recalculate_standings", { _season: SEASON });
    setBusy(false);
    if (error) return toast.error(error.message);
    invalidate();
    toast.success("Tabla recalculada");
  };

  const adjust = async (id: string, value: number, note: string) => {
    const { error } = await supabase
      .from("league_standings")
      .update({ manual_adjustment: value, adjustment_note: note || null } as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
    toast.success("Ajuste guardado");
  };

  return (
    <div className={card}>
      <div className="mb-3 flex items-center justify-between">
        <p className={`${label} mb-0`}>Tabla calculada</p>
        <LcuButton size="sm" variant="ghost" onClick={recalc} disabled={busy}>
          <RefreshCw className={`mr-1 h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} /> Recalcular
        </LcuButton>
      </div>
      <p className="mb-3 text-[11px] text-muted-foreground">
        Los puntos se calculan solos con el reglamento del torneo. Usa el ajuste manual solo para sanciones.
      </p>
      <ul className="divide-y divide-border">
        {standings.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 py-2.5">
            <span className="w-5 text-xs font-bold tabular-nums text-muted-foreground">{i + 1}</span>
            <TeamCrest team={s.team} size="sm" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {teamLabel(s.team)}
            </span>
            <span className="text-xs text-muted-foreground">
              {s.played}J · {s.goal_diff > 0 ? "+" : ""}
              {s.goal_diff}
            </span>
            <input
              type="number"
              defaultValue={s.manual_adjustment}
              className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
              onBlur={(e) => adjust(s.id, Number(e.target.value), s.adjustment_note ?? "")}
            />
            <span className="w-8 text-right text-sm font-bold tabular-nums text-foreground">{s.points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------- Goleo --------------------------------- */

function ScorersTab() {
  const { data: scorers = [] } = useScorers();
  const { data: teams = [] } = useTeams();
  const invalidate = useInvalidate();
  const [form, setForm] = useState({ player_name: "", team_id: "", goals: 1, assists: 0 });

  const save = async () => {
    if (!form.player_name.trim()) return toast.error("Nombre del jugador requerido");
    const { error } = await supabase.from("top_scorers").insert({
      season: SEASON,
      player_name: form.player_name.trim(),
      team_id: form.team_id || null,
      goals: form.goals,
      assists: form.assists,
    } as never);
    if (error) return toast.error(error.message);
    setForm({ player_name: "", team_id: "", goals: 1, assists: 0 });
    invalidate();
    toast.success("Goleador guardado");
  };

  const update = async (id: string, values: { goals?: number; assists?: number }) => {
    const { error } = await supabase.from("top_scorers").update(values as never).eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("top_scorers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <p className={label}>Agregar goleador</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={`${input} col-span-2`}
            placeholder="Jugador"
            value={form.player_name}
            onChange={(e) => setForm({ ...form, player_name: e.target.value })}
          />
          <select className={input} value={form.team_id} onChange={(e) => setForm({ ...form, team_id: e.target.value })}>
            <option value="">Equipo</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              className={input}
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: Number(e.target.value) })}
            />
            <input
              type="number"
              min={0}
              className={input}
              value={form.assists}
              onChange={(e) => setForm({ ...form, assists: Number(e.target.value) })}
            />
          </div>
        </div>
        <LcuButton className="mt-3 w-full" onClick={save}>
          <Plus className="mr-1 h-4 w-4" /> Guardar
        </LcuButton>
      </div>

      <div className={card}>
        <p className={label}>Goleo ({scorers.length})</p>
        <ul className="divide-y divide-border">
          {scorers.map((s) => (
            <li key={s.id} className="flex items-center gap-2 py-2.5">
              <TeamCrest team={s.team} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {s.player_name}
              </span>
              <input
                type="number"
                defaultValue={s.goals}
                className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                onBlur={(e) => update(s.id, { goals: Number(e.target.value) })}
              />
              <input
                type="number"
                defaultValue={s.assists}
                className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                onBlur={(e) => update(s.id, { assists: Number(e.target.value) })}
              />
              <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --------------------------------- Torneo --------------------------------- */

function TournamentTab() {
  const { data: seasons = [] } = useSeasons();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    season_key: SEASON,
    start_date: "",
    end_date: "",
    status: "active",
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["lcu-seasons"] });

  const create = async () => {
    if (!form.name.trim()) return toast.error("Nombre del torneo requerido");
    if (!form.season_key.trim()) return toast.error("Clave de temporada requerida");
    const { error } = await supabase.from("seasons").insert({
      name: form.name.trim(),
      season_key: form.season_key.trim(),
      start_date: form.start_date || new Date().toISOString().slice(0, 10),
      end_date: form.end_date || new Date().toISOString().slice(0, 10),
      cc_reset_date: form.end_date || new Date().toISOString().slice(0, 10),
      status: form.status,
    } as never);
    if (error) return toast.error(error.message);
    setForm({ name: "", season_key: SEASON, start_date: "", end_date: "", status: "active" });
    refresh();
    toast.success("Torneo creado");
  };

  const update = async (id: string, values: Record<string, unknown>) => {
    const { error } = await supabase.from("seasons").update(values as never).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
    toast.success("Torneo actualizado");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("seasons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <p className={label}>Nuevo torneo</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={`${input} col-span-2`}
            placeholder="Nombre visible (ej. Primera Premier)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={input}
            placeholder="Clave de temporada"
            value={form.season_key}
            onChange={(e) => setForm({ ...form, season_key: e.target.value })}
          />
          <select
            className={input}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="upcoming">Próximo</option>
            <option value="active">Activo</option>
            <option value="closed">Cerrado</option>
          </select>
          <input
            type="date"
            className={input}
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <input
            type="date"
            className={input}
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          La clave de temporada debe coincidir con la de equipos y partidos ({SEASON}) para que la
          liga muestre los datos correctos.
        </p>
        <LcuButton className="mt-3 w-full" onClick={create}>
          <Plus className="mr-1 h-4 w-4" /> Crear torneo
        </LcuButton>
      </div>

      <div className={card}>
        <p className={label}>Torneos ({seasons.length})</p>
        <ul className="divide-y divide-border">
          {seasons.map((s) => (
            <li key={s.id} className="space-y-2 py-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={`${input} col-span-2`}
                  defaultValue={s.name}
                  onBlur={(e) => e.target.value !== s.name && update(s.id, { name: e.target.value })}
                />
                <input
                  className={input}
                  defaultValue={s.season_key ?? ""}
                  placeholder="Clave"
                  onBlur={(e) =>
                    e.target.value !== (s.season_key ?? "") &&
                    update(s.id, { season_key: e.target.value || null })
                  }
                />
                <select
                  className={input}
                  defaultValue={s.status}
                  onChange={(e) => update(s.id, { status: e.target.value })}
                >
                  <option value="upcoming">Próximo</option>
                  <option value="active">Activo</option>
                  <option value="reset_warning">Aviso de reinicio</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {s.start_date} → {s.end_date}
                </span>
                <LcuButton size="sm" variant="ghost" onClick={() => remove(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </LcuButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

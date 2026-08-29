import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ListOrdered,
  Loader2,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Shield,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getEmbedUrl } from "@/lib/streamUrl";
import {
  PHASE_LABEL,
  STALE_PHASE_MINUTES,
  formatMatchClock,
  type MatchPhase,
} from "@/hooks/useLiveMatch";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<"matches">;
type MatchEvent = Tables<"match_events">;
type Team = Tables<"teams">;
type Standing = Tables<"league_standings">;
type Scorer = Tables<"top_scorers">;

const DEFAULT_SEASON = "2025-2026";


const TABS = [
  { id: "envivo", label: "En vivo", icon: Radio },
  { id: "equipos", label: "Equipos", icon: Shield },
  { id: "partidos", label: "Partidos", icon: CalendarDays },
  { id: "posiciones", label: "Posiciones", icon: ListOrdered },
  { id: "goleo", label: "Goleo", icon: Target },
];

const PHASES: MatchPhase[] = ["scheduled", "first_half", "halftime", "second_half", "finished"];

const EVENT_TYPES: { id: MatchEvent["event_type"]; label: string }[] = [
  { id: "goal", label: "Gol" },
  { id: "own_goal", label: "Autogol" },
  { id: "penalty", label: "Penal" },
  { id: "yellow_card", label: "Amarilla" },
  { id: "red_card", label: "Roja" },
  { id: "substitution", label: "Cambio" },
];

export default function MatchZoneAdmin() {
  const [tab, setTab] = useState("envivo");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "envivo" && <LiveControls />}
      {tab === "equipos" && <TeamsControls />}
      {tab === "partidos" && <LeagueControls />}
      {tab === "posiciones" && <StandingsControls />}
      {tab === "goleo" && <ScorersControls />}
    </div>
  );
}


/* ---------------------------------- EN VIVO --------------------------------- */

function LiveControls() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [stoppage, setStoppage] = useState("0");
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const loadMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false })
      .limit(60);
    if (error) {
      toast.error("No se pudieron cargar los partidos", { description: error.message });
      setLoading(false);
      return;
    }
    setMatches(data ?? []);
    setLoading(false);
    setSelectedId((prev) => prev ?? data?.[0]?.id ?? null);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const selected = useMemo(
    () => matches.find((m) => m.id === selectedId) ?? null,
    [matches, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    setStreamUrl(selected.live_stream_url ?? "");
    setHomeScore(String(selected.home_score ?? 0));
    setAwayScore(String(selected.away_score ?? 0));
    setStoppage(String(selected.stoppage_minutes ?? 0));
  }, [selected?.id]);

  useEffect(() => {
    if (!selectedId) return;
    supabase
      .from("match_events")
      .select("*")
      .eq("match_id", selectedId)
      .order("minute", { ascending: true })
      .then(({ data }) => setEvents(data ?? []));
  }, [selectedId]);

  const patchMatch = async (patch: Partial<Match>, successMsg: string) => {
    if (!selectedId) return;
    setSaving(true);
    const { error } = await supabase.from("matches").update(patch).eq("id", selectedId);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar", { description: error.message });
      return;
    }
    toast.success(successMsg);
    await loadMatches();
  };

  const embed = getEmbedUrl(streamUrl);
  const phase = (selected?.phase ?? "scheduled") as MatchPhase;

  // Aviso interno: partido abierto demasiado tiempo (solo admin)
  const staleMinutes = (() => {
    if (!selected) return 0;
    const ref =
      phase === "first_half"
        ? selected.first_half_started_at
        : phase === "second_half"
          ? selected.second_half_started_at
          : null;
    if (!ref) return 0;
    return Math.floor((now - new Date(ref).getTime()) / 60_000);
  })();
  const isStale = staleMinutes > STALE_PHASE_MINUTES;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de partido */}
      <Section title="Partido destacado">
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full h-10 rounded-xl bg-background border border-border px-3 text-sm text-foreground"
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.match_date} · {m.home_team} vs {m.away_team} ({PHASE_LABEL[(m.phase ?? "scheduled") as MatchPhase]})
            </option>
          ))}
        </select>
      </Section>

      {selected && (
        <>
          {isStale && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-200">
                Este partido lleva {staleMinutes} minutos reales en {PHASE_LABEL[phase]} sin
                actualizarse. Recuerda cerrarlo (Finalizado) para que el reloj deje de correr.
              </p>
            </div>
          )}

          {/* Fases */}
          <Section
            title="Fase del partido"
            subtitle={`Estado actual: ${PHASE_LABEL[phase]}${
              formatMatchClock(selected, now) ? ` · ${formatMatchClock(selected, now)}` : ""
            }`}
          >
            <div className="flex flex-wrap gap-2">
              {PHASES.map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === phase ? "default" : "outline"}
                  disabled={saving}
                  onClick={() =>
                    patchMatch(
                      {
                        phase: p,
                        ...(p === "first_half" && !selected.first_half_started_at
                          ? { first_half_started_at: new Date().toISOString() }
                          : {}),
                        ...(p === "second_half" && !selected.second_half_started_at
                          ? { second_half_started_at: new Date().toISOString() }
                          : {}),
                      },
                      `Fase actualizada: ${PHASE_LABEL[p]}`,
                    )
                  }
                  className="rounded-full text-xs"
                >
                  {PHASE_LABEL[p]}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs"
                disabled={saving}
                onClick={() =>
                  patchMatch(
                    { first_half_started_at: new Date().toISOString(), phase: "first_half" },
                    "Cronómetro de la 1ª parte reiniciado",
                  )
                }
              >
                Reiniciar reloj 1ª parte
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs"
                disabled={saving}
                onClick={() =>
                  patchMatch(
                    { second_half_started_at: new Date().toISOString(), phase: "second_half" },
                    "Cronómetro de la 2ª parte reiniciado",
                  )
                }
              >
                Reiniciar reloj 2ª parte
              </Button>
            </div>

            <div className="flex items-end gap-2 pt-2">
              <div className="w-32">
                <Label className="text-[11px] text-muted-foreground">Compensación (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={stoppage}
                  onChange={(e) => setStoppage(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                disabled={saving}
                onClick={() =>
                  patchMatch(
                    { stoppage_minutes: Number(stoppage) || 0 },
                    "Tiempo de compensación guardado",
                  )
                }
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Guardar
              </Button>
            </div>
          </Section>

          {/* Marcador */}
          <Section title="Marcador">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-[11px] text-muted-foreground">{selected.home_team}</Label>
                <Input
                  type="number"
                  min={0}
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label className="text-[11px] text-muted-foreground">{selected.away_team}</Label>
                <Input
                  type="number"
                  min={0}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                />
              </div>
              <Button
                disabled={saving}
                onClick={() =>
                  patchMatch(
                    {
                      home_score: Number(homeScore) || 0,
                      away_score: Number(awayScore) || 0,
                    },
                    "Marcador actualizado",
                  )
                }
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Guardar
              </Button>
            </div>
          </Section>

          {/* Stream */}
          <Section title="Transmisión en vivo" subtitle="Link de YouTube o Facebook">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://www.youtube.com/live/..."
                />
              </div>
              <Button
                disabled={saving}
                onClick={() =>
                  patchMatch(
                    { live_stream_url: streamUrl.trim() || null },
                    "Link de transmisión guardado",
                  )
                }
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Guardar
              </Button>
            </div>
            {streamUrl.trim() &&
              (embed ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black mt-3">
                  <iframe
                    src={embed.embedUrl}
                    title="Vista previa"
                    className="absolute inset-0 w-full h-full"
                    frameBorder={0}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-xs text-destructive pt-2">
                  Link no reconocido. Usa una URL pública de YouTube o Facebook.
                </p>
              ))}
          </Section>

          {/* Eventos */}
          <Section title="Eventos del partido" subtitle="Alimentan la línea de tiempo pública">
            <EventForm
              matchId={selected.id}
              homeTeam={selected.home_team}
              awayTeam={selected.away_team}
              onCreated={(ev) => setEvents((prev) => [...prev, ev].sort((a, b) => a.minute - b.minute))}
            />
            <div className="divide-y divide-border/60 mt-3">
              {events.length === 0 && (
                <p className="text-xs text-muted-foreground py-3">Sin eventos registrados.</p>
              )}
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 py-2 text-xs">
                  <span className="w-10 font-bold tabular-nums text-primary">{ev.minute}'</span>
                  <span className="font-semibold text-foreground">
                    {EVENT_TYPES.find((t) => t.id === ev.event_type)?.label ?? ev.event_type}
                  </span>
                  <span className="text-muted-foreground truncate flex-1">
                    {[ev.player_name, ev.team].filter(Boolean).join(" · ")}
                  </span>
                  <button
                    onClick={async () => {
                      const { error } = await supabase.from("match_events").delete().eq("id", ev.id);
                      if (error) {
                        toast.error("No se pudo borrar", { description: error.message });
                        return;
                      }
                      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
                      toast.success("Evento eliminado");
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Eliminar evento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function EventForm({
  matchId,
  homeTeam,
  awayTeam,
  onCreated,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  onCreated: (ev: MatchEvent) => void;
}) {
  const [minute, setMinute] = useState("");
  const [type, setType] = useState<MatchEvent["event_type"]>("goal");
  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState(homeTeam);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const min = Number(minute);
    if (!min || min < 1) {
      toast.error("Captura el minuto del evento");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("match_events")
      .insert({
        match_id: matchId,
        minute: min,
        event_type: type,
        player_name: player.trim() || null,
        team,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("No se pudo agregar", { description: error.message });
      return;
    }
    onCreated(data as MatchEvent);
    setMinute("");
    setPlayer("");
    toast.success("Evento agregado");
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 items-end">
      <div>
        <Label className="text-[11px] text-muted-foreground">Minuto</Label>
        <Input type="number" min={1} value={minute} onChange={(e) => setMinute(e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] text-muted-foreground">Tipo</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MatchEvent["event_type"])}
          className="w-full h-10 rounded-xl bg-background border border-border px-2 text-sm text-foreground"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-[11px] text-muted-foreground">Jugador</Label>
        <Input value={player} onChange={(e) => setPlayer(e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] text-muted-foreground">Equipo</Label>
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="w-full h-10 rounded-xl bg-background border border-border px-2 text-sm text-foreground"
        >
          <option value={homeTeam}>{homeTeam}</option>
          <option value={awayTeam}>{awayTeam}</option>
        </select>
      </div>
      <Button onClick={submit} disabled={saving} className="w-full">
        <Plus className="w-3.5 h-3.5 mr-1.5" />
        Agregar
      </Button>
    </div>
  );
}

/* ----------------------------------- EQUIPOS ---------------------------------- */

function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from("teams").select("*").order("name");
    if (error) toast.error("No se pudieron cargar los equipos", { description: error.message });
    setTeams(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const ourTeam = useMemo(() => teams.find((t) => t.is_ours)?.name ?? "Los Cabos United", [teams]);

  return { teams, loading, reload: load, ourTeam };
}

function TeamsControls() {
  const { teams, loading, reload } = useTeams();
  const [form, setForm] = useState({ name: "", short_name: "", group_name: "", season: DEFAULT_SEASON });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!form.name.trim()) return toast.error("El nombre del equipo es obligatorio");
    setSaving(true);
    const { error } = await supabase.from("teams").insert({
      name: form.name.trim(),
      short_name: form.short_name.trim() || null,
      group_name: form.group_name.trim() || null,
      season: form.season.trim() || DEFAULT_SEASON,
    });
    setSaving(false);
    if (error) return toast.error("No se pudo crear el equipo", { description: error.message });
    toast.success("Equipo creado");
    setForm({ name: "", short_name: "", group_name: "", season: form.season });
    reload();
  };

  const markOurs = async (id: string) => {
    const { error: clearError } = await supabase
      .from("teams")
      .update({ is_ours: false })
      .eq("is_ours", true);
    if (clearError) return toast.error("No se pudo actualizar", { description: clearError.message });
    const { error } = await supabase.from("teams").update({ is_ours: true }).eq("id", id);
    if (error) return toast.error("No se pudo actualizar", { description: error.message });
    toast.success("Equipo propio actualizado");
    reload();
  };

  return (
    <div className="space-y-4">
      <Section title="Nuevo equipo" subtitle="Alimenta escudos, grupos y selectores de partidos">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Nombre corto">
            <Input
              value={form.short_name}
              onChange={(e) => setForm({ ...form, short_name: e.target.value })}
            />
          </Field>
          <Field label="Grupo">
            <Input
              value={form.group_name}
              placeholder="A / B"
              onChange={(e) => setForm({ ...form, group_name: e.target.value })}
            />
          </Field>
          <Field label="Temporada">
            <Input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} />
          </Field>
        </div>
        <div className="pt-3">
          <Button onClick={create} disabled={saving}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Crear equipo
          </Button>
        </div>
      </Section>

      <Section title="Equipos registrados" subtitle="Marca cuál es nuestro club y edita escudos">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {teams.map((t) => (
              <TeamRow key={t.id} team={t} onChanged={reload} onMarkOurs={markOurs} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function TeamRow({
  team,
  onChanged,
  onMarkOurs,
}: {
  team: Team;
  onChanged: () => void;
  onMarkOurs: (id: string) => void;
}) {
  const [logo, setLogo] = useState(team.logo_url ?? "");
  const [group, setGroup] = useState(team.group_name ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("teams")
      .update({ logo_url: logo.trim() || null, group_name: group.trim() || null })
      .eq("id", team.id);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Equipo actualizado");
    onChanged();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
      <span className="flex-1 min-w-[140px] font-semibold text-foreground truncate">
        {team.name}
        {team.is_ours && (
          <span className="ml-2 rounded-full bg-primary/15 px-2 py-px text-[10px] font-bold text-primary">
            Nuestro
          </span>
        )}
      </span>
      <Input
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        placeholder="Grupo"
        className="w-20 h-8"
      />
      <Input
        value={logo}
        onChange={(e) => setLogo(e.target.value)}
        placeholder="URL del escudo"
        className="w-52 h-8"
      />
      <Button size="sm" variant="outline" className="h-8 text-[11px]" disabled={saving} onClick={save}>
        Guardar
      </Button>
      {!team.is_ours && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-[11px]"
          onClick={() => onMarkOurs(team.id)}
        >
          Marcar como nuestro
        </Button>
      )}
      <button
        onClick={async () => {
          const { error } = await supabase.from("teams").delete().eq("id", team.id);
          if (error) return toast.error("No se pudo borrar", { description: error.message });
          toast.success("Equipo eliminado");
          onChanged();
        }}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Eliminar equipo"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ---------------------------------- PARTIDOS ---------------------------------- */

const emptyMatch = {
  home_team: "",
  away_team: "",
  match_date: "",
  match_time: "",
  jornada: "",
  venue: "",
  season: DEFAULT_SEASON,
  group_name: "",
  stage: "regular",
  round_name: "",
};

function LeagueControls() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyMatch });
  const [saving, setSaving] = useState(false);
  const { teams, ourTeam } = useTeams();

  const load = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false })
      .limit(120);
    if (error) toast.error("No se pudieron cargar los partidos", { description: error.message });
    setMatches(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.home_team.trim() || !form.away_team.trim() || !form.match_date) {
      toast.error("Equipos y fecha son obligatorios");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("matches").insert({
      home_team: form.home_team.trim(),
      away_team: form.away_team.trim(),
      match_date: form.match_date,
      match_time: form.match_time || null,
      jornada: form.jornada ? Number(form.jornada) : null,
      venue: form.venue.trim() || null,
      season: form.season,
      group_name: form.group_name.trim() || null,
      stage: form.stage,
      round_name: form.stage === "final" ? form.round_name.trim() || null : null,
      is_home_game: form.home_team.trim() === ourTeam,
      source: "manual",
    });
    setSaving(false);
    if (error) {
      toast.error("No se pudo crear el partido", { description: error.message });
      return;
    }
    toast.success("Partido creado");
    setForm({ ...emptyMatch, season: form.season });
    load();
  };

  return (
    <div className="space-y-4">
      <Section title="Nuevo partido" subtitle="Los puntos se calculan solos al finalizar el partido">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Field label="Local">
            <TeamSelect
              teams={teams}
              value={form.home_team}
              onChange={(v) => setForm({ ...form, home_team: v })}
            />
          </Field>
          <Field label="Visitante">
            <TeamSelect
              teams={teams}
              value={form.away_team}
              onChange={(v) => setForm({ ...form, away_team: v })}
            />
          </Field>
          <Field label="Fecha">
            <Input
              type="date"
              value={form.match_date}
              onChange={(e) => setForm({ ...form, match_date: e.target.value })}
            />
          </Field>
          <Field label="Hora">
            <Input
              type="time"
              value={form.match_time}
              onChange={(e) => setForm({ ...form, match_time: e.target.value })}
            />
          </Field>
          <Field label="Jornada">
            <Input
              type="number"
              value={form.jornada}
              onChange={(e) => setForm({ ...form, jornada: e.target.value })}
            />
          </Field>
          <Field label="Sede">
            <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </Field>
          <Field label="Grupo">
            <Input
              value={form.group_name}
              placeholder="A / B"
              onChange={(e) => setForm({ ...form, group_name: e.target.value })}
            />
          </Field>
          <Field label="Temporada">
            <Input
              value={form.season}
              onChange={(e) => setForm({ ...form, season: e.target.value })}
            />
          </Field>
          <Field label="Etapa">
            <select
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="w-full h-10 rounded-xl bg-background border border-border px-2 text-sm text-foreground"
            >
              <option value="regular">Temporada regular</option>
              <option value="final">Fase final</option>
            </select>
          </Field>
          {form.stage === "final" && (
            <Field label="Ronda">
              <Input
                value={form.round_name}
                placeholder="Cuartos / Semifinal / Final"
                onChange={(e) => setForm({ ...form, round_name: e.target.value })}
              />
            </Field>
          )}
        </div>
        <div className="pt-3">
          <Button onClick={create} disabled={saving}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Crear partido
          </Button>
        </div>
      </Section>

      <Section
        title="Partidos registrados"
        subtitle="Al capturar marcador y marcar Finalizado, la tabla se recalcula automáticamente"
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {matches.map((m) => (
              <LeagueMatchRow key={m.id} match={m} onChanged={load} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function TeamSelect({
  teams,
  value,
  onChange,
}: {
  teams: Team[];
  value: string;
  onChange: (v: string) => void;
}) {
  const names = useMemo(() => Array.from(new Set(teams.map((t) => t.name))).sort(), [teams]);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-xl bg-background border border-border px-2 text-sm text-foreground"
    >
      <option value="">Selecciona…</option>
      {names.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
}

function LeagueMatchRow({ match, onChanged }: { match: Match; onChanged: () => void }) {
  const [home, setHome] = useState(String(match.home_score ?? 0));
  const [away, setAway] = useState(String(match.away_score ?? 0));
  const [homePens, setHomePens] = useState(String(match.home_pens ?? 0));
  const [awayPens, setAwayPens] = useState(String(match.away_pens ?? 0));
  const [phase, setPhase] = useState<MatchPhase>((match.phase ?? "scheduled") as MatchPhase);
  const [saving, setSaving] = useState(false);

  const drawWithPens = Number(home) === Number(away) && Number(home) >= 2;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("matches")
      .update({
        home_score: Number(home) || 0,
        away_score: Number(away) || 0,
        home_pens: drawWithPens ? Number(homePens) || 0 : null,
        away_pens: drawWithPens ? Number(awayPens) || 0 : null,
        phase,
      })
      .eq("id", match.id);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Partido actualizado");
    onChanged();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
      <span className="w-24 text-muted-foreground tabular-nums">{match.match_date}</span>
      <span className="flex-1 min-w-[160px] font-semibold text-foreground truncate">
        {match.home_team} vs {match.away_team}
        {match.group_name && (
          <span className="ml-2 text-[10px] text-muted-foreground">Grupo {match.group_name}</span>
        )}
        {match.stage === "final" && (
          <span className="ml-2 rounded-full bg-primary/15 px-2 py-px text-[10px] font-bold text-primary">
            {match.round_name || "Fase final"}
          </span>
        )}
      </span>
      <Input type="number" min={0} value={home} onChange={(e) => setHome(e.target.value)} className="w-14 h-8" />
      <Input type="number" min={0} value={away} onChange={(e) => setAway(e.target.value)} className="w-14 h-8" />
      {drawWithPens && (
        <span className="flex items-center gap-1">
          <span className="text-[10px] uppercase text-muted-foreground">Pen</span>
          <Input
            type="number"
            min={0}
            value={homePens}
            onChange={(e) => setHomePens(e.target.value)}
            className="w-12 h-8"
          />
          <Input
            type="number"
            min={0}
            value={awayPens}
            onChange={(e) => setAwayPens(e.target.value)}
            className="w-12 h-8"
          />
        </span>
      )}
      <select
        value={phase}
        onChange={(e) => setPhase(e.target.value as MatchPhase)}
        className="h-8 rounded-lg bg-background border border-border px-2 text-[11px] text-foreground"
      >
        {PHASES.map((p) => (
          <option key={p} value={p}>
            {PHASE_LABEL[p]}
          </option>
        ))}
      </select>
      <span className="rounded-full bg-muted/30 px-2 py-px text-[10px] font-bold text-muted-foreground tabular-nums">
        {match.home_points ?? 0}-{match.away_points ?? 0} pts
      </span>
      <Button size="sm" variant="outline" disabled={saving} onClick={save} className="h-8 text-[11px]">
        Guardar
      </Button>
      <button
        onClick={async () => {
          const { error } = await supabase.from("matches").delete().eq("id", match.id);
          if (error) return toast.error("No se pudo borrar", { description: error.message });
          toast.success("Partido eliminado");
          onChanged();
        }}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Eliminar partido"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* --------------------------------- POSICIONES --------------------------------- */

function StandingsControls() {
  const [rows, setRows] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [recalculating, setRecalculating] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("league_standings").select("*").order("pos");
    if (error) toast.error("No se pudo cargar la tabla", { description: error.message });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const recalc = async () => {
    setRecalculating(true);
    const { data, error } = await supabase.rpc("recalculate_standings", { _season: season });
    setRecalculating(false);
    if (error) return toast.error("No se pudo recalcular", { description: error.message });
    toast.success(`Tabla recalculada (${data ?? 0} equipos)`);
    load();
  };

  return (
    <div className="space-y-4">
      <Section
        title="Recalcular tabla"
        subtitle="Local 3 pts · Visita 4 pts (2+ goles) · Empate 2-2 o más a penales"
      >
        <div className="flex items-end gap-2">
          <div className="w-40">
            <Label className="text-[11px] text-muted-foreground">Temporada</Label>
            <Input value={season} onChange={(e) => setSeason(e.target.value)} />
          </div>
          <Button onClick={recalc} disabled={recalculating}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${recalculating ? "animate-spin" : ""}`} />
            Recalcular
          </Button>
        </div>
      </Section>

      <Section title="Ajustes manuales" subtitle="Puntos extra o sanciones que se suman al cálculo automático">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {rows.map((r) => (
              <StandingRowAdmin key={r.id} row={r} onChanged={load} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function StandingRowAdmin({ row, onChanged }: { row: Standing; onChanged: () => void }) {
  const [adjustment, setAdjustment] = useState(String(row.manual_adjustment ?? 0));
  const [note, setNote] = useState(row.adjustment_note ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.rpc("set_standings_adjustment", {
      _season: row.season,
      _team: row.team,
      _adjustment: Number(adjustment) || 0,
      _note: note.trim(),
    });
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Ajuste aplicado");
    onChanged();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
      <span className="w-6 tabular-nums text-muted-foreground">{row.pos}</span>
      <span className="flex-1 min-w-[140px] font-semibold text-foreground truncate">
        {row.team}
        {row.group_name && row.group_name !== "general" && (
          <span className="ml-2 text-[10px] text-muted-foreground">Grupo {row.group_name}</span>
        )}
      </span>
      <span className="text-[11px] text-muted-foreground tabular-nums">
        {row.jj} JJ · {row.pts} pts
      </span>
      <Input
        type="number"
        value={adjustment}
        onChange={(e) => setAdjustment(e.target.value)}
        className="w-16 h-8"
      />
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Motivo"
        className="w-44 h-8"
      />
      <Button size="sm" variant="outline" disabled={saving} onClick={save} className="h-8 text-[11px]">
        <Save className="w-3 h-3 mr-1" />
        Aplicar
      </Button>
    </div>
  );
}

/* ------------------------------------ GOLEO ----------------------------------- */

function ScorersControls() {
  const [rows, setRows] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ player_name: "", team: "", goals: "", season: DEFAULT_SEASON });
  const [saving, setSaving] = useState(false);
  const { teams } = useTeams();

  const load = async () => {
    const { data, error } = await supabase
      .from("top_scorers")
      .select("*")
      .order("goals", { ascending: false });
    if (error) toast.error("No se pudo cargar el goleo", { description: error.message });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.player_name.trim() || !form.team.trim()) {
      return toast.error("Jugador y equipo son obligatorios");
    }
    setSaving(true);
    const { error } = await supabase.from("top_scorers").insert({
      player_name: form.player_name.trim(),
      team: form.team.trim(),
      goals: Number(form.goals) || 0,
      season: form.season,
    });
    setSaving(false);
    if (error) return toast.error("No se pudo agregar", { description: error.message });
    toast.success("Goleador agregado");
    setForm({ player_name: "", team: form.team, goals: "", season: form.season });
    load();
  };

  return (
    <div className="space-y-4">
      <Section title="Nuevo goleador">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Field label="Jugador">
            <Input
              value={form.player_name}
              onChange={(e) => setForm({ ...form, player_name: e.target.value })}
            />
          </Field>
          <Field label="Equipo">
            <TeamSelect teams={teams} value={form.team} onChange={(v) => setForm({ ...form, team: v })} />
          </Field>
          <Field label="Goles">
            <Input
              type="number"
              min={0}
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
            />
          </Field>
          <Field label="Temporada">
            <Input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} />
          </Field>
        </div>
        <div className="pt-3">
          <Button onClick={create} disabled={saving}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Agregar
          </Button>
        </div>
      </Section>

      <Section title="Tabla de goleo">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {rows.map((r) => (
              <ScorerRow key={r.id} row={r} onChanged={load} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function ScorerRow({ row, onChanged }: { row: Scorer; onChanged: () => void }) {
  const [goals, setGoals] = useState(String(row.goals));
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
      <span className="flex-1 min-w-[140px] font-semibold text-foreground truncate">{row.player_name}</span>
      <span className="min-w-[120px] text-muted-foreground truncate">{row.team}</span>
      <Input
        type="number"
        min={0}
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        className="w-16 h-8"
      />
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-[11px]"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const { error } = await supabase
            .from("top_scorers")
            .update({ goals: Number(goals) || 0 })
            .eq("id", row.id);
          setSaving(false);
          if (error) return toast.error("No se pudo guardar", { description: error.message });
          toast.success("Goles actualizados");
          onChanged();
        }}
      >
        Guardar
      </Button>
      <button
        onClick={async () => {
          const { error } = await supabase.from("top_scorers").delete().eq("id", row.id);
          if (error) return toast.error("No se pudo borrar", { description: error.message });
          toast.success("Goleador eliminado");
          onChanged();
        }}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Eliminar goleador"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}


/* --------------------------------- primitives -------------------------------- */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h2>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

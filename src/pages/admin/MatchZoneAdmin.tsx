import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Plus, Radio, Save, Trash2, Trophy } from "lucide-react";
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

const TABS = [
  { id: "envivo", label: "En vivo", icon: Radio },
  { id: "liga", label: "Liga", icon: Trophy },
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
      <div className="flex gap-2">
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

      {tab === "envivo" ? <LiveControls /> : <LeagueControls />}
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

/* ----------------------------------- LIGA ----------------------------------- */

const emptyMatch = {
  home_team: "",
  away_team: "",
  match_date: "",
  match_time: "",
  jornada: "",
  venue: "",
  season: "2025-2026",
  is_home_game: false,
};

function LeagueControls() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyMatch });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false })
      .limit(80);
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
      is_home_game: form.is_home_game,
      source: "manual",
    });
    setSaving(false);
    if (error) {
      toast.error("No se pudo crear el partido", { description: error.message });
      return;
    }
    toast.success("Partido creado");
    setForm({ ...emptyMatch });
    load();
  };

  return (
    <div className="space-y-4">
      <Section title="Nuevo partido" subtitle="Se muestra en el calendario público">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Field label="Local">
            <Input
              value={form.home_team}
              onChange={(e) => setForm({ ...form, home_team: e.target.value })}
            />
          </Field>
          <Field label="Visitante">
            <Input
              value={form.away_team}
              onChange={(e) => setForm({ ...form, away_team: e.target.value })}
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
          <Field label="Temporada">
            <Input
              value={form.season}
              onChange={(e) => setForm({ ...form, season: e.target.value })}
            />
          </Field>
          <Field label="¿Local de LCU?">
            <select
              value={form.is_home_game ? "si" : "no"}
              onChange={(e) => setForm({ ...form, is_home_game: e.target.value === "si" })}
              className="w-full h-10 rounded-xl bg-background border border-border px-2 text-sm text-foreground"
            >
              <option value="no">No</option>
              <option value="si">Sí</option>
            </select>
          </Field>
        </div>
        <div className="pt-3">
          <Button onClick={create} disabled={saving}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Crear partido
          </Button>
        </div>
      </Section>

      <Section title="Partidos registrados">
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

      <p className="text-xs text-muted-foreground">
        La edición de posiciones, goleo y equipos llegará en la siguiente etapa.
      </p>
    </div>
  );
}

function LeagueMatchRow({ match, onChanged }: { match: Match; onChanged: () => void }) {
  const [home, setHome] = useState(String(match.home_score ?? 0));
  const [away, setAway] = useState(String(match.away_score ?? 0));
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
      <span className="w-24 text-muted-foreground tabular-nums">{match.match_date}</span>
      <span className="flex-1 min-w-[160px] font-semibold text-foreground truncate">
        {match.home_team} vs {match.away_team}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {PHASE_LABEL[(match.phase ?? "scheduled") as MatchPhase]}
      </span>
      <Input
        type="number"
        min={0}
        value={home}
        onChange={(e) => setHome(e.target.value)}
        className="w-14 h-8"
      />
      <Input
        type="number"
        min={0}
        value={away}
        onChange={(e) => setAway(e.target.value)}
        className="w-14 h-8"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const { error } = await supabase
            .from("matches")
            .update({ home_score: Number(home) || 0, away_score: Number(away) || 0 })
            .eq("id", match.id);
          setSaving(false);
          if (error) return toast.error("No se pudo guardar", { description: error.message });
          toast.success("Marcador guardado");
          onChanged();
        }}
        className="h-8 text-[11px]"
      >
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
        <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-foreground">
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

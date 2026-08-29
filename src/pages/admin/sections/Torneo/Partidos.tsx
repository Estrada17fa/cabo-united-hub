import { useMemo, useState } from "react";
import { CalendarPlus, Plus, Radio } from "lucide-react";
import { useMatches } from "@/hooks/useLeague";
import type { Match } from "@/components/match-zone/types";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";
import { MatchSheet } from "./MatchSheet";
import { MatchdayBuilder } from "./MatchdayBuilder";

const PHASE_LABEL: Record<string, string> = {
  scheduled: "Programado",
  first_half: "1er tiempo",
  halftime: "Medio tiempo",
  second_half: "2do tiempo",
  finished: "Finalizado",
  postponed: "Pospuesto",
  canceled: "Cancelado",
};

const LIVE = ["first_half", "halftime", "second_half"];

export default function Partidos() {
  const { data: matches, isLoading } = useMatches();
  const [sheet, setSheet] = useState<{ open: boolean; match: Match | null }>({ open: false, match: null });
  const [builder, setBuilder] = useState(false);
  const [filter, setFilter] = useState("all");

  /** Jornadas existentes, ascendentes. */
  const matchdays = useMemo(
    () =>
      [...new Set((matches ?? []).map((m) => m.matchday).filter((n): n is number => n != null))].sort(
        (a, b) => a - b
      ),
    [matches]
  );

  const nextMatchday = (matchdays[matchdays.length - 1] ?? 0) + 1;

  /** Agrupado por jornada ascendente; "Sin jornada" al final. */
  const grouped = useMemo(() => {
    const source = (matches ?? []).filter((m) => {
      if (filter === "all") return true;
      if (filter === "none") return m.matchday == null;
      return m.matchday === Number(filter);
    });

    const map = new Map<number | null, Match[]>();
    source.forEach((m) => {
      const key = m.matchday ?? null;
      map.set(key, [...(map.get(key) ?? []), m]);
    });

    return [...map.entries()]
      .sort((a, b) => {
        if (a[0] == null) return 1;
        if (b[0] == null) return -1;
        return a[0] - b[0];
      })
      .map(([md, list]) => [
        md == null ? "Sin jornada" : `Jornada ${md}`,
        [...list].sort((x, y) => +new Date(x.kickoff_at) - +new Date(y.kickoff_at)),
      ] as [string, Match[]]);
  }, [matches, filter]);

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title={`Partidos (${matches?.length ?? 0})`}
          action={
            <div className="flex gap-2">
              <button
                onClick={() => setBuilder(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-hairline px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/50"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Jornada completa
              </button>
              <button
                onClick={() => setSheet({ open: true, match: null })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> Nuevo partido
              </button>
            </div>
          }
        />
        <Hint className="mb-3">
          Toca cualquier partido para editar marcador, estado en vivo, link de transmisión y eventos del
          timeline.
        </Hint>

        <Field label="Ver jornada" className="mb-4">
          <select className={adminInput} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas las jornadas</option>
            {matchdays.map((md) => (
              <option key={md} value={String(md)}>
                Jornada {md}
              </option>
            ))}
            <option value="none">Sin jornada</option>
          </select>
        </Field>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !grouped.length ? (
          <EmptyRow text="Sin partidos capturados." />
        ) : (
          <div className="space-y-5">
            {grouped.map(([label, list]) => (
              <div key={label}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <div className="space-y-2">
                  {list.map((m) => {
                    const live = LIVE.includes(m.phase);
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSheet({ open: true, match: m })}
                        className="flex w-full items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {m.home_team?.name ?? "?"} <span className="text-muted-foreground">vs</span>{" "}
                            {m.away_team?.name ?? "?"}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {new Date(m.kickoff_at).toLocaleString("es-MX", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {m.venue ? ` · ${m.venue}` : ""}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                          {m.home_score ?? 0}-{m.away_score ?? 0}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            live
                              ? "bg-primary/15 text-primary"
                              : m.phase === "finished"
                                ? "bg-white/5 text-muted-foreground"
                                : "bg-white/5 text-secondary-fg"
                          }`}
                        >
                          {live && <Radio className="h-3 w-3" />}
                          {PHASE_LABEL[m.phase] ?? m.phase}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MatchSheet
        open={sheet.open}
        match={sheet.match}
        defaultMatchday={nextMatchday}
        onOpenChange={(v) => setSheet((s) => ({ ...s, open: v }))}
      />
      <MatchdayBuilder open={builder} onOpenChange={setBuilder} suggestedMatchday={nextMatchday} />
    </div>
  );
}

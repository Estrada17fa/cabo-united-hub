import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClubPlayers, type ClubPlayer } from "@/hooks/useClub";

const GROUPS = [
  { id: "Porteros", match: ["portero", "arquero", "gk"] },
  { id: "Defensas", match: ["defensa", "lateral", "central", "def"] },
  { id: "Mediocampistas", match: ["medio", "volante", "contención", "contencion", "med"] },
  { id: "Delanteros", match: ["delantero", "extremo", "atacante", "del"] },
  { id: "Cuerpo técnico", match: ["técnico", "tecnico", "dt", "auxiliar", "preparador"] },
] as const;

function groupOf(position: string | null): string {
  const p = (position ?? "").toLowerCase();
  const hit = GROUPS.find((g) => g.match.some((m) => p.includes(m)));
  return hit?.id ?? "Plantel";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function ageFrom(birthDate: string): number | null {
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 100 ? age : null;
}

function hasBackData(p: ClubPlayer) {
  return (
    p.goals != null ||
    p.matches_played != null ||
    p.birth_date != null ||
    p.nationality != null ||
    p.birth_place != null
  );
}

function PlayerCard({
  player,
  flipped,
  canHover,
  onFlip,
}: {
  player: ClubPlayer;
  flipped: boolean;
  canHover: boolean;
  onFlip: (id: string | null) => void;
}) {
  const withBack = hasBackData(player);
  const age = player.birth_date ? ageFrom(player.birth_date) : null;

  const rotate = withBack
    ? canHover
      ? "group-hover:[transform:rotateY(180deg)]"
      : flipped
        ? "[transform:rotateY(180deg)]"
        : ""
    : "";

  return (
    <div
      className={cn("group [perspective:1200px]", withBack && !canHover && "cursor-pointer")}
      onClick={(e) => {
        if (!withBack || canHover) return;
        e.stopPropagation();
        onFlip(flipped ? null : player.id);
      }}
    >
      <div
        className={cn(
          "relative aspect-[3/4] w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none",
          rotate
        )}
      >
        {/* Frente */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface-3 [backface-visibility:hidden]">
          <div className="relative min-h-0 flex-1 bg-surface-2">
            {player.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.name}
                loading="lazy"
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="num-display text-3xl text-muted-foreground">
                  {initials(player.name) || <User className="h-6 w-6" />}
                </span>
              </div>
            )}
            {player.jersey_number != null && (
              <span className="num-display absolute left-2 top-2 rounded-lg bg-background/70 px-1.5 py-0.5 text-sm text-primary backdrop-blur">
                {player.jersey_number}
              </span>
            )}
          </div>
          <div className="shrink-0 p-2.5">
            <p className="truncate text-xs font-semibold text-foreground">{player.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {player.position || "Plantel"}
            </p>
            {player.nationality && (
              <p className="truncate text-[10px] text-muted-foreground/80">
                {player.nationality}
              </p>
            )}
          </div>
        </div>

        {/* Reverso */}
        {withBack && (
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface-3 p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="truncate text-[11px] font-semibold text-foreground">
              {player.name}
            </p>
            {(player.goals != null || player.matches_played != null) && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-hairline bg-surface-2 px-1 py-2 text-center">
                  <div className="num-display text-xl leading-none text-primary">
                    {player.goals ?? 0}
                  </div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Goles
                  </div>
                </div>
                <div className="rounded-lg border border-hairline bg-surface-2 px-1 py-2 text-center">
                  <div className="num-display text-xl leading-none text-foreground">
                    {player.matches_played ?? 0}
                  </div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    PJ
                  </div>
                </div>
              </div>
            )}
            <div className="mt-auto space-y-0.5 text-[10px] leading-tight text-muted-foreground">
              {age != null && <p>{age} años</p>}
              {player.nationality && <p className="truncate">{player.nationality}</p>}
              {player.birth_place && (
                <p className="line-clamp-2">{player.birth_place}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Plantel real: lee los jugadores capturados en el panel. */
export function RosterSection() {
  const { data: players = [], isLoading } = useClubPlayers();
  const [active, setActive] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const tabs = useMemo(() => {
    const present = new Set(players.map((p) => groupOf(p.position)));
    const ordered = GROUPS.map((g) => g.id as string).filter((g) => present.has(g));
    if (present.has("Plantel")) ordered.push("Plantel");
    return ordered;
  }, [players]);

  const current = active && tabs.includes(active) ? active : tabs[0] ?? null;
  const rows = players.filter((p) => (current ? groupOf(p.position) === current : true));
  const visible = expanded ? rows : rows.slice(0, 4);

  if (isLoading) {
    return <div className="h-56 rounded-2xl border border-hairline bg-surface-1" />;
  }

  return (
    <section className="rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5">
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Los Cabos United
        </p>
        <h2 className="text-display-md mt-1 text-foreground">Nuestro plantel</h2>
      </div>

      {players.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          El plantel se publicará muy pronto.
        </p>
      ) : (
        <>
          {tabs.length > 1 && (
            <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-hide">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setActive(t);
                    setExpanded(false);
                  }}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                    t === current
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-hairline bg-surface-3 text-muted-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
            {rows
              .slice(visible.length)
              .map((p) => (
                <div key={p.id} className="hidden md:block">
                  <PlayerCard player={p} />
                </div>
              ))}
          </div>

          {rows.length > 4 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mx-auto mt-4 block rounded-xl border border-hairline bg-surface-3 px-3 py-1.5 text-[11px] font-semibold text-secondary-fg md:hidden"
            >
              {expanded ? "Ver menos" : `Ver todos (${rows.length})`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

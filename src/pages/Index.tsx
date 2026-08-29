import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Facebook,
  Gamepad2,
  Gift,
  GraduationCap,
  Instagram,
  MapPin,
  Newspaper,
  Radio,
  ShoppingBag,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { usePlaces } from "@/hooks/useVisitaLosCabos";
import { useCategoryMeta } from "@/hooks/usePlaceCategories";
import {
  useClubNews,
  useClubPlayers,
  useFanPosts,
  useYouthTeam,
  type ClubPlayer,
} from "@/hooks/useClub";
import { useActiveSeason } from "@/hooks/useLeague";
import { useFeaturedMatch } from "@/hooks/useMatchZone";
import { SeasonSummary } from "@/components/club/SeasonSummary";
import { NextMatchCard } from "@/components/match-zone/NextMatchCard";
import { ProductCard } from "@/components/tienda/ProductCard";
import { SectionHeader } from "@/components/ui-lcu/SectionHeader";
import { LcuTabs } from "@/components/ui-lcu/LcuTabs";
import { HomeMiniMap } from "@/components/home/HomeMiniMap";
import { CategoryIcon } from "@/components/visita-los-cabos/CategoryIcon";
import { MiniGameCard } from "@/components/fan-zone/MiniGameCard";
import { GAMES } from "@/components/fan-zone/games";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { AuthModal } from "@/components/auth/AuthModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { lcuButtonClasses } from "@/components/ui-lcu/LcuButton";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";
import prizeJersey from "@/assets/prize-jersey.jpg";
import prizeTickets from "@/assets/prize-tickets.jpg";
import prizeVestuario from "@/assets/prize-vestuario.jpg";

const LIVE_PINK = "#F199C1";

/* --------------------------------- helpers --------------------------------- */

function VerTodo({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
    >
      Ver todo
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function formatNewsDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

/* ----------------------------------- hero ----------------------------------- */

function Hero({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) {
  const { user } = useAuth();
  const { data: season } = useActiveSeason();

  return (
    <section className="relative -mx-4 -mt-4 overflow-hidden md:-mx-6">
      <img
        src={stadiumHero}
        alt="Afición de Los Cabos United en el estadio Don Koll"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Degradado que funde la foto con el fondo de la página */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-12 md:px-6 md:pb-20 md:pt-16">
        <img src={lcuCrest} alt="Escudo de Los Cabos United" className="h-14 w-auto md:h-16" />
        {season?.name && (
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {season.name}
          </p>
        )}
        <h1 className="text-display-lg mt-1.5 max-w-lg text-foreground">
          Tu equipo. Tu paraíso.
        </h1>
        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-secondary-fg">
          Partidos en vivo, tu club, la tienda oficial y los mejores lugares de Los Cabos
          en un solo lugar.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {user ? (
            <Link to="/mi-pase" className={lcuButtonClasses("primary")}>
              <Ticket className="h-4 w-4" />
              Ver mi pase
            </Link>
          ) : (
            <>
              <button type="button" onClick={onSignup} className={lcuButtonClasses("primary")}>
                <Sparkles className="h-4 w-4" />
                Obtener mi pase
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="text-xs font-semibold text-secondary-fg underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Ya tengo cuenta
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- match zone -------------------------------- */

function MatchBlock() {
  const { match, state, isLoading } = useFeaturedMatch();

  return (
    <section className="space-y-3">
      <SectionHeader
        eyebrow="Match Zone"
        title={
          state === "live"
            ? "Partido en vivo"
            : state === "post"
              ? "Último resultado"
              : "Próximo partido"
        }
        action={<VerTodo to="/zona-partido" />}
      />
      {isLoading ? (
        <div className="h-52 rounded-2xl border border-hairline bg-surface-1" />
      ) : match ? (
        state === "pre" ? (
          <NextMatchCard match={match} />
        ) : state === "live" ? (
          <Link
            to="/zona-partido"
            className="block overflow-hidden rounded-2xl border border-hairline bg-surface-1 transition-colors hover:border-primary/40"
          >
            <div className="p-4 md:p-5">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ backgroundColor: LIVE_PINK }}
                />
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: LIVE_PINK }}
                >
                  En vivo
                </p>
                {match.matchday && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    · Jornada {match.matchday}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
                  {match.home_team?.name}
                </span>
                <span className="num-display text-3xl text-foreground">
                  {match.home_score} – {match.away_score}
                </span>
                <span className="min-w-0 flex-1 truncate text-right text-base font-semibold text-foreground">
                  {match.away_team?.name}
                </span>
              </div>
              <div className="mt-4 flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1A0B12]"
                  style={{ backgroundColor: LIVE_PINK }}
                >
                  <Radio className="h-4 w-4" />
                  Ver en vivo
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <Link
            to="/zona-partido"
            className="block rounded-2xl border border-hairline bg-surface-1 p-4 transition-colors hover:border-primary/40"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Último resultado
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {match.home_team?.name}
              </span>
              <span className="num-display text-xl text-foreground">
                {match.home_score} – {match.away_score}
              </span>
              <span className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-foreground">
                {match.away_team?.name}
              </span>
            </div>
          </Link>
        )
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
          <p className="text-sm text-muted-foreground">
            Aún no hay partidos programados. En cuanto se publique el calendario aparecerá aquí.
          </p>
          <Link
            to="/zona-partido"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
          >
            Ir a Match Zone
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}

/* ------------------------------- plantel tabs ------------------------------- */

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

function PlayerTile({ p }: { p: ClubPlayer }) {
  return (
    <div className="w-[104px] shrink-0 overflow-hidden rounded-xl border border-hairline bg-surface-3">
      <div className="relative aspect-[3/4] bg-surface-2">
        {p.photo_url ? (
          <img
            src={p.photo_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="num-display text-2xl text-muted-foreground">
              {p.jersey_number ?? "—"}
            </span>
          </div>
        )}
        {p.jersey_number != null && (
          <span className="num-display absolute bottom-1.5 right-1.5 rounded-md bg-background/70 px-1.5 py-0.5 text-[11px] text-foreground">
            {p.jersey_number}
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-[11px] font-semibold text-foreground">{p.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{p.position ?? "Plantel"}</p>
      </div>
    </div>
  );
}

function RosterTabs() {
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
  const visible = expanded ? rows : rows.slice(0, 12);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
        <div className="h-8 w-56 rounded-lg bg-surface-3" />
        <div className="mt-3 flex gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 w-[104px] shrink-0 rounded-xl bg-surface-3" />
          ))}
        </div>
      </div>
    );
  }
  if (players.length === 0) return null;

  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Plantel
        </p>
      </div>

      {tabs.length > 1 && current && (
        <LcuTabs
          variant="underline"
          layoutId="home-roster-tabs"
          items={tabs.map((t) => ({ id: t, label: t }))}
          value={current}
          onChange={(id) => {
            setActive(id);
            setExpanded(false);
          }}
        />
      )}

      <div className="mt-3">
        {expanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6"
          >
            {visible.map((p) => (
              <div key={p.id} className="[&>div]:w-full">
                <PlayerTile p={p} />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visible.map((p) => (
              <PlayerTile key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline pt-3">
        {rows.length > 12 && !expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary-fg transition-colors hover:text-foreground"
          >
            Ver todos ({rows.length})
          </button>
        ) : (
          <span />
        )}
        <Link
          to="/club"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
        >
          Ver plantel completo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------- afición ---------------------------------- */

function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const NETWORKS: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  facebook: { label: "Facebook", Icon: Facebook },
  instagram: { label: "Instagram", Icon: Instagram },
  x: { label: "X", Icon: XLogo },
};

function FanStrip() {
  const { data: posts = [] } = useFanPosts();
  if (posts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          La afición
        </p>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.slice(0, 8).map((post) => {
          const meta = NETWORKS[post.network] ?? { label: post.network, Icon: Users };
          const Icon = meta.Icon;
          return (
            <div
              key={post.id}
              className="flex w-[220px] shrink-0 flex-col gap-2 rounded-xl border border-hairline bg-surface-3 p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2 text-secondary-fg">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{post.author}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {post.handle ?? `vía ${meta.label}`}
                  </p>
                </div>
              </div>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.author}
                  loading="lazy"
                  className="h-24 w-full rounded-lg border border-hairline object-cover"
                />
              )}
              <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-secondary-fg">
                {post.text}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 border-t border-hairline pt-3">
        <Link
          to="/club"
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
        >
          Ver toda la afición
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------- tu club --------------------------------- */

function ClubBlock() {
  const { data: news = [] } = useClubNews(3);
  const { data: youth } = useYouthTeam();

  return (
    <section className="space-y-3">
      <SectionHeader
        eyebrow="Tu Club"
        title="Cómo va la temporada"
        action={<VerTodo to="/club" />}
      />

      <SeasonSummary />

      <RosterTabs />

      <FanStrip />

      {youth && (
        <Link
          to="/club"
          className="relative block overflow-hidden rounded-2xl border border-hairline bg-surface-1 transition-colors hover:border-primary/40"
        >
          {youth.image_url && (
            <>
              <img
                src={youth.image_url}
                alt={youth.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
            </>
          )}
          <div className="relative p-4 pt-16 md:pt-24">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Fuerzas juveniles
              </p>
            </div>
            <h3 className="text-display-md mt-1.5 text-foreground">{youth.name}</h3>
            {youth.tournament && (
              <span className="mt-2 inline-block rounded-lg border border-hairline bg-background/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-fg">
                {youth.tournament}
              </span>
            )}
          </div>
        </Link>
      )}

      {news.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Desde el vestuario
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.id}
                to="/club"
                className="relative overflow-hidden rounded-xl border border-hairline bg-surface-3 transition-colors hover:border-primary/40"
              >
                <div className="relative h-36 w-full bg-surface-2">
                  {n.image_url && (
                    <img
                      src={n.image_url}
                      alt={n.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-3 via-transparent to-transparent" />
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {formatNewsDate(n.published_at ?? n.created_at)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                    {n.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------------- tienda --------------------------------- */

function ShopBlock() {
  const { data: products = [], isLoading } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <section className="space-y-3">
      <SectionHeader
        eyebrow="Tienda oficial"
        title="Viste los colores"
        action={<VerTodo to="/tienda" />}
      />
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl border border-hairline bg-surface-1" />
          ))}
        </div>
      ) : featured.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
          <p className="text-sm text-muted-foreground">
            La tienda está por abrir. Muy pronto habrá jerseys y streetwear disponibles.
          </p>
          <Link
            to="/tienda"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ----------------------------- visita los cabos ---------------------------- */

function VisitaBlock() {
  const { data: places = [], isLoading } = usePlaces();
  const { metaFor } = useCategoryMeta();
  const highlights = places
    .slice()
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 6);

  return (
    <section className="space-y-3">
      <SectionHeader
        eyebrow="Visita Los Cabos"
        title="El paraíso, según la afición"
        subtitle={
          places.length > 0
            ? `${places.length} ${places.length === 1 ? "lugar" : "lugares"} recomendados por la afición`
            : undefined
        }
        action={<VerTodo to="/conoce-los-cabos" />}
      />

      <Link
        to="/conoce-los-cabos"
        className="relative block h-56 overflow-hidden rounded-2xl border border-hairline bg-surface-1 md:h-64"
      >
        {!isLoading && <HomeMiniMap places={places} />}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-background to-transparent px-4 pb-3 pt-10">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Abrir el mapa completo
          </span>
          <ArrowRight className="h-4 w-4 text-primary" />
        </span>
      </Link>

      {highlights.length > 0 && (
        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {highlights.map((place) => {
            const meta = metaFor(place.category);
            return (
              <Link
                key={place.id}
                to="/conoce-los-cabos"
                className="w-[152px] shrink-0 overflow-hidden rounded-xl border border-hairline bg-surface-1 transition-colors hover:border-primary/40"
              >
                <div className="h-20 w-full bg-surface-2">
                  {place.photoUrl && (
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5">
                    <CategoryIcon
                      name={meta.icon}
                      className="h-3.5 w-3.5"
                      style={{ color: meta.color }}
                    />
                    <p
                      className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-foreground">
                    {place.name}
                  </p>
                  {place.area && (
                    <p className="truncate text-[11px] text-muted-foreground">{place.area}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* -------------------------------- fan zone -------------------------------- */

const TEASER_GAMES = GAMES.filter((g) =>
  ["quiniela", "arma-tu-11", "marcador-exacto", "visitas-paraiso"].includes(g.id),
).map((g) => ({ ...g, status: "soon" as const, reward: "Próximamente" }));

const FAN_PRIZES = [
  { id: "coins", title: "Cabo Coins", description: "Gana monedas jugando y canjéalas.", image: prizeJersey },
  { id: "levels", title: "Niveles", description: "De Visitante a Local: sube de nivel.", image: prizeVestuario },
  { id: "prizes", title: "Premios", description: "Jerseys, boletos y experiencias únicas.", image: prizeTickets },
];

function FanZoneTeaser({ onSignup }: { onSignup: () => void }) {
  const { user } = useAuth();

  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Fan Zone" title="Próximamente" action={<VerTodo to="/fan-zone" />} />

      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface-1 p-5 md:p-8">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/35 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" />
            Próximamente
          </span>
          <h2 className="text-display-lg mt-3 text-foreground">
            Juega y gana siendo de los nuestros
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary-fg">
            Minijuegos, Cabo Coins, niveles y premios exclusivos. Crea tu cuenta hoy y serás
            de los primeros en entrar.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {user ? (
              <Link to="/fan-zone" className={lcuButtonClasses("primary")}>
                Ir a Fan Zone
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button type="button" onClick={onSignup} className={lcuButtonClasses("primary")}>
                Crear mi cuenta gratis
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Qué va a haber
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TEASER_GAMES.map((game, i) => (
            <MiniGameCard key={game.id} game={game} index={i} onClick={() => {}} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Qué se gana
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FAN_PRIZES.map((prize) => (
            <div
              key={prize.id}
              className="relative overflow-hidden rounded-xl border border-hairline bg-surface-3"
            >
              <div className="relative h-28 w-full">
                <img
                  src={prize.image}
                  alt={prize.title}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-3 via-surface-3/50 to-transparent" />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground">{prize.title}</p>
                <p className="mt-0.5 text-xs text-secondary-fg">{prize.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- page ---------------------------------- */

export default function Index() {
  const { user } = useAuth();
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const openSignup = () => setSignupOpen(true);
  const openLogin = () => setLoginOpen(true);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-4 md:px-6">
      <Hero onSignup={openSignup} onLogin={openLogin} />
      <MatchBlock />
      <ClubBlock />
      <ShopBlock />
      <VisitaBlock />
      <FanZoneTeaser onSignup={openSignup} />

      {!user && (
        <section className="rounded-2xl border border-hairline bg-surface-1 p-5 text-center">
          <h2 className="text-display-md text-foreground">Tu pase digital es gratis</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-secondary-fg">
            Acceso a la transmisión en vivo, beneficios en comercios y tu credencial de
            aficionado.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={openSignup}
              className={lcuButtonClasses("primary")}
            >
              Crear mi cuenta
            </button>
            <button
              type="button"
              onClick={openLogin}
              className={lcuButtonClasses("ghost")}
            >
              Ya tengo cuenta
            </button>
          </div>
        </section>
      )}

      <AuthFlow open={signupOpen} onClose={() => setSignupOpen(false)} />
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle>Acceso de aficionados</DialogTitle>
          </DialogHeader>
          <AuthModal
            loginOnly
            onSuccess={() => setLoginOpen(false)}
            onSignupClick={() => {
              setLoginOpen(false);
              setSignupOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

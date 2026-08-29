import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  MapPin,
  Newspaper,
  ShoppingBag,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { usePlaces } from "@/hooks/useVisitaLosCabos";
import { useCategoryMeta } from "@/hooks/usePlaceCategories";
import { useClubNews, useClubPlayers, useYouthTeam } from "@/hooks/useClub";
import { useFeaturedMatch } from "@/hooks/useMatchZone";
import { SeasonSummary } from "@/components/club/SeasonSummary";
import { NextMatchCard } from "@/components/match-zone/NextMatchCard";
import { ProductCard } from "@/components/tienda/ProductCard";
import { SectionHeader } from "@/components/ui-lcu/SectionHeader";
import { HomeMiniMap } from "@/components/home/HomeMiniMap";
import { CategoryIcon } from "@/components/visita-los-cabos/CategoryIcon";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { AuthModal } from "@/components/auth/AuthModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { lcuButtonClasses } from "@/components/ui-lcu/LcuButton";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";

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

function Hero({ onSignup }: { onSignup: () => void }) {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-hairline bg-surface-1">
      <img
        src={stadiumHero}
        alt="Afición de Los Cabos United en el estadio Don Koll"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
      <div className="relative px-5 py-9 md:px-8 md:py-14">
        <img src={lcuCrest} alt="Escudo de Los Cabos United" className="h-14 w-auto md:h-16" />
        <h1 className="text-display-lg mt-4 max-w-lg text-foreground">
          Los Cabos United, Amos del Paraíso
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
            <button type="button" onClick={onSignup} className={lcuButtonClasses("primary")}>
              <Sparkles className="h-4 w-4" />
              Obtener mi pase
            </button>
          )}
          <Link to="/zona-partido" className={lcuButtonClasses("outline")}>
            Ir a Match Zone
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- próximo partido ------------------------------ */

function MatchBlock() {
  const { match, state, isLoading } = useFeaturedMatch();

  return (
    <section className="space-y-3">
      <SectionHeader
        eyebrow="Match Zone"
        title={state === "live" ? "Partido en vivo" : "Próximo partido"}
        action={<VerTodo to="/zona-partido" />}
      />
      {isLoading ? (
        <div className="h-52 rounded-2xl border border-hairline bg-surface-1" />
      ) : match ? (
        state === "pre" ? (
          <NextMatchCard match={match} />
        ) : (
          <Link
            to="/zona-partido"
            className="block rounded-2xl border border-hairline bg-surface-1 p-4 transition-colors hover:border-primary/40"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {state === "live" ? "Ahora en vivo" : "Último resultado"}
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
        <p className="rounded-2xl border border-hairline bg-surface-1 p-5 text-sm text-muted-foreground">
          Aún no hay partidos programados. En cuanto se publique el calendario aparecerá aquí.
        </p>
      )}
    </section>
  );
}

/* ---------------------------------- tu club --------------------------------- */

function ClubBlock() {
  const { data: players = [], isLoading: loadingPlayers } = useClubPlayers();
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

      {(loadingPlayers || players.length > 0) && (
        <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Plantel
            </p>
          </div>
          <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {players.slice(0, 10).map((p) => (
              <Link
                key={p.id}
                to="/club"
                className="w-[104px] shrink-0 overflow-hidden rounded-xl border border-hairline bg-surface-3 transition-colors hover:border-primary/40"
              >
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
                </div>
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold text-foreground">{p.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {p.position ?? "Plantel"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {youth && (
        <Link
          to="/club"
          className="block overflow-hidden rounded-2xl border border-hairline bg-surface-1 transition-colors hover:border-primary/40"
        >
          {youth.image_url && (
            <img
              src={youth.image_url}
              alt={youth.name}
              loading="lazy"
              className="h-32 w-full object-cover"
            />
          )}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Fuerzas juveniles
              </p>
            </div>
            <h3 className="text-display-md mt-1.5 text-foreground">{youth.name}</h3>
            {youth.tournament && (
              <span className="mt-2 inline-block rounded-lg border border-hairline bg-surface-3 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-fg">
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
                className="overflow-hidden rounded-xl border border-hairline bg-surface-3 transition-colors hover:border-primary/40"
              >
                <div className="h-24 w-full bg-surface-2">
                  {n.image_url && (
                    <img
                      src={n.image_url}
                      alt={n.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
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

/* -------------------------------- fan zone -------------------------------- */

function FanZoneTeaser() {
  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Fan Zone" title="Muy pronto" action={<VerTodo to="/fan-zone" />} />
      <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
        <p className="text-sm leading-relaxed text-secondary-fg">
          Estamos construyendo la Fan Zone: retos, predicciones y recompensas por apoyar al
          club. Crea tu cuenta hoy y serás de los primeros en entrar.
        </p>
        <Link
          to="/fan-zone"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          Conocer la Fan Zone
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
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
            ? `${places.length} lugares recomendados en Cabo San Lucas y San José`
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

/* ----------------------------------- page ---------------------------------- */

export default function Index() {
  const { user } = useAuth();
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-4 md:px-6">
      <Hero onSignup={() => setSignupOpen(true)} />
      <MatchBlock />
      <ClubBlock />
      <FanZoneTeaser />
      <ShopBlock />
      <VisitaBlock />

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
              onClick={() => setSignupOpen(true)}
              className={lcuButtonClasses("primary")}
            >
              Crear mi cuenta
            </button>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
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

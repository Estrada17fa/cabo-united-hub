import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Gamepad2,
  MapPin,
  Sparkles,
  Radio,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useShopifyProducts } from "@/hooks/useShopify";
import { MatchHeroCard } from "@/components/match-zone/MatchHeroCard";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { ResponsiveMatchTimeline } from "@/components/match-zone/ResponsiveMatchTimeline";
import { TeamCrest } from "@/components/match-zone/TeamCrest";
import { useTeamLogos } from "@/hooks/useTeamLogos";
import type { Tables } from "@/integrations/supabase/types";
import { EditorialProductCard } from "@/components/tienda/EditorialProductCard";
import { AuthModal } from "@/components/auth/AuthModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLACES, FEATURED_PLACE_IDS } from "@/lib/visita-los-cabos-data";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";

const ACCENT = "#00abc4";

const HERO_STATS = [
  { icon: "⚽", label: "6 temporadas" },
  { icon: "🏟️", label: "Liga Premier Serie A" },
  { icon: "📍", label: "Los Cabos, BCS" },
];

const CATEGORY_THEME: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  restaurantes: {
    label: "Restaurantes",
    color: "#F59E0B",
    bg: "linear-gradient(135deg, #1a0f00 0%, #111 100%)",
  },
  bares: {
    label: "Bares",
    color: "#FF6B6B",
    bg: "linear-gradient(135deg, #1a0008 0%, #111 100%)",
  },
  tours: {
    label: "Tours",
    color: "#00abc4",
    bg: "linear-gradient(135deg, #001a1f 0%, #111 100%)",
  },
  tiendas: {
    label: "Tiendas",
    color: "#A78BFA",
    bg: "linear-gradient(135deg, #0f0a1a 0%, #111 100%)",
  },
  hoteles: {
    label: "Hoteles",
    color: "#5EEAD4",
    bg: "linear-gradient(135deg, #00140f 0%, #111 100%)",
  },
};

/* ============================================================ */
/*  HERO                                                         */
/* ============================================================ */

function HomeHero() {
  return (
    <section className="relative -mx-3 sm:-mx-4 lg:-mx-[calc((100vw-100%)/2)] overflow-hidden">
      <div className="relative w-full" style={{ minHeight: 520 }}>
        <img
          src={stadiumHero}
          alt="Estadio Don Koll"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 55%, #050505 100%)",
          }}
        />
        {/* radial accent glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 40% at 50% 30%, rgba(0,171,196,0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 px-4 pt-14 md:pt-24 pb-32 md:pb-40 text-center max-w-3xl mx-auto">
          <motion.img
            src={lcuCrest}
            alt="Los Cabos United"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 drop-shadow-[0_0_40px_rgba(0,171,196,0.5)]"
          />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-bold mb-4"
            style={{
              color: ACCENT,
              fontSize: 11,
              letterSpacing: "0.18em",
            }}
          >
            TEMPORADA 2025–26 · LIGA PREMIER SERIE A
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-extrabold text-white mb-4"
            style={{
              fontSize: "clamp(36px, 7vw, 60px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
            }}
          >
            Tu equipo. <span style={{ color: ACCENT }}>Tu paraíso.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto text-white/75"
            style={{ fontSize: 16, maxWidth: 540, lineHeight: 1.5 }}
          >
            Bienvenido a la casa oficial de Los Cabos United. Vive cada partido,
            sé Amo del Paraíso y descubre la afición más caliente de Baja.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/accesos"
              className="inline-flex items-center justify-center gap-2 font-bold rounded-full transition-opacity hover:opacity-90"
              style={{
                background: ACCENT,
                color: "#0a0a0a",
                height: 48,
                padding: "0 22px",
                fontSize: 14,
                letterSpacing: "0.02em",
              }}
            >
              <Crown className="w-4 h-4" />
              Únete a la afición
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-white/55"
            style={{ fontSize: 11, letterSpacing: "0.02em" }}
          >
            {HERO_STATS.map((s, i) => (
              <span key={s.label} className="inline-flex items-center gap-1.5">
                <span>{s.icon}</span>
                <span>{s.label}</span>
                {i < HERO_STATS.length - 1 && (
                  <span className="text-white/30 ml-2">·</span>
                )}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  SECTION HEADER                                               */
/* ============================================================ */

function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = "Ver todo",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4 px-1">
      <div>
        {eyebrow && (
          <div
            className="font-bold mb-1"
            style={{ color: ACCENT, fontSize: 11, letterSpacing: "0.18em" }}
          >
            {eyebrow}
          </div>
        )}
        <h2
          className="font-extrabold text-white"
          style={{ fontSize: "clamp(20px, 3vw, 26px)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          to={href}
          className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors font-semibold"
          style={{ fontSize: 13 }}
        >
          {hrefLabel}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

/* ============================================================ */
/*  NEXT MATCH SECTION                                           */
/* ============================================================ */

function NextMatchSection() {
  const { data: featuredMatch = null, isLoading } = useQuery({
    queryKey: ["matches", "featured"],
    queryFn: async () => {
      const { data: liveData } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "live")
        .order("match_date", { ascending: false })
        .limit(1);
      if (liveData && liveData.length > 0) return liveData[0];

      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const { data: finishedData } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "finished")
        .gte("match_date", cutoff)
        .order("match_date", { ascending: false })
        .limit(1);
      if (finishedData && finishedData.length > 0) return finishedData[0];

      const { data } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "scheduled")
        .order("match_date", { ascending: true })
        .limit(1);
      return data?.[0] ?? null;
    },
  });

  const { isLive } = useLiveMatch(featuredMatch);

  return (
    <section>
      <SectionHeader
        eyebrow={isLive ? "PARTIDO EN CURSO" : "PRÓXIMO PARTIDO"}
        title={isLive ? "Estamos jugando ahora" : "No te lo pierdas"}
        href="/zona-partido"
        hrefLabel="Ver todos"
      />
      {isLoading ? (
        <Skeleton className="h-[260px] rounded-2xl" />
      ) : isLive && featuredMatch ? (
        <LiveMatchPreview match={featuredMatch} />
      ) : (
        <MatchHeroCard match={featuredMatch} />
      )}
    </section>
  );
}

/* ============================================================ */
/*  LIVE MATCH PREVIEW (timeline + Ver en vivo CTA)             */
/* ============================================================ */

function LiveMatchPreview({ match }: { match: Tables<"matches"> }) {
  const { events } = useLiveMatch(match);
  const logos = useTeamLogos();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: "#121212",
        borderColor: "hsl(142 76% 45% / 0.45)",
        boxShadow: "0 0 30px -12px hsl(142 76% 45% / 0.45)",
      }}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4">
        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-2 min-w-0 justify-end sm:justify-center">
            <span className="text-xs sm:text-sm font-bold text-foreground truncate text-right sm:text-center order-1 sm:order-2">
              {match.home_team}
            </span>
            <TeamCrest
              teamName={match.home_team}
              logoUrl={logos[match.home_team]}
              size={28}
              className="order-2 sm:order-1"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span
              className="text-3xl sm:text-4xl font-extrabold tabular-nums leading-none text-white"
              style={{ textShadow: "0 0 18px hsl(142 76% 45% / 0.5)" }}
            >
              {match.home_score ?? 0}
            </span>
            <span className="text-sm font-extrabold text-muted-foreground tracking-wider">
              VS
            </span>
            <span
              className="text-3xl sm:text-4xl font-extrabold tabular-nums leading-none text-white"
              style={{ textShadow: "0 0 18px hsl(142 76% 45% / 0.5)" }}
            >
              {match.away_score ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0 justify-start sm:justify-center">
            <TeamCrest
              teamName={match.away_team}
              logoUrl={logos[match.away_team]}
              size={28}
            />
            <span className="text-xs sm:text-sm font-bold text-foreground truncate">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Live timeline */}
        <div className="w-full pt-3 border-t border-border/50">
          <ResponsiveMatchTimeline events={events} homeTeam={match.home_team} />
        </div>

        {/* Ver en vivo CTA */}
        <Link to="/zona-partido" className="w-full">
          <motion.button
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] sm:text-[15px]"
            style={{
              backgroundColor: ACCENT,
              color: "#000",
              boxShadow: "0 8px 24px -6px rgba(0,171,196,0.55)",
            }}
          >
            <Radio className="w-5 h-5" />
            Ver en vivo
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/*  QUICK ACCESS GRID                                            */
/* ============================================================ */

/* ============================================================ */
/*  ACCESOS / MEMBRESÍAS BANNER                                  */
/* ============================================================ */

const TIER_CHIPS = [
  { name: "Gold", price: "$1,499", color: "#F59E0B" },
  { name: "Premium", price: "$2,499", color: "#00abc4" },
  { name: "Platino", price: "$4,499", color: "#E2E8F0" },
];

function AccesosBanner() {
  return (
    <section>
      <SectionHeader
        eyebrow="MEMBRESÍAS"
        title="Sé Amo del Paraíso"
        href="/accesos"
        hrefLabel="Ver membresías"
      />
      <Link
        to="/accesos"
        className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] px-4 py-4 md:px-5 transition-all hover:border-[#00abc4]/40 group"
        style={{
          background:
            "linear-gradient(135deg, #001a1f 0%, #0a0a0a 60%, #001218 100%)",
          maxHeight: 160,
        }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {TIER_CHIPS.map((t) => (
            <div
              key={t.name}
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${t.color}40`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: t.color }}
              />
              <span
                className="font-bold text-white"
                style={{ fontSize: 12, letterSpacing: "0.04em" }}
              >
                {t.name}
              </span>
              <span className="text-white/60" style={{ fontSize: 12 }}>
                {t.price}
              </span>
            </div>
          ))}
        </div>
        <span
          className="hidden sm:inline-flex items-center gap-1 font-bold shrink-0 transition-transform group-hover:translate-x-1"
          style={{ color: ACCENT, fontSize: 13 }}
        >
          Ver membresías
          <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    </section>
  );
}

/* ============================================================ */
/*  SHOP STRIP                                                   */
/* ============================================================ */

function ShopStrip() {
  const { data: products = [], isLoading } = useShopifyProducts({ first: 8 });
  const featured = products.slice(0, 8);

  if (!isLoading && featured.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="TIENDA OFICIAL"
        title="Lleva el escudo a donde vayas"
        href="/tienda"
        hrefLabel="Ver tienda"
      />
      <div className="-mx-3 md:mx-0">
        <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-3 md:px-0 pb-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0"
                  style={{ width: "60vw", maxWidth: 240 }}
                >
                  <Skeleton className="aspect-square rounded-xl mb-3" />
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            : featured.map((product, i) => (
                <div
                  key={product.node.id}
                  className="snap-start shrink-0"
                  style={{ width: "60vw", maxWidth: 240 }}
                >
                  <EditorialProductCard product={product} index={i} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  FAN ZONE TEASER                                              */
/* ============================================================ */

function FanZoneTeaser({ onLoginClick }: { onLoginClick: () => void }) {
  const { user, profile } = useAuth();
  const displayName =
    profile?.display_name ?? user?.email?.split("@")[0] ?? "Invitado";

  // Mock stats — same source as FanStatsHero. Wire to real data later.
  const stats = { rank: 42, points: 12450, level: 3, levelName: "Amo" };

  return (
    <section>
      <SectionHeader
        eyebrow="FAN ZONE"
        title="Liga de Amos"
        href="/fan-zone"
        hrefLabel="Ir a Fan Zone"
      />

      <div
        className="rounded-2xl p-4 md:p-5 border border-white/[0.07] flex flex-col sm:flex-row sm:items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #0d0d12 0%, #0a0a0a 100%)",
        }}
      >
        {/* Left — concept + copy */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: `${ACCENT}1f`,
              border: `1px solid ${ACCENT}40`,
            }}
          >
            <Gamepad2 className="w-6 h-6" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div
              className="font-bold mb-1"
              style={{ color: ACCENT, fontSize: 11, letterSpacing: "0.14em" }}
            >
              FAN ZONE · LIGA DE AMOS
            </div>
            <div
              className="font-extrabold text-white leading-tight"
              style={{ fontSize: 15 }}
            >
              Juega, suma puntos y gana premios cada semana
            </div>
            <div className="text-white/55 mt-1" style={{ fontSize: 13 }}>
              {user
                ? `Hola, ${displayName}. Sigue subiendo en la tabla.`
                : "Crea tu cuenta y empieza a competir."}
            </div>
          </div>
        </div>

        {/* Right — rank or CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0">
          {user ? (
            <div className="text-right">
              <div
                className="font-extrabold text-white tabular-nums"
                style={{ fontSize: 16 }}
              >
                #{stats.rank} · {stats.points.toLocaleString()} pts
              </div>
              <div className="text-white/55" style={{ fontSize: 12 }}>
                Nivel {stats.level} {stats.levelName}
              </div>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="shrink-0 inline-flex items-center gap-2 font-bold rounded-full transition-opacity hover:opacity-90"
              style={{
                background: ACCENT,
                color: "#000",
                height: 38,
                padding: "0 14px",
                fontSize: 13,
              }}
            >
              Inicia sesión
            </button>
          )}
          <Link
            to="/fan-zone"
            className="hidden sm:inline-flex items-center gap-1 font-bold"
            style={{ color: ACCENT, fontSize: 13 }}
          >
            Ir a Fan Zone
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  LOS CABOS STRIP                                              */
/* ============================================================ */

function LosCabosStrip() {
  const featured = FEATURED_PLACE_IDS.map((id) =>
    PLACES.find((p) => p.id === id)
  ).filter(Boolean) as (typeof PLACES)[number][];

  return (
    <section>
      <SectionHeader
        eyebrow="VISITA LOS CABOS"
        title="La afición en el mapa"
        href="/conoce-los-cabos"
        hrefLabel="Explorar mapa"
      />
      <div className="-mx-3 md:mx-0">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-3 md:px-0 pb-2">
          {featured.map((place) => {
            const meta =
              CATEGORY_THEME[place.category] ?? {
                label: place.category,
                color: "#ffffff",
                bg: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
              };
            return (
              <Link
                key={place.id}
                to="/conoce-los-cabos"
                className="snap-start shrink-0 w-[240px] h-[150px] relative rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/[0.18] transition-all group"
                style={{ background: meta.bg }}
              >
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex justify-start items-start">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${meta.color}1a`,
                        color: meta.color,
                        border: `1px solid ${meta.color}33`,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div>
                    <div
                      className="font-bold text-white leading-tight line-clamp-2"
                      style={{ fontSize: 14 }}
                    >
                      {place.name}
                    </div>
                    <div
                      className="flex items-center gap-1 text-white/55 mt-1"
                      style={{ fontSize: 11 }}
                    >
                      <MapPin className="w-3 h-3" />
                      {place.area}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  PAGE                                                         */
/* ============================================================ */

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pb-10"
        style={{ display: "flex", flexDirection: "column", gap: 48 }}
      >
        <HomeHero />
        <NextMatchSection />
        <FanZoneTeaser onLoginClick={() => setAuthOpen(true)} />
        <AccesosBanner />
        <ShopStrip />
        <LosCabosStrip />
      </motion.div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Únete a Los Cabos United</DialogTitle>
          </DialogHeader>
          <AuthModal onSuccess={() => setAuthOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;

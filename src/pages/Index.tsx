import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Crown,
  Gamepad2,
  MapPin,
  ShoppingBag,
  Shield,
  Sparkles,
  Ticket,
  Trophy,
  Users,
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
import { GAMES } from "@/components/fan-zone/games";
import { PLACES, FEATURED_PLACE_IDS, CATEGORY_META } from "@/lib/visita-los-cabos-data";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";

const ACCENT = "#00abc4";

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
              backgroundColor: "hsl(142 76% 50%)",
              color: "hsl(0 0% 6%)",
              boxShadow: "0 8px 24px -6px hsl(142 76% 50% / 0.55)",
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

const QUICK_ACCESS = [
  {
    href: "/zona-partido",
    label: "Match Zone",
    sub: "Partidos en vivo y resultados",
    icon: Trophy,
    color: "#00abc4",
  },
  {
    href: "/club",
    label: "Tu Club",
    sub: "Plantilla, escudo y ADN",
    icon: Shield,
    color: "#f298c0",
  },
  {
    href: "/fan-zone",
    label: "Fan Zone",
    sub: "Minijuegos y recompensas",
    icon: Gamepad2,
    color: "#F59E0B",
  },
  {
    href: "/accesos",
    label: "Accesos",
    sub: "Sé Amo del Paraíso",
    icon: Ticket,
    color: "#00abc4",
  },
  {
    href: "/tienda",
    label: "Tienda Oficial",
    sub: "Jerseys y mercancía",
    icon: ShoppingBag,
    color: "#E2E8F0",
  },
  {
    href: "/conoce-los-cabos",
    label: "Conoce Los Cabos",
    sub: "Mapa de la afición",
    icon: MapPin,
    color: "#00D4FF",
  },
];

function QuickAccessGrid() {
  return (
    <section>
      <SectionHeader eyebrow="EXPLORA" title="Toda la experiencia" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {QUICK_ACCESS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={item.href}
                className="group block rounded-2xl border border-white/[0.07] bg-card p-4 md:p-5 h-full transition-all hover:-translate-y-0.5 hover:border-white/[0.15]"
                style={{
                  background: "linear-gradient(160deg, #121212 0%, #0a0a0a 100%)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{
                    background: `${item.color}1f`,
                    border: `1px solid ${item.color}40`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div
                  className="font-extrabold text-white"
                  style={{ fontSize: 15, letterSpacing: "-0.01em" }}
                >
                  {item.label}
                </div>
                <div className="text-white/50 mt-1" style={{ fontSize: 12 }}>
                  {item.sub}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

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
      <Link
        to="/accesos"
        className="block rounded-3xl overflow-hidden border border-white/[0.08] transition-all hover:border-[#00abc4]/40 group"
        style={{
          background:
            "linear-gradient(135deg, #001a1f 0%, #0a0a0a 60%, #001218 100%)",
        }}
      >
        <div className="relative p-6 md:p-10">
          {/* ambient glow */}
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-30 blur-3xl"
            style={{ background: ACCENT }}
          />
          {/* watermark crest */}
          <img
            src={lcuCrest}
            alt=""
            aria-hidden="true"
            className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none"
            style={{
              width: 220,
              height: 220,
              opacity: 0.06,
              filter: "hue-rotate(160deg) saturate(2)",
            }}
          />

          <div className="relative max-w-2xl">
            <div
              className="inline-flex items-center gap-2 font-bold mb-3"
              style={{ color: ACCENT, fontSize: 11, letterSpacing: "0.18em" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              MEMBRESÍAS OFICIALES
            </div>
            <h2
              className="font-extrabold text-white mb-3"
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Únete y sé <span style={{ color: ACCENT }}>Amo del Paraíso</span>
            </h2>
            <p className="text-white/70 mb-5" style={{ fontSize: 14 }}>
              Acceso a partidos, kit oficial, descuentos en tienda y experiencias
              VIP con el equipo. Elige tu nivel.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
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
                    desde {t.price}
                  </span>
                </div>
              ))}
            </div>

            <span
              className="inline-flex items-center gap-2 font-bold rounded-full transition-transform group-hover:translate-x-1"
              style={{
                background: ACCENT,
                color: "#0a0a0a",
                height: 46,
                padding: "0 20px",
                fontSize: 14,
              }}
            >
              Ver accesos
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
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
  const featuredGames = GAMES.slice(0, 3);
  const displayName =
    profile?.display_name ?? user?.email?.split("@")[0] ?? "Invitado";

  return (
    <section>
      <SectionHeader
        eyebrow="FAN ZONE"
        title="Juega y gana puntos"
        href="/fan-zone"
        hrefLabel="Ir a Fan Zone"
      />

      {/* Status / login card */}
      <div
        className="rounded-2xl p-4 md:p-5 mb-4 border border-white/[0.07] flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #0d0d12 0%, #0a0a0a 100%)",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: `${ACCENT}1f`,
            border: `1px solid ${ACCENT}40`,
          }}
        >
          <Crown className="w-6 h-6" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 min-w-0">
          {user ? (
            <>
              <div className="font-bold text-white truncate" style={{ fontSize: 15 }}>
                Hola, {displayName}
              </div>
              <div className="text-white/60" style={{ fontSize: 12 }}>
                Sigue jugando para subir de nivel y ganar recompensas.
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-white" style={{ fontSize: 15 }}>
                Crea tu cuenta gratis
              </div>
              <div className="text-white/60" style={{ fontSize: 12 }}>
                Acumula puntos, sube de nivel y desbloquea premios.
              </div>
            </>
          )}
        </div>
        {!user && (
          <button
            onClick={onLoginClick}
            className="shrink-0 inline-flex items-center gap-2 font-bold rounded-full transition-opacity hover:opacity-90"
            style={{
              background: ACCENT,
              color: "#0a0a0a",
              height: 38,
              padding: "0 14px",
              fontSize: 13,
            }}
          >
            Únete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {featuredGames.map((game, i) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to="/fan-zone"
                className="group block rounded-2xl border border-white/[0.07] p-4 h-full transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${game.color.replace("hsl", "hsla").replace(")", " / 0.12)")} 0%, #0a0a0a 80%)`,
                  borderColor: `${game.color.replace(")", " / 0.25)").replace("hsl", "hsla")}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: game.color.replace("hsl", "hsla").replace(")", " / 0.18)"),
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: game.color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: game.color,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {game.reward}
                  </span>
                </div>
                <div className="font-bold text-white" style={{ fontSize: 14 }}>
                  {game.name}
                </div>
                <div className="text-white/55 mt-0.5" style={{ fontSize: 12 }}>
                  {game.subtitle}
                </div>
              </Link>
            </motion.div>
          );
        })}
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
            const meta = CATEGORY_META[place.category];
            return (
              <Link
                key={place.id}
                to="/conoce-los-cabos"
                className="snap-start shrink-0 w-[240px] h-[160px] relative rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/[0.18] transition-all group"
                style={{ background: place.photoGradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md"
                      style={{
                        backgroundColor: "hsl(0 0% 0% / 0.55)",
                        color: meta.color,
                      }}
                    >
                      {meta.emoji} {meta.label}
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
                      className="flex items-center gap-1 text-white/75 mt-1"
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
/*  SPONSORS MICRO CTA                                           */
/* ============================================================ */

function SponsorsMicroCta() {
  return (
    <section>
      <Link
        to="/patrocinios"
        className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-card px-4 py-4 hover:border-white/[0.15] transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `${ACCENT}1f`,
              border: `1px solid ${ACCENT}40`,
            }}
          >
            <Users className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div
              className="font-bold text-white truncate"
              style={{ fontSize: 14 }}
            >
              Hecho posible por nuestros patrocinadores
            </div>
            <div className="text-white/55" style={{ fontSize: 12 }}>
              Conoce a las marcas que impulsan el club.
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors shrink-0" />
      </Link>
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
        className="space-y-10 md:space-y-14 pb-10"
      >
        <HomeHero />
        <NextMatchSection />
        <QuickAccessGrid />
        <AccesosBanner />
        <ShopStrip />
        <FanZoneTeaser onLoginClick={() => setAuthOpen(true)} />
        <LosCabosStrip />
        <SponsorsMicroCta />
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

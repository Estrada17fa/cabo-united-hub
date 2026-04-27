import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  Crown,
  MapPin,
  Radio,
  Trophy,
  Ticket,
  Users,
  GraduationCap,
  Newspaper,
  Gift,
  Medal,
  ShoppingBag,
  Sparkles,
  Goal,
  Sun,
  Tent,
  Shield,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useShopifyProducts } from "@/hooks/useShopify";
import { MatchHeroCard } from "@/components/match-zone/MatchHeroCard";
import { useLiveMatch } from "@/hooks/useLiveMatch";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";
import tiendaHero from "@/assets/tienda-hero-1.jpg";
import adnCabenoImg from "@/assets/adn-cabeno.jpg";

const ACCENT = "#00abc4";
const LCU = "Los Cabos United";

/* --- Tu Club: data mirrors src/pages/Club.tsx --- */
type ClubPosition =
  | "Porteros"
  | "Defensas"
  | "Mediocampistas"
  | "Delanteros"
  | "Cuerpo Técnico";

const CLUB_ROSTER: Record<
  ClubPosition,
  { name: string; number: number | string; flag: string; role?: string }[]
> = {
  Porteros: [
    { name: "Luis Robles", number: 1, flag: "🇲🇽" },
    { name: "Andrés Castillo", number: 12, flag: "🇲🇽" },
    { name: "Mateo Salinas", number: 25, flag: "🇦🇷" },
    { name: "Iván Flores", number: 30, flag: "🇲🇽" },
  ],
  Defensas: [
    { name: "Carlos Vela Jr.", number: 2, flag: "🇲🇽" },
    { name: "Rafael Márquez", number: 4, flag: "🇲🇽" },
    { name: "Sebastián Núñez", number: 5, flag: "🇨🇴" },
    { name: "Emilio Pacheco", number: 3, flag: "🇲🇽" },
  ],
  Mediocampistas: [
    { name: "Juan Pablo Ortiz", number: 6, flag: "🇲🇽" },
    { name: "Lucas Bermúdez", number: 8, flag: "🇦🇷" },
    { name: "Alejandro Ríos", number: 10, flag: "🇲🇽" },
    { name: "Nicolás Vargas", number: 14, flag: "🇺🇾" },
  ],
  Delanteros: [
    { name: "Diego Hernández", number: 9, flag: "🇲🇽" },
    { name: "Bruno Cardozo", number: 11, flag: "🇧🇷" },
    { name: "Adrián Solís", number: 19, flag: "🇲🇽" },
    { name: "Tomás Rincón", number: 22, flag: "🇻🇪" },
  ],
  "Cuerpo Técnico": [
    { name: "Ricardo Mendoza", number: "DT", flag: "🇲🇽", role: "Director Técnico" },
    { name: "Pablo Espinoza", number: "AT", flag: "🇲🇽", role: "Asistente Técnico" },
    { name: "Héctor Lozano", number: "PF", flag: "🇲🇽", role: "Preparador Físico" },
    { name: "Sergio Vidal", number: "PA", flag: "🇪🇸", role: "Entren. Porteros" },
  ],
};

const CLUB_ACADEMY_CATEGORIES = [
  { icon: Sparkles, name: "Semillero", age: "3 – 8 años" },
  { icon: GraduationCap, name: "Academia", age: "7 – 14 años" },
  { icon: Goal, name: "Fuerzas Básicas", age: "Sub 15 y Sub 17" },
  { icon: Sun, name: "Curso de Verano", age: "Temporada" },
  { icon: Tent, name: "Campamento", age: "Experiencia" },
];

const CLUB_NEWS = [
  {
    tag: "Noticias",
    tagColor: "hsl(336 80% 77%)",
    title: "Los Cabos United firma nuevo acuerdo con la afición local",
    date: "12 Abr 2025",
    read: "3 min",
  },
  {
    tag: "Entrevista",
    tagColor: "hsl(38 92% 60%)",
    title: "Diego Hernández: 'Quiero romper el récord de goles de la Serie A'",
    date: "08 Abr 2025",
    read: "5 min",
  },
  {
    tag: "Detrás de Cámaras",
    tagColor: "hsl(199 89% 60%)",
    title: "Un día con el plantel: la rutina antes del clásico del noroeste",
    date: "02 Abr 2025",
    read: "4 min",
  },
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
/*  SECTION DIVIDER + HEADER                                     */
/* ============================================================ */

function SectionDivider() {
  return (
    <div className="relative">
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4 mb-4 px-1">
      <div className="min-w-0">
        {eyebrow && (
          <div
            className="font-bold mb-1.5 inline-flex items-center gap-2 flex-wrap"
            style={{ color: ACCENT, fontSize: 11, letterSpacing: "0.2em" }}
          >
            <span
              className="inline-block w-6 h-px"
              style={{ background: ACCENT }}
            />
            {eyebrow}
          </div>
        )}
        <h2
          className="font-extrabold text-white"
          style={{
            fontSize: "clamp(22px, 6vw, 44px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          to={href}
          className="self-start sm:self-auto inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors font-semibold whitespace-nowrap shrink-0"
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
/*  MATCH ZONE SECTION                                           */
/* ============================================================ */

function MatchZoneSection() {
  const { data: featuredMatch = null, isLoading: loadingFeatured } = useQuery({
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

  const { data: upcoming = [] } = useQuery({
    queryKey: ["matches", "upcoming-3"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "scheduled")
        .gte("match_date", today)
        .order("match_date", { ascending: true })
        .limit(3);
      return data ?? [];
    },
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["league_standings", "home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("league_standings")
        .select("*")
        .order("pos", { ascending: true });
      return data ?? [];
    },
  });

  const lcuRow = standings.find((r) => r.team === LCU);
  const lcuPos = lcuRow?.pos ?? null;

  // Build a focused 5-row window around LCU
  const standingsWindow = (() => {
    if (standings.length === 0) return [];
    if (!lcuPos) return standings.slice(0, 5);
    const idx = standings.findIndex((r) => r.team === LCU);
    const start = Math.max(0, idx - 2);
    const end = Math.min(standings.length, start + 5);
    return standings.slice(start, end);
  })();

  return (
    <section>
      <SectionHeader
        eyebrow="MATCH ZONE"
        title={isLive ? "Estamos jugando ahora" : "Prepárate para el próximo partido"}
        href="/zona-partido"
        hrefLabel="Ir a Match Zone"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Featured match — 50% (2/4) */}
        <div className="lg:col-span-2">
          {loadingFeatured ? (
            <Skeleton className="h-[320px] rounded-2xl" />
          ) : isLive && featuredMatch ? (
            <LiveScoreOnly match={featuredMatch} />
          ) : (
            <MatchHeroCard match={featuredMatch} />
          )}
        </div>

        {/* Upcoming 3 — 25% */}
        <div className="lg:col-span-1">
          <UpcomingMini matches={upcoming} />
        </div>

        {/* Standings — 25% */}
        <div className="lg:col-span-1">
          <StandingsMini rows={standingsWindow} lcuPos={lcuPos} />
        </div>
      </div>
    </section>
  );
}

/* ---------- LIVE SCORE ONLY (no timeline) ---------- */
function LiveScoreOnly({ match }: { match: Tables<"matches"> }) {
  const { currentMinute } = useLiveMatch(match);
  const logos = useTeamLogos();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border overflow-hidden h-full flex flex-col"
      style={{
        backgroundColor: "#121212",
        borderColor: "hsl(142 76% 45% / 0.45)",
        boxShadow: "0 0 30px -12px hsl(142 76% 45% / 0.45)",
        minHeight: 320,
      }}
    >
      <div className="px-5 py-6 flex flex-col gap-5 flex-1 justify-between">
        {/* Live badge */}
        <div className="flex items-center justify-between">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              backgroundColor: "hsl(142 76% 45% / 0.15)",
              border: "1px solid hsl(142 76% 45% / 0.4)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "hsl(142 76% 45%)" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: "hsl(142 76% 45%)" }}
              />
            </span>
            <span
              className="text-[10px] font-extrabold tracking-widest"
              style={{ color: "hsl(142 76% 55%)" }}
            >
              EN VIVO {currentMinute}'
            </span>
          </span>
          {match.jornada != null && (
            <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
              Jornada {match.jornada}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-2 min-w-0">
            <TeamCrest
              teamName={match.home_team}
              logoUrl={logos[match.home_team]}
              size={56}
            />
            <span className="text-sm font-bold text-foreground truncate text-center max-w-full">
              {match.home_team}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span
              className="text-5xl sm:text-6xl font-extrabold tabular-nums leading-none text-white"
              style={{ textShadow: "0 0 18px hsl(142 76% 45% / 0.5)" }}
            >
              {match.home_score ?? 0}
            </span>
            <span className="text-base font-extrabold text-white/40 tracking-wider">
              ·
            </span>
            <span
              className="text-5xl sm:text-6xl font-extrabold tabular-nums leading-none text-white"
              style={{ textShadow: "0 0 18px hsl(142 76% 45% / 0.5)" }}
            >
              {match.away_score ?? 0}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 min-w-0">
            <TeamCrest
              teamName={match.away_team}
              logoUrl={logos[match.away_team]}
              size={56}
            />
            <span className="text-sm font-bold text-foreground truncate text-center max-w-full">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Ver en vivo CTA */}
        <Link to="/zona-partido" className="w-full">
          <motion.button
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-[14px]"
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

/* ---------- UPCOMING MINI (3 next matches) ---------- */
function UpcomingMini({ matches }: { matches: Tables<"matches">[] }) {
  const logos = useTeamLogos();
  return (
    <div
      className="rounded-2xl border h-full flex flex-col"
      style={{
        backgroundColor: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.07)",
        minHeight: 320,
      }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" style={{ color: ACCENT }} />
        <h3
          className="font-extrabold text-white uppercase tracking-wider"
          style={{ fontSize: 12, letterSpacing: "0.1em" }}
        >
          Próximos 3 partidos
        </h3>
      </div>
      <div className="flex-1 px-3 pb-3 flex flex-col gap-2">
        {matches.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white/40 text-xs px-4 text-center">
            No hay partidos programados
          </div>
        ) : (
          matches.map((m) => {
            const date = new Date(`${m.match_date}T${m.match_time || "19:00:00"}`);
            return (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="text-[10px] font-bold tabular-nums shrink-0 text-white/50 w-8 text-center"
                >
                  J{m.jornada ?? "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <TeamCrest
                      teamName={m.home_team}
                      logoUrl={logos[m.home_team]}
                      size={14}
                    />
                    <span className="text-[12px] font-semibold text-white truncate">
                      {m.home_team}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TeamCrest
                      teamName={m.away_team}
                      logoUrl={logos[m.away_team]}
                      size={14}
                    />
                    <span className="text-[12px] font-medium text-white/70 truncate">
                      {m.away_team}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-bold text-white capitalize">
                    {format(date, "dd MMM", { locale: es })}
                  </div>
                  <div className="text-[10px] text-white/50 tabular-nums">
                    {format(date, "h:mm a")}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Link
        to="/zona-partido"
        className="mx-3 mb-3 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-bold transition-colors hover:bg-white/5"
        style={{ color: ACCENT }}
      >
        Ver calendario <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ---------- STANDINGS MINI ---------- */
function StandingsMini({
  rows,
  lcuPos,
}: {
  rows: Tables<"league_standings">[];
  lcuPos: number | null;
}) {
  const logos = useTeamLogos();
  return (
    <div
      className="rounded-2xl border h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.07)",
        minHeight: 320,
      }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4" style={{ color: ACCENT }} />
          <h3
            className="font-extrabold text-white uppercase tracking-wider"
            style={{ fontSize: 12, letterSpacing: "0.1em" }}
          >
            Tabla de posiciones
          </h3>
        </div>
        {lcuPos && (
          <span
            className="text-[11px] font-extrabold px-2 py-0.5 rounded-md"
            style={{
              color: ACCENT,
              background: `${ACCENT}1a`,
              border: `1px solid ${ACCENT}33`,
            }}
          >
            LCU #{lcuPos}
          </span>
        )}
      </div>
      <div className="flex-1 px-3 pb-3 flex flex-col gap-1">
        {rows.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
            Sin datos
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-[24px_1fr_28px_28px] items-center text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 pb-1"
            >
              <span>#</span>
              <span>Equipo</span>
              <span className="text-center">DG</span>
              <span className="text-center">PTS</span>
            </div>
            {rows.map((row) => {
              const isLCU = row.team === LCU;
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[24px_1fr_28px_28px] items-center px-2 py-1.5 rounded-lg"
                  style={{
                    background: isLCU ? `${ACCENT}14` : "transparent",
                    border: isLCU ? `1px solid ${ACCENT}33` : "1px solid transparent",
                  }}
                >
                  <span
                    className={`text-[12px] font-bold tabular-nums ${
                      isLCU ? "" : "text-white/55"
                    }`}
                    style={isLCU ? { color: ACCENT } : undefined}
                  >
                    {row.pos}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TeamCrest
                      teamName={row.team}
                      logoUrl={logos[row.team]}
                      size={16}
                    />
                    <span
                      className={`text-[12px] font-semibold truncate ${
                        isLCU ? "" : "text-white/85"
                      }`}
                      style={isLCU ? { color: ACCENT } : undefined}
                    >
                      {row.team}
                    </span>
                  </div>
                  <span className="text-center text-[11px] tabular-nums text-white/55">
                    {row.dg > 0 ? `+${row.dg}` : row.dg}
                  </span>
                  <span
                    className={`text-center text-[12px] font-extrabold tabular-nums ${
                      isLCU ? "" : "text-white"
                    }`}
                    style={isLCU ? { color: ACCENT } : undefined}
                  >
                    {row.pts}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
      <Link
        to="/zona-partido"
        className="mx-3 mb-3 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-bold transition-colors hover:bg-white/5"
        style={{ color: ACCENT }}
      >
        Ver tabla completa <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ============================================================ */
/*  TU CLUB SECTION                                              */
/* ============================================================ */

function TuClubSection() {
  return (
    <section>
      <SectionHeader
        eyebrow="TU CLUB"
        title="Conoce a tu equipo"
        href="/club"
        hrefLabel="Ir al Club"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <TuClubPlantelCard />
        <TuClubAcademiaCard />
        <TuClubNoticiasCard />
      </div>
    </section>
  );
}

/* ---------- Tu Club: Plantel ---------- */
function TuClubPlantelCard() {
  const [activePos, setActivePos] = useState<ClubPosition>("Delanteros");
  const positions: ClubPosition[] = [
    "Porteros",
    "Defensas",
    "Mediocampistas",
    "Delanteros",
    "Cuerpo Técnico",
  ];
  const players = CLUB_ROSTER[activePos].slice(0, 4);

  return (
    <div
      className="lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col"
      style={{
        background: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.07)",
        minHeight: 280,
      }}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: ACCENT }} />
            <h3
              className="font-extrabold text-white"
              style={{ fontSize: 18, letterSpacing: "-0.01em" }}
            >
              Nuestro plantel
            </h3>
          </div>
          <Link
            to="/club"
            className="inline-flex items-center gap-1 text-[12px] font-bold transition-colors hover:text-white"
            style={{ color: ACCENT }}
          >
            Ver todo
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Position tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4 -mx-1 px-1">
          {positions.map((pos) => {
            const active = pos === activePos;
            return (
              <button
                key={pos}
                onClick={() => setActivePos(pos)}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0"
                style={
                  active
                    ? {
                        backgroundColor: `${ACCENT}26`,
                        color: ACCENT,
                        borderColor: `${ACCENT}80`,
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "rgba(255,255,255,0.55)",
                        borderColor: "rgba(255,255,255,0.1)",
                      }
                }
              >
                {pos}
              </button>
            );
          })}
        </div>

        {/* Players grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 content-start">
          <AnimatePresence mode="popLayout">
            {players.map((player) => (
              <motion.div
                key={`${activePos}-${player.name}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border bg-black/30 p-2.5 transition-colors hover:border-[#00abc4]/50"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center mb-1.5 relative overflow-hidden">
                  <span className="text-2xl font-extrabold text-white/55">
                    {player.number}
                  </span>
                  <span className="absolute top-1 right-1 text-sm">
                    {player.flag}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-white truncate">
                  {player.name}
                </div>
                <div className="text-[10px] text-white/50 truncate">
                  {player.role ? player.role : `#${player.number}`}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tu Club: Academia ---------- */
function TuClubAcademiaCard() {
  return (
    <div
      className="lg:col-span-1 rounded-2xl border overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #001a1f 0%, #0a0a0a 60%, #001218 100%)",
        borderColor: "rgba(255,255,255,0.07)",
        minHeight: 280,
      }}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" style={{ color: ACCENT }} />
            <h3
              className="font-extrabold text-white"
              style={{ fontSize: 18, letterSpacing: "-0.01em" }}
            >
              Academia
            </h3>
          </div>
          <Link
            to="/club"
            className="inline-flex items-center gap-1 text-[12px] font-bold transition-colors hover:text-white"
            style={{ color: ACCENT }}
          >
            Ver
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          {CLUB_ACADEMY_CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.name}
                to="/club"
                className="group flex items-center gap-2.5 rounded-lg border bg-black/20 px-2.5 py-2 transition-all hover:border-[#00abc4]/50"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: `${ACCENT}1f` }}
                >
                  <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white truncate leading-tight">
                    {c.name}
                  </div>
                  <div
                    className="text-[10px] font-bold tracking-wide truncate"
                    style={{ color: ACCENT }}
                  >
                    {c.age}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tu Club: Noticias (carousel) ---------- */
function TuClubNoticiasCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CLUB_NEWS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const current = CLUB_NEWS[index];

  return (
    <div
      className="lg:col-span-1 rounded-2xl border overflow-hidden flex flex-col"
      style={{
        background: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.07)",
        minHeight: 280,
      }}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper
              className="w-4 h-4"
              style={{ color: "hsl(336 80% 77%)" }}
            />
            <h3
              className="font-extrabold text-white"
              style={{ fontSize: 18, letterSpacing: "-0.01em" }}
            >
              Noticias
            </h3>
          </div>
          <Link
            to="/club"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-white/85 hover:text-white transition-colors"
          >
            Ver todas
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carousel */}
        <Link
          to="/club"
          className="relative flex-1 rounded-xl border overflow-hidden block group"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.07)",
            minHeight: 180,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 flex flex-col"
            >
              <div
                className="h-20 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${current.tagColor.replace(
                    ")",
                    " / 0.4)",
                  )} 0%, #0a0a0a 100%)`,
                }}
              />
              <div className="p-3 flex-1 flex flex-col">
                <span
                  className="self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1.5"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: current.tagColor,
                    border: `1px solid ${current.tagColor.replace(")", " / 0.4)")}`,
                  }}
                >
                  {current.tag}
                </span>
                <div className="text-[12px] font-semibold text-white leading-snug line-clamp-2 mb-2">
                  {current.title}
                </div>
                <div className="text-[10px] text-white/55 mt-auto flex items-center gap-2">
                  <span>{current.date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span>{current.read}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Link>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {CLUB_NEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir a noticia ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 18 : 6,
                background:
                  i === index ? "hsl(336 80% 77%)" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  FAN ZONE SECTION — Ranking + Premios                         */
/* ============================================================ */

const RANKING = [
  { name: "Mariana López", points: 18920, badge: "Amo Élite" },
  { name: "Rafa SJC", points: 17450, badge: "Amo Élite" },
  { name: "Cabeño 4ever", points: 15280, badge: "Amo" },
  { name: "Ana P.", points: 14110, badge: "Amo" },
  { name: "Baja Pride", points: 13560, badge: "Amo" },
];

const PRIZES = [
  {
    icon: Ticket,
    color: ACCENT,
    title: "Boletos para el próximo partido",
    threshold: "5,000 pts",
  },
  {
    icon: ShoppingBag,
    color: "hsl(336 80% 77%)",
    title: "Jersey oficial firmado",
    threshold: "15,000 pts",
  },
  {
    icon: Crown,
    color: "#F59E0B",
    title: "Pase del Amo · 20% en tienda",
    threshold: "10,000 pts",
  },
  {
    icon: Gift,
    color: "#A78BFA",
    title: "Experiencia en el vestuario",
    threshold: "25,000 pts",
  },
];

function FanZoneSection({ onLoginClick }: { onLoginClick: () => void }) {
  const { user } = useAuth();

  return (
    <section>
      <SectionHeader
        eyebrow="FAN ZONE"
        title="Juega y Gana Premios"
        href="/fan-zone"
        hrefLabel="Ir a Fan Zone"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Ranking — 60% */}
        <div
          className="lg:col-span-3 rounded-2xl border overflow-hidden flex flex-col"
          style={{
            background:
              "linear-gradient(135deg, #0d0d12 0%, #0a0a0a 100%)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: ACCENT }} />
              <h3
                className="font-extrabold text-white uppercase"
                style={{ fontSize: 12, letterSpacing: "0.16em" }}
              >
                Ranking general
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Top 5 de la semana
            </span>
          </div>

          <div className="flex-1 px-3 pb-4 flex flex-col gap-1">
            {RANKING.map((r, i) => {
              const medalColor =
                i === 0
                  ? "#F59E0B"
                  : i === 1
                  ? "#CBD5E1"
                  : i === 2
                  ? "#D97706"
                  : "rgba(255,255,255,0.4)";
              return (
                <div
                  key={r.name}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background:
                      i < 3 ? "rgba(255,255,255,0.03)" : "transparent",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[12px] tabular-nums shrink-0"
                    style={{
                      background:
                        i < 3 ? `${medalColor}22` : "rgba(255,255,255,0.06)",
                      color: i < 3 ? medalColor : "rgba(255,255,255,0.65)",
                      border: `1px solid ${i < 3 ? medalColor + "55" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">
                      {r.name}
                    </div>
                    <div className="text-[11px] text-white/50">{r.badge}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className="text-[14px] font-extrabold tabular-nums"
                      style={{ color: ACCENT }}
                    >
                      {r.points.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">
                      pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!user && (
            <div className="px-5 pb-5">
              <button
                onClick={onLoginClick}
                className="w-full inline-flex items-center justify-center gap-2 font-bold rounded-full transition-opacity hover:opacity-90 h-10"
                style={{ background: ACCENT, color: "#000", fontSize: 13 }}
              >
                Inicia sesión para competir
              </button>
            </div>
          )}
        </div>

        {/* Premios — 40% */}
        <div
          className="lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col"
          style={{
            background: "#0f0f0f",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="px-5 pt-5 pb-3 flex items-center gap-2">
            <Gift className="w-4 h-4" style={{ color: ACCENT }} />
            <h3
              className="font-extrabold text-white uppercase"
              style={{ fontSize: 12, letterSpacing: "0.16em" }}
            >
              Premios por puntos
            </h3>
          </div>
          <div className="flex-1 px-3 pb-3 grid grid-cols-1 gap-2">
            {PRIZES.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${p.color}1f`,
                      border: `1px solid ${p.color}40`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-white leading-tight">
                      {p.title}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider mt-0.5 font-bold"
                      style={{ color: p.color }}
                    >
                      A partir de {p.threshold}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/fan-zone"
            className="mx-3 mb-3 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-bold transition-colors hover:bg-white/5"
            style={{ color: ACCENT }}
          >
            Ver todos los premios <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  TIENDA OFICIAL — 50/50                                       */
/* ============================================================ */

function TiendaSection() {
  const { data: products = [], isLoading } = useShopifyProducts({ first: 6 });
  const featured = products.slice(0, 4);

  return (
    <section>
      <SectionHeader
        eyebrow="TIENDA OFICIAL"
        title="Lleva el escudo a donde vayas"
        href="/tienda"
        hrefLabel="Ver tienda"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hero card 50% */}
        <Link
          to="/tienda"
          className="group relative rounded-2xl overflow-hidden border transition-all hover:border-[#00abc4]/40"
          style={{
            background: "#0f0f0f",
            borderColor: "rgba(255,255,255,0.07)",
            minHeight: 360,
          }}
        >
          <img
            src={tiendaHero}
            alt="Tienda Oficial Los Cabos United"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #050505 0%, rgba(5,5,5,0.5) 55%, rgba(5,5,5,0.1) 100%)",
            }}
          />
          <div className="relative h-full flex flex-col justify-between p-6 z-10 min-h-[360px]">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                style={{
                  color: ACCENT,
                  borderColor: `${ACCENT}66`,
                  background: "rgba(0,0,0,0.55)",
                }}
              >
                Tienda Oficial
              </span>
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{
                  background: ACCENT,
                  color: "#000",
                }}
              >
                Nueva colección
              </span>
            </div>
            <div>
              <h3
                className="font-extrabold text-white mb-3"
                style={{ fontSize: "clamp(24px, 3vw, 34px)", letterSpacing: "-0.025em", lineHeight: 1.05 }}
              >
                Jersey 2025–26
              </h3>
              <p className="text-white/75 text-[13px] mb-5 max-w-sm leading-relaxed">
                Vístete como un Amo del Paraíso. Edición de temporada con detalles bordados.
              </p>
              <div
                className="inline-flex items-center gap-2 font-bold rounded-full"
                style={{
                  background: ACCENT,
                  color: "#000",
                  height: 42,
                  padding: "0 18px",
                  fontSize: 13,
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                Comprar ahora
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>

        {/* Products grid 50% — 2x2 */}
        <div
          className="rounded-2xl border p-4"
          style={{
            background: "#0f0f0f",
            borderColor: "rgba(255,255,255,0.07)",
            minHeight: 360,
          }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3
              className="font-extrabold text-white uppercase"
              style={{ fontSize: 12, letterSpacing: "0.16em" }}
            >
              Destacados
            </h3>
            <Link
              to="/tienda"
              className="text-[12px] font-bold inline-flex items-center gap-1"
              style={{ color: ACCENT }}
            >
              Ver más <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-square rounded-xl mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              : featured.length === 0
              ? (
                <div className="col-span-2 flex items-center justify-center py-12 text-white/40 text-sm">
                  No hay productos disponibles
                </div>
              )
              : featured.map((product, i) => (
                  <EditorialProductCard
                    key={product.node.id}
                    product={product}
                    index={i}
                  />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  VISITA LOS CABOS                                             */
/* ============================================================ */

function LosCabosStrip() {
  const featured = FEATURED_PLACE_IDS.map((id) =>
    PLACES.find((p) => p.id === id)
  ).filter(Boolean) as (typeof PLACES)[number][];

  return (
    <section>
      <SectionHeader
        eyebrow="VISITA LOS CABOS"
        title="El Paraíso te espera"
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
        style={{ display: "flex", flexDirection: "column", gap: 32 }}
      >
        <HomeHero />
        <SectionDivider />
        <MatchZoneSection />
        <SectionDivider />
        <TuClubSection />
        <SectionDivider />
        <FanZoneSection onLoginClick={() => setAuthOpen(true)} />
        <SectionDivider />
        <TiendaSection />
        <SectionDivider />
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

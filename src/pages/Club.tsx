import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  GraduationCap,
  Sun,
  ArrowRight,
  Goal,
  Shield,
  Facebook,
  Instagram,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";
import ligaPremierLogo from "@/assets/liga-premier-logo.png";

/* ----------------------------- Placeholder data ----------------------------- */

const FOUNDED_YEAR = 2022;

const MILESTONES = [
  { year: "Enero 2022", label: "Fundación" },
  { year: "Agosto 2022", label: "Debút" },
  { year: "Mayo 2024", label: "Campeones" },
];

const SEASON_STATS = [
  { value: "18", label: "Partidos Jugados" },
  { value: "3°", label: "Posición en Liga" },
  { value: "32", label: "Goles Anotados" },
];

const PLAYER_OF_WEEK = {
  name: "Diego Hernández",
  position: "Delantero",
  number: 9,
  matches: 17,
  goals: 12,
  assists: 6,
};

type Position = "Porteros" | "Defensas" | "Mediocampistas" | "Delanteros" | "Cuerpo Técnico";

const ROSTER: Record<
  Position,
  { name: string; number: number | string; flag: string; age: number; height: string; matches: number; role?: string }[]
> = {
  Porteros: [
    { name: "Luis Robles", number: 1, flag: "🇲🇽", age: 28, height: "1.88 m", matches: 16 },
    { name: "Andrés Castillo", number: 12, flag: "🇲🇽", age: 22, height: "1.86 m", matches: 4 },
    { name: "Mateo Salinas", number: 25, flag: "🇦🇷", age: 31, height: "1.90 m", matches: 0 },
    { name: "Iván Flores", number: 30, flag: "🇲🇽", age: 19, height: "1.84 m", matches: 1 },
  ],
  Defensas: [
    { name: "Carlos Vela Jr.", number: 2, flag: "🇲🇽", age: 26, height: "1.82 m", matches: 18 },
    { name: "Rafael Márquez", number: 4, flag: "🇲🇽", age: 30, height: "1.85 m", matches: 17 },
    { name: "Sebastián Núñez", number: 5, flag: "🇨🇴", age: 24, height: "1.83 m", matches: 15 },
    { name: "Emilio Pacheco", number: 3, flag: "🇲🇽", age: 22, height: "1.79 m", matches: 12 },
    { name: "Joaquín Rivas", number: 13, flag: "🇨🇱", age: 27, height: "1.81 m", matches: 9 },
  ],
  Mediocampistas: [
    { name: "Juan Pablo Ortiz", number: 6, flag: "🇲🇽", age: 25, height: "1.76 m", matches: 18 },
    { name: "Lucas Bermúdez", number: 8, flag: "🇦🇷", age: 28, height: "1.78 m", matches: 16 },
    { name: "Alejandro Ríos", number: 10, flag: "🇲🇽", age: 24, height: "1.74 m", matches: 17 },
    { name: "Nicolás Vargas", number: 14, flag: "🇺🇾", age: 23, height: "1.77 m", matches: 11 },
    { name: "Marco Téllez", number: 17, flag: "🇲🇽", age: 21, height: "1.75 m", matches: 8 },
  ],
  Delanteros: [
    { name: "Diego Hernández", number: 9, flag: "🇲🇽", age: 26, height: "1.80 m", matches: 17 },
    { name: "Bruno Cardozo", number: 11, flag: "🇧🇷", age: 25, height: "1.79 m", matches: 16 },
    { name: "Adrián Solís", number: 19, flag: "🇲🇽", age: 22, height: "1.77 m", matches: 13 },
    { name: "Tomás Rincón", number: 22, flag: "🇻🇪", age: 27, height: "1.83 m", matches: 7 },
  ],
  "Cuerpo Técnico": [
    { name: "Ricardo Mendoza", number: "DT", flag: "🇲🇽", age: 52, height: "—", matches: 18, role: "Director Técnico" },
    { name: "Pablo Espinoza", number: "AT", flag: "🇲🇽", age: 45, height: "—", matches: 18, role: "Asistente Técnico" },
    { name: "Héctor Lozano", number: "PF", flag: "🇲🇽", age: 41, height: "—", matches: 18, role: "Preparador Físico" },
    { name: "Sergio Vidal", number: "PA", flag: "🇪🇸", age: 38, height: "—", matches: 18, role: "Entrenador de Porteros" },
  ],
};

const ACADEMY_CATEGORIES = [
  {
    icon: Goal,
    name: "Sub-17",
    desc: "Talentos formándose para dar el salto al primer equipo.",
  },
  {
    icon: GraduationCap,
    name: "Sub-15",
    desc: "Educación deportiva integral y desarrollo técnico.",
  },
  {
    icon: Sun,
    name: "Femenil",
    desc: "Categoría en crecimiento, abriendo espacios en el paraíso.",
  },
];

const NOTES = [
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

type SocialNetwork = "facebook" | "instagram" | "x";

const FAN_POSTS: { user: string; handle: string; network: SocialNetwork; text: string }[] = [
  {
    user: "Mariana López",
    handle: "@marisol_lc",
    network: "instagram",
    text: "¡Qué partidazo! Orgullosa de ser parte de esta afición 💚 #AmosDelParaíso",
  },
  {
    user: "Rafa SJC",
    handle: "@rafa_sjc",
    network: "x",
    text: "Vamos por la Serie A 🏆 No hay nada como ver a Los Cabos United en casa. #AmosDelParaíso",
  },
  {
    user: "Cabeño 4ever",
    handle: "Cabeño 4ever",
    network: "facebook",
    text: "La afición más caliente del noroeste presente otra vez en el estadio. #AmosDelParaíso",
  },
  {
    user: "Ana P.",
    handle: "@ana_p",
    network: "instagram",
    text: "Mi club, mi paraíso. Aquí se respira fútbol 🌊⚽ #AmosDelParaíso",
  },
  {
    user: "Baja Pride",
    handle: "@baja_pride",
    network: "x",
    text: "Amos del Paraíso siempre. Esto no se compra, se vive. #AmosDelParaíso",
  },
];

/* --------------------------------- Helpers --------------------------------- */

const PRIMARY = "hsl(189 100% 38%)"; // Brand blue from LCU crest (#00abc4)
const SECONDARY = "hsl(336 80% 77%)"; // Brand pink from LCU crest (#f298c0)

function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=0a0a0a&color=00abc4&bold=true&size=128`;
}

/* ---------------------------------- Page ---------------------------------- */

const Club = () => {
  const [activePos, setActivePos] = useState<Position>("Delanteros");
  const [mobileBottomTab, setMobileBottomTab] = useState<"vestuario" | "aficion">("vestuario");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-8"
    >
      {/* Mini-card de posición — centrada arriba */}
      <PositionMiniCard />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(140px,auto)] gap-4">
        {/* ADN Cabeño y Tu Estadio — 70% / 30% */}
        <HeroCard className="lg:col-span-8 md:col-span-2" />
        <StadiumCard className="lg:col-span-4 md:col-span-2 h-full" />

        {/* Nuestro Plantel — ancho completo (con Amo del Partido integrado) */}
        <RosterCard
          className="lg:col-span-12 md:col-span-2"
          activePos={activePos}
          setActivePos={setActivePos}
        />

        {/* Academias — ancho completo */}
        <AcademyCard className="lg:col-span-12 md:col-span-2" />

        {/* Desde el Vestuario y La Afición en vivo — 70% / 30% en desktop, tabs en móvil */}
        <div className="md:hidden col-span-1">
          <MobileBottomTabs activeTab={mobileBottomTab} setActiveTab={setMobileBottomTab} />
        </div>
        <NotesCard className="hidden md:block lg:col-span-8 md:col-span-2" />
        <FanTickerCard className="hidden md:block lg:col-span-4 md:col-span-2" />
      </div>
    </motion.div>
  );
};

export default Club;

/* ---------------------------- Card primitives ----------------------------- */

function CardShell({
  className = "",
  children,
  interactive = false,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      whileHover={interactive ? { scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 ${
        interactive ? "hover:border-[hsl(189_100%_38%/0.5)] hover:shadow-[0_0_24px_-8px_hsl(189_100%_38%/0.4)]" : ""
      } ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------- CARD 1 -------------------------------- */

function HeroCard({ className = "" }: { className?: string }) {
  return (
    <CardShell className={className} interactive>
      <img
        src={stadiumHero}
        alt="Estadio Los Cabos United"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-card/80 via-transparent to-transparent" />

      <div className="relative grid min-h-[230px] md:min-h-[320px] grid-rows-[auto_auto_1fr] gap-3 p-4 md:flex md:h-full md:flex-col md:justify-between md:gap-0 md:p-8">
        <div className="flex items-center">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
            style={{
              color: PRIMARY,
              borderColor: `${PRIMARY.replace(")", " / 0.4)")}`,
              backgroundColor: "hsl(189 100% 38% / 0.08)",
            }}
          >
            ADN Cabeño
          </span>
        </div>

        <div className="space-y-1.5 md:space-y-3 md:max-w-2xl">
          <h2 className="text-lg md:text-5xl font-extrabold tracking-tight leading-[1.1] md:leading-tight">
            Amos del Paraíso desde el {FOUNDED_YEAR}
          </h2>
          <p className="text-[11px] md:text-base text-muted-foreground leading-[1.4] md:leading-relaxed md:max-w-lg">
            Nacidos entre el desierto y el mar, Los Cabos United representa el orgullo
            sudcaliforniano. Un club joven con un sueño grande: llevar a Baja California Sur a la élite del fútbol mexicano.
          </p>
        </div>

        <div className="relative pt-2 md:pt-4 self-end">
          <div
            className="absolute left-[16.666%] right-[16.666%] top-[9px] h-px md:left-3 md:right-3 md:top-2"
            style={{ background: "hsl(189 100% 38% / 0.3)" }}
          />
          <div className="relative grid grid-cols-3 gap-2 md:flex md:min-w-0 md:justify-between">
            {MILESTONES.map((m) => (
              <div
                key={m.year}
                className="relative z-10 flex min-w-0 flex-col items-center gap-1 text-center"
              >
                <div
                  className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2"
                  style={{
                    backgroundColor: "hsl(0 0% 7%)",
                    borderColor: PRIMARY,
                    boxShadow: `0 0 10px ${PRIMARY.replace(")", " / 0.6)")}`,
                  }}
                />
                <span className="text-[10px] md:text-xs font-bold text-foreground leading-none">{m.year}</span>
                <span className="text-[9px] md:text-[10px] text-muted-foreground text-center leading-tight">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/* -------------------------------- CARD 2 -------------------------------- */

function StadiumCard({ className = "" }: { className?: string }) {
  return (
    <CardShell className={className} interactive>
      <img
        src={stadiumHero}
        alt="Estadio Don Koll"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-card/70 via-transparent to-transparent" />

      <div className="relative h-full p-5 md:p-7 flex flex-col justify-between min-h-[160px] md:min-h-[320px]">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
            style={{
              color: PRIMARY,
              borderColor: "hsl(189 100% 38% / 0.4)",
              backgroundColor: "hsl(189 100% 38% / 0.08)",
            }}
          >
            Tu Estadio
          </span>
        </div>

        <div className="space-y-1.5 md:space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Estadio Don Koll
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] md:text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: PRIMARY }} />
            <span>San José del Cabo, B.C.S.</span>
          </div>
        </div>

        {/* Inner glow / gradient overlay (bottom) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-2xl"
          style={{
            background:
              "linear-gradient(to top, hsl(0 0% 0% / 0.55) 0%, transparent 100%)",
          }}
        />
      </div>
    </CardShell>
  );
}

/* -------------------------------- Mini-card de posición (top, centrada) -------------------------------- */

function PositionMiniCard() {
  const LAST_5: ("W" | "D" | "L")[] = ["W", "W", "D", "L", "W"];

  const resultStyle = (r: "W" | "D" | "L") => {
    if (r === "W") return { bg: "hsl(142 76% 45%)", label: "G" };
    if (r === "D") return { bg: "hsl(45 95% 55%)", label: "E" };
    return { bg: "hsl(0 84% 60%)", label: "P" };
  };

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-4 md:gap-6 rounded-full border border-border bg-card/80 backdrop-blur px-4 md:px-5 py-2 md:py-2.5 shadow-lg">
        {/* Lugar actual */}
        <div className="flex items-center gap-2">
          <span
            className="text-2xl md:text-3xl font-extrabold tabular-nums leading-none"
            style={{
              color: PRIMARY,
              textShadow:
                "0 0 14px hsl(189 100% 38% / 0.55), 0 0 32px hsl(189 100% 38% / 0.18)",
            }}
          >
            3°
          </span>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-tight max-w-[80px]">
            Lugar
            <br />
            Actual
          </span>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-white/10" />

        {/* Últimos 5 partidos */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-tight hidden sm:inline">
            Últimos 5
          </span>
          <div className="flex items-center gap-1.5">
            {LAST_5.map((r, i) => {
              const s = resultStyle(r);
              return (
                <div
                  key={i}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-[11px] font-bold text-background"
                  style={{ backgroundColor: s.bg }}
                  title={r === "W" ? "Ganado" : r === "D" ? "Empate" : "Perdido"}
                >
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* CARD 3 (Amo de la Semana) — eliminada e integrada dentro de RosterCard */

/* -------------------------------- CARD 4 (Plantel) -------------------------------- */

function RosterCard({
  className = "",
  activePos,
  setActivePos,
}: {
  className?: string;
  activePos: Position;
  setActivePos: (p: Position) => void;
}) {
  const players = ROSTER[activePos];
  const positions: Position[] = ["Porteros", "Defensas", "Mediocampistas", "Delanteros", "Cuerpo Técnico"];
  const p = PLAYER_OF_WEEK;
  const [expandPlayers, setExpandPlayers] = useState(false);

  // Reset collapse when changing position tab
  useEffect(() => {
    setExpandPlayers(false);
  }, [activePos]);

  const visiblePlayers = expandPlayers ? players : players.slice(0, 4);
  const hiddenCount = players.length - visiblePlayers.length;

  return (
    <CardShell className={className}>
      <div className="p-5 md:p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-title">Nuestro Plantel</h3>
          <Shield className="w-4 h-4" style={{ color: PRIMARY }} />
        </div>

        {/* Amo del Partido — destacado */}
        <div
          className="relative rounded-xl border overflow-hidden mb-5 p-4"
          style={{
            borderColor: "hsl(189 100% 38% / 0.35)",
            background:
              "linear-gradient(90deg, hsl(189 100% 38% / 0.10) 0%, hsl(0 0% 7% / 0.4) 60%, transparent 100%)",
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ background: PRIMARY }}
          />
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src={avatarUrl(p.name)}
              alt={p.name}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 shrink-0"
              style={{ borderColor: "hsl(189 100% 38% / 0.6)" }}
            />
            <div className="min-w-0 flex-1">
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold mb-1"
                style={{ backgroundColor: "hsl(336 80% 77% / 0.15)", color: SECONDARY }}
              >
                <Star className="w-2.5 h-2.5" /> AMO DEL PARTIDO
              </div>
              <div className="text-base md:text-lg font-bold text-foreground truncate leading-tight">
                {p.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {p.position} · #{p.number} · Último partido
              </div>
            </div>
            <div className="hidden sm:flex items-stretch gap-3 shrink-0">
              {[
                { label: "GOL", value: p.goals },
                { label: "AST", value: p.assists },
                { label: "PJ", value: p.matches },
              ].map((s, i, arr) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center px-3 ${
                    i < arr.length - 1 ? "border-r border-white/10" : ""
                  }`}
                >
                  <span className="text-xl md:text-2xl font-bold text-foreground tabular-nums leading-none">
                    {s.value}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-[0.18em] mt-1 font-semibold"
                    style={{ color: PRIMARY }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile-only inline stats chips */}
          <div className="flex sm:hidden items-center gap-1.5 mt-3 flex-wrap">
            {[
              { label: "GOL", value: p.goals },
              { label: "AST", value: p.assists },
              { label: "PJ", value: p.matches },
            ].map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                style={{
                  borderColor: "hsl(189 100% 38% / 0.3)",
                  backgroundColor: "hsl(189 100% 38% / 0.08)",
                }}
              >
                <span className="tabular-nums font-bold text-foreground">{s.value}</span>
                <span style={{ color: PRIMARY }}>{s.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-5 -mx-1 px-1">
          {positions.map((pos) => {
            const active = pos === activePos;
            return (
              <button
                key={pos}
                onClick={() => setActivePos(pos)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border"
                style={
                  active
                    ? {
                        backgroundColor: "hsl(189 100% 38% / 0.15)",
                        color: PRIMARY,
                        borderColor: `${PRIMARY.replace(")", " / 0.5)")}`,
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "hsl(0 0% 63%)",
                        borderColor: "hsl(0 0% 16%)",
                      }
                }
              >
                {pos}
              </button>
            );
          })}
        </div>

        {/* Player grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 content-start">
          {/* On mobile, show collapsed list. On md+, show all. */}
          {players.map((player, idx) => {
            const hideOnMobile = !expandPlayers && idx >= 4;
            return (
              <motion.div
                key={player.name}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`group relative rounded-xl border border-border bg-background/40 p-3 transition-all hover:border-[hsl(189_100%_38%/0.5)] hover:shadow-[0_0_18px_-6px_hsl(189_100%_38%/0.4)] ${
                  hideOnMobile ? "hidden md:block" : ""
                }`}
              >
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-2 relative overflow-hidden">
                  <span className="text-3xl font-extrabold text-muted-foreground/60">
                    {player.number}
                  </span>
                  <span className="absolute top-1 right-1 text-sm">{player.flag}</span>
                </div>
                <div className="text-xs font-semibold text-foreground truncate">
                  {player.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {player.role ? player.role : `#${player.number}`}
                </div>

                {/* Hover detail overlay */}
                <div className="absolute inset-0 rounded-xl bg-card/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-center text-[11px]">
                  <div className="font-semibold text-foreground mb-1.5 truncate">
                    {player.name}
                  </div>
                  <div className="space-y-0.5 text-muted-foreground">
                    <div>Edad: <span className="text-foreground">{player.age}</span></div>
                    <div>Altura: <span className="text-foreground">{player.height}</span></div>
                    <div>Partidos: <span className="text-foreground">{player.matches}</span></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile-only "Ver todos" toggle */}
        {players.length > 4 && (
          <button
            onClick={() => setExpandPlayers((v) => !v)}
            className="md:hidden mt-3 self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
            style={{
              borderColor: "hsl(189 100% 38% / 0.4)",
              color: PRIMARY,
              backgroundColor: "hsl(189 100% 38% / 0.08)",
            }}
          >
            {expandPlayers ? "Ver menos" : `Ver todos (${players.length})`}
            <ArrowRight className={`w-3 h-3 transition-transform ${expandPlayers ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>
    </CardShell>
  );
}

/* -------------------------------- CARD 5 (Academias) -------------------------------- */

function AcademyCard({ className = "" }: { className?: string }) {
  return (
    <CardShell className={className} interactive>
      <div className="p-5 md:p-6 h-full flex flex-col">
        <div className="mb-4">
          <span className="text-label text-muted-foreground">Academias LC United</span>
          <h3 className="text-title mt-1">Formando a los próximos Amos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2.5 flex-1">
          {ACADEMY_CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className="rounded-xl border border-border bg-background/40 p-2.5 md:p-3 flex items-center md:items-start gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "hsl(189 100% 38% / 0.12)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: PRIMARY }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug line-clamp-1 md:line-clamp-none">
                    {c.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 md:mt-4 flex flex-row gap-2 items-center justify-between">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold md:h-10 md:px-4">
            Inscribe a tu hijo
          </Button>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap"
            style={{
              backgroundColor: "hsl(189 100% 38% / 0.12)",
              color: PRIMARY,
            }}
          >
            <span className="hidden sm:inline">CURSOS DE VERANO 2025</span>
            <span className="sm:hidden">VERANO 2025</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </CardShell>
  );
}

/* -------------------------------- CARD 6 (Vestuario) -------------------------------- */

function NotesCard({ className = "" }: { className?: string }) {
  return (
    <CardShell className={className}>
      <div className="p-5 md:p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-title">Desde el Vestuario</h3>
          <a
            href="#"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {NOTES.map((n) => (
            <motion.a
              key={n.title}
              href="#"
              whileHover={{ y: -2 }}
              className="group rounded-xl border border-border bg-background/40 overflow-hidden flex flex-col transition-all hover:border-[hsl(189_100%_38%/0.4)]"
            >
              <div className="relative h-24 overflow-hidden bg-muted">
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(0 0% 6%) 100%)",
                  }}
                />
                <span
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: "hsl(0 0% 7% / 0.8)",
                    color: n.tagColor,
                    border: `1px solid ${n.tagColor.replace(")", " / 0.4)")}`,
                  }}
                >
                  {n.tag}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-2">
                  {n.title}
                </div>
                <div className="text-[10px] text-muted-foreground mt-auto flex items-center gap-2">
                  <span>{n.date}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span>{n.read}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

/* -------------------------------- CARD 8 -------------------------------- */

// Inline X (Twitter) logo since lucide doesn't ship it
function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const NETWORK_META: Record<
  SocialNetwork,
  { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  facebook: { label: "Facebook", color: "hsl(221 78% 60%)", Icon: Facebook },
  instagram: { label: "Instagram", color: "hsl(330 78% 60%)", Icon: Instagram },
  x: { label: "X", color: "hsl(0 0% 95%)", Icon: XLogo },
};

function FanTickerCard({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % FAN_POSTS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <CardShell className={className}>
      <div className="relative h-full p-5 md:p-6 flex flex-col min-h-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: PRIMARY }}
            />
            <span className="text-label text-muted-foreground">La Afición · En vivo</span>
          </div>
          <span
            className="text-[10px] font-bold tracking-wider"
            style={{ color: PRIMARY }}
          >
            #AmosDelParaíso
          </span>
        </div>

        {/* Vertical carousel */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {FAN_POSTS.map((post, i) =>
              i === index ? (
                <motion.div
                  key={post.handle + i}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 flex flex-col"
                >
                  <SocialPost post={post} />
                </motion.div>
              ) : null,
            )}
          </AnimatePresence>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {FAN_POSTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Post ${i + 1}`}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === index ? 18 : 6,
                backgroundColor:
                  i === index ? PRIMARY : "hsl(0 0% 100% / 0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function SocialPost({ post }: { post: (typeof FAN_POSTS)[number] }) {
  const meta = NETWORK_META[post.network];
  const Icon = meta.Icon;
  return (
    <div
      className="relative h-full rounded-xl border border-border bg-background/40 p-4 flex flex-col gap-3 overflow-hidden"
    >
      {/* Network badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${meta.color.replace(")", " / 0.15)")}` }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate leading-tight">
              {post.user}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {post.handle}
            </div>
          </div>
        </div>
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "hsl(0 0% 100% / 0.04)", color: meta.color }}
          aria-label={meta.label}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Post text */}
      <p className="text-sm text-foreground/90 leading-relaxed flex-1">
        {post.text.split(/(#\w+)/g).map((part, i) =>
          part.startsWith("#") ? (
            <span key={i} className="font-semibold" style={{ color: PRIMARY }}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-white/5">
        <span className="uppercase tracking-wider">vía {meta.label}</span>
        <span>hace 2h</span>
      </div>
    </div>
  );
}

/* -------------------------------- Mobile-only combined Vestuario + Afición -------------------------------- */

function MobileBottomTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: "vestuario" | "aficion";
  setActiveTab: (t: "vestuario" | "aficion") => void;
}) {
  const [fanIndex, setFanIndex] = useState(0);

  useEffect(() => {
    if (activeTab !== "aficion") return;
    const id = setInterval(() => {
      setFanIndex((i) => (i + 1) % FAN_POSTS.length);
    }, 4500);
    return () => clearInterval(id);
  }, [activeTab]);

  return (
    <CardShell>
      <div className="p-4 flex flex-col" style={{ minHeight: 360 }}>
        {/* Tabs header */}
        <div className="flex items-center gap-1.5 mb-4 p-1 rounded-full border border-border bg-background/40 self-start">
          {[
            { id: "vestuario" as const, label: "Vestuario" },
            { id: "aficion" as const, label: "Afición" },
          ].map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                style={
                  active
                    ? {
                        backgroundColor: "hsl(189 100% 38% / 0.15)",
                        color: PRIMARY,
                        border: "1px solid hsl(189 100% 38% / 0.5)",
                      }
                    : {
                        color: "hsl(0 0% 63%)",
                        border: "1px solid transparent",
                      }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === "vestuario" ? (
            <div className="grid grid-cols-1 gap-2.5">
              {NOTES.map((n) => (
                <a
                  key={n.title}
                  href="#"
                  className="group rounded-xl border border-border bg-background/40 p-3 flex items-center gap-3 transition-all hover:border-[hsl(189_100%_38%/0.4)]"
                >
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
                    style={{
                      backgroundColor: "hsl(0 0% 7% / 0.8)",
                      color: n.tagColor,
                      border: `1px solid ${n.tagColor.replace(")", " / 0.4)")}`,
                    }}
                  >
                    {n.tag}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                      {n.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{n.date}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      <span>{n.read}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: PRIMARY }}
                  />
                  <span className="text-label text-muted-foreground">En vivo</span>
                </div>
                <span
                  className="text-[10px] font-bold tracking-wider"
                  style={{ color: PRIMARY }}
                >
                  #AmosDelParaíso
                </span>
              </div>

              <div className="relative flex-1 overflow-hidden" style={{ minHeight: 220 }}>
                <AnimatePresence mode="wait">
                  {FAN_POSTS.map((post, i) =>
                    i === fanIndex ? (
                      <motion.div
                        key={post.handle + i}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-0 flex flex-col"
                      >
                        <SocialPost post={post} />
                      </motion.div>
                    ) : null,
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                {FAN_POSTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFanIndex(i)}
                    aria-label={`Post ${i + 1}`}
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: i === fanIndex ? 18 : 6,
                      backgroundColor:
                        i === fanIndex ? PRIMARY : "hsl(0 0% 100% / 0.15)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}

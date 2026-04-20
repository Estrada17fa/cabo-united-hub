import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  GraduationCap,
  Sun,
  ArrowRight,
  Goal,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";
import ligaPremierLogo from "@/assets/liga-premier-logo.png";

/* ----------------------------- Placeholder data ----------------------------- */

const FOUNDED_YEAR = 2019;

const MILESTONES = [
  { year: "2019", label: "Fundación" },
  { year: "2020", label: "Debut Liga" },
  { year: "2022", label: "Primer Título" },
  { year: "2023", label: "Ascenso" },
  { year: "2025", label: "Serie A" },
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
    tagColor: "hsl(142 76% 50%)",
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

const FAN_TICKER = [
  "🏟️ @cabeño_4ever: ¡Amos del Paraíso siempre!",
  "⚽ @marisol_lc: Orgullosa de Los Cabos United",
  "🌵 @baja_pride: La afición más caliente del noroeste",
  "🔥 @rafa_sjc: Vamos por la Serie A 🏆",
  "💙 @ana_p: Mi club, mi paraíso",
  "🌊 @cabofan: ¡Aquí se respira fútbol!",
];

/* --------------------------------- Helpers --------------------------------- */

const PRIMARY = "hsl(142 76% 45%)"; // Team accent green for "Tu Club" page

function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=0a0a0a&color=22c55e&bold=true&size=128`;
}

/* ---------------------------------- Page ---------------------------------- */

const Club = () => {
  const [activePos, setActivePos] = useState<Position>("Delanteros");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-8"
    >
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(140px,auto)] gap-4">
        {/* Posición y Amo de la Semana — mitad y mitad */}
        <StatsCard className="lg:col-span-6 md:col-span-1 h-full" />
        <PlayerOfWeekCard className="lg:col-span-6 md:col-span-1 h-full" />

        {/* Header ADN Cabeño — ancho completo */}
        <HeroCard className="lg:col-span-12 md:col-span-2" />

        {/* Nuestro Plantel — ancho completo */}
        <RosterCard
          className="lg:col-span-12 md:col-span-2"
          activePos={activePos}
          setActivePos={setActivePos}
        />

        {/* Academias — ancho completo */}
        <AcademyCard className="lg:col-span-12 md:col-span-2" />

        {/* Desde el Vestuario y La Afición en vivo — mitad y mitad */}
        <NotesCard className="lg:col-span-8 md:col-span-2" />
        <FanTickerCard className="lg:col-span-4 md:col-span-2" />
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
        interactive ? "hover:border-[hsl(142_76%_45%/0.5)] hover:shadow-[0_0_24px_-8px_hsl(142_76%_45%/0.4)]" : ""
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

      <div className="relative h-full p-6 md:p-8 flex flex-col justify-between min-h-[320px]">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
            style={{
              color: PRIMARY,
              borderColor: `${PRIMARY.replace(")", " / 0.4)")}`,
              backgroundColor: "hsl(142 76% 45% / 0.08)",
            }}
          >
            ADN Cabeño
          </span>
        </div>

        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Amos del Paraíso desde {FOUNDED_YEAR}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
            Nacidos entre el desierto y el mar, Los Cabos United representa el orgullo
            sudcaliforniano. Un club joven con un sueño grande: llevar a Baja California Sur a la élite del fútbol mexicano.
          </p>
        </div>

        {/* Timeline */}
        <div className="pt-4">
          <div className="relative overflow-x-auto scrollbar-hide -mx-2 px-2">
            <div className="flex items-start gap-2 min-w-max md:min-w-0 md:justify-between relative">
              {/* connecting line */}
              <div
                className="absolute left-3 right-3 top-2 h-px"
                style={{ background: "hsl(142 76% 45% / 0.3)" }}
              />
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className="relative z-10 flex flex-col items-center gap-1 min-w-[72px]"
                >
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor: "hsl(0 0% 7%)",
                      borderColor: PRIMARY,
                      boxShadow: `0 0 10px ${PRIMARY.replace(")", " / 0.6)")}`,
                    }}
                  />
                  <span className="text-xs font-bold text-foreground mt-1">{m.year}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/* -------------------------------- CARD 2 -------------------------------- */

function StatsCard({ className = "" }: { className?: string }) {
  // Últimos 5 partidos: W = ganado, D = empate, L = perdido (orden: más reciente primero)
  const LAST_5: ("W" | "D" | "L")[] = ["W", "W", "D", "L", "W"];

  const resultStyle = (r: "W" | "D" | "L") => {
    if (r === "W") return { bg: "hsl(142 76% 45%)", label: "G" };
    if (r === "D") return { bg: "hsl(45 95% 55%)", label: "E" };
    return { bg: "hsl(0 84% 60%)", label: "P" };
  };

  return (
    <CardShell className={className} interactive>
      <div className="p-4 md:p-5 flex flex-col gap-3">
        {/* Título: Temporada actual */}
        <div className="text-center">
          <div className="text-lg md:text-xl font-extrabold tracking-tight text-foreground leading-tight">
            Apertura 2026
          </div>
          <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
            Temporada Actual
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Hero stat: posición */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="text-5xl md:text-6xl font-extrabold tabular-nums leading-none"
            style={{ color: PRIMARY }}
          >
            3°
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2">
            Posición Actual
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Últimos 5 partidos */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Últimos 5 partidos
          </div>
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
    </CardShell>
  );
}

/* -------------------------------- CARD 3 -------------------------------- */

function PlayerOfWeekCard({ className = "" }: { className?: string }) {
  const p = PLAYER_OF_WEEK;
  return (
    <CardShell className={className} interactive>
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: PRIMARY }}
      />
      <div className="p-5 md:p-6 h-full flex items-center gap-4">
        <img
          src={avatarUrl(p.name)}
          alt={p.name}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 shrink-0"
          style={{ borderColor: `${PRIMARY.replace(")", " / 0.5)")}` }}
        />
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold mb-1"
            style={{
              backgroundColor: "hsl(142 76% 45% / 0.12)",
              color: PRIMARY,
            }}
          >
            <Star className="w-2.5 h-2.5" /> AMO DE LA SEMANA
          </div>
          <div className="text-base md:text-lg font-bold text-foreground truncate">
            {p.name}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {p.position} · #{p.number}
          </div>
          <div className="flex gap-3 text-[11px]">
            <MiniStat label="PJ" value={p.matches} />
            <MiniStat label="GOL" value={p.goals} />
            <MiniStat label="AST" value={p.assists} />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-bold text-foreground text-sm">{value}</span>
      <span className="text-muted-foreground text-[9px] tracking-wider">{label}</span>
    </div>
  );
}

/* -------------------------------- CARD 4 -------------------------------- */

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

  return (
    <CardShell className={className}>
      <div className="p-5 md:p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-title">Nuestro Plantel</h3>
          <Shield className="w-4 h-4" style={{ color: PRIMARY }} />
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
                        backgroundColor: "hsl(142 76% 45% / 0.15)",
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
          {players.map((player) => (
            <motion.div
              key={player.name}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative rounded-xl border border-border bg-background/40 p-3 transition-all hover:border-[hsl(142_76%_45%/0.5)] hover:shadow-[0_0_18px_-6px_hsl(142_76%_45%/0.4)]"
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
          ))}
        </div>
      </div>
    </CardShell>
  );
}

/* -------------------------------- CARD 5 -------------------------------- */

function AcademyCard({ className = "" }: { className?: string }) {
  return (
    <CardShell className={className} interactive>
      <div className="p-5 md:p-6 h-full flex flex-col">
        <div className="mb-4">
          <span className="text-label text-muted-foreground">Academias LC United</span>
          <h3 className="text-title mt-1">Formando a los próximos Amos</h3>
        </div>

        <div className="space-y-2.5 flex-1">
          {ACADEMY_CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className="rounded-xl border border-border bg-background/40 p-3 flex items-start gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "hsl(142 76% 45% / 0.12)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: PRIMARY }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">
                    {c.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Inscribe a tu hijo
          </Button>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider"
            style={{
              backgroundColor: "hsl(142 76% 45% / 0.12)",
              color: PRIMARY,
            }}
          >
            CURSOS DE VERANO 2025 <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </CardShell>
  );
}

/* -------------------------------- CARD 6 -------------------------------- */

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
              className="group rounded-xl border border-border bg-background/40 overflow-hidden flex flex-col transition-all hover:border-[hsl(142_76%_45%/0.4)]"
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

function FanTickerCard({ className = "" }: { className?: string }) {
  // Duplicate list so the marquee loops seamlessly
  const items = [...FAN_TICKER, ...FAN_TICKER];
  return (
    <CardShell className={className}>
      <div className="relative py-3 overflow-hidden">
        <div className="flex items-center gap-2 px-5 mb-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: PRIMARY }}
          />
          <span className="text-label text-muted-foreground">La Afición · En vivo</span>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-10 whitespace-nowrap animate-marquee">
            {items.map((msg, i) => (
              <span
                key={i}
                className="text-sm font-medium"
                style={{ color: PRIMARY }}
              >
                {msg}
              </span>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

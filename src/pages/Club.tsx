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
        {/* ADN Cabeño y Posición — 70% / 30% */}
        <HeroCard className="lg:col-span-8 md:col-span-2" />
        <StatsCard className="lg:col-span-4 md:col-span-2 h-full" />

        {/* Nuestro Plantel — ancho completo (con Amo del Partido integrado) */}
        <RosterCard
          className="lg:col-span-12 md:col-span-2"
          activePos={activePos}
          setActivePos={setActivePos}
        />

        {/* Academias — ancho completo */}
        <AcademyCard className="lg:col-span-12 md:col-span-2" />

        {/* Desde el Vestuario y La Afición en vivo — 70% / 30% */}
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

  // Mini-tabla de stats
  const MINI_STATS = [
    { label: "PJ", value: 18 },
    { label: "PG", value: 12 },
    { label: "PP", value: 3 },
  ];

  return (
    <CardShell className={className} interactive>
      <div className="relative h-full p-4 md:p-5 flex flex-col gap-3">
        {/* Label superior */}
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Apertura 2026 · <span className="text-foreground/70">Temporada Actual</span>
        </div>

        {/* Hero stat: posición */}
        <div className="flex flex-col items-center justify-center py-2 md:py-3">
          <div
            className="text-[80px] md:text-[96px] font-extrabold tabular-nums leading-none"
            style={{
              color: PRIMARY,
              textShadow:
                "0 0 24px hsl(142 76% 45% / 0.45), 0 0 60px hsl(142 76% 45% / 0.15)",
            }}
          >
            3°
          </div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-1.5">
            Posición en Liga Premier
          </div>
        </div>

        {/* Mini-tabla horizontal */}
        <div className="flex items-stretch border-y border-white/5 py-2">
          {MINI_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 flex flex-col items-center justify-center ${
                i < MINI_STATS.length - 1 ? "border-r border-white/5" : ""
              }`}
            >
              <span className="text-base md:text-lg font-bold text-foreground tabular-nums leading-none">
                {s.value}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Últimos 5 partidos */}
        <div className="flex flex-col items-center gap-1.5 mt-auto">
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Últimos 5 partidos
          </div>
          <div className="flex items-start gap-2">
            {LAST_5.map((r, i) => {
              const s = resultStyle(r);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-xs font-bold text-background"
                    style={{ backgroundColor: s.bg }}
                    title={r === "W" ? "Ganado" : r === "D" ? "Empate" : "Perdido"}
                  >
                    {s.label}
                  </div>
                  <span
                    className="text-[9px] uppercase tracking-wider font-semibold"
                    style={{ color: s.bg }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
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

/* CARD 3 (Amo de la Semana) — eliminada e integrada dentro de RosterCard */


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

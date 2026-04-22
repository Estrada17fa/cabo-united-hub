import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Ticket,
  Users,
  Target,
  Brain,
  MapPin,
  Crown,
  Trophy,
  Flame,
  Hash,
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

type Game = {
  id: string;
  title: string;
  tagline: string;
  status: string;
  badge: { label: string; tone: "live" | "new" | "soon" | "weekly" };
  icon: typeof Ticket;
  gradient: string;
  glow: string;
  category: "predicciones" | "conocimiento" | "comunidad";
};

const GAMES: Game[] = [
  {
    id: "quiniela",
    title: "Quiniela del Paraíso",
    tagline: "Tres partidos, una corazonada.",
    status: "Cierra dom 18:00",
    badge: { label: "🔥 Activo", tone: "live" },
    icon: Ticket,
    gradient: "linear-gradient(135deg, hsl(189 100% 42%) 0%, hsl(210 90% 28%) 100%)",
    glow: "hsl(189 100% 55%)",
    category: "predicciones",
  },
  {
    id: "once",
    title: "Arma tu 11",
    tagline: "Tú pones la alineación.",
    status: "Alineación abierta",
    badge: { label: "Semanal", tone: "weekly" },
    icon: Users,
    gradient: "linear-gradient(135deg, hsl(336 80% 65%) 0%, hsl(310 70% 32%) 100%)",
    glow: "hsl(336 90% 72%)",
    category: "predicciones",
  },
  {
    id: "marcador",
    title: "Marcador Exacto",
    tagline: "Atrévete con el resultado clavado.",
    status: "+50 pts si aciertas",
    badge: { label: "Semanal", tone: "weekly" },
    icon: Target,
    gradient: "linear-gradient(135deg, hsl(142 76% 45%) 0%, hsl(180 70% 25%) 100%)",
    glow: "hsl(142 90% 55%)",
    category: "predicciones",
  },
  {
    id: "trivia",
    title: "Trivia del Paraíso",
    tagline: "Cinco preguntas, pura gloria.",
    status: "Nueva trivia activa",
    badge: { label: "Nueva", tone: "new" },
    icon: Brain,
    gradient: "linear-gradient(135deg, hsl(265 80% 60%) 0%, hsl(230 70% 30%) 100%)",
    glow: "hsl(265 90% 70%)",
    category: "conocimiento",
  },
  {
    id: "visitas",
    title: "Visitas al Paraíso",
    tagline: "Recorre, fotografía, suma.",
    status: "Sigue explorando",
    badge: { label: "Explora", tone: "weekly" },
    icon: MapPin,
    gradient: "linear-gradient(135deg, hsl(35 95% 55%) 0%, hsl(15 80% 35%) 100%)",
    glow: "hsl(35 100% 60%)",
    category: "comunidad",
  },
  {
    id: "amo",
    title: "Amo del Partido",
    tagline: "Tú decides quién brilló.",
    status: "Se activa al min. 70",
    badge: { label: "Min. 70", tone: "soon" },
    icon: Crown,
    gradient: "linear-gradient(135deg, hsl(320 85% 55%) 0%, hsl(280 75% 30%) 100%)",
    glow: "hsl(320 95% 65%)",
    category: "comunidad",
  },
];

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "predicciones", label: "Predicciones" },
  { id: "conocimiento", label: "Conocimiento" },
  { id: "comunidad", label: "Comunidad" },
] as const;

const USER_STATS = { points: 1240, streak: 4, rank: 18, nextLevel: 1500 };

const handleGameTap = (title: string) => {
  toast(`${title}`, {
    description: "Pronto disponible — estamos afinando las reglas.",
  });
};

const badgeStyle = (tone: Game["badge"]["tone"]): React.CSSProperties => {
  const map: Record<Game["badge"]["tone"], { bg: string; fg: string; border: string }> = {
    live: { bg: "hsl(0 0% 0% / 0.55)", fg: "hsl(142 90% 65%)", border: "hsl(142 90% 55% / 0.5)" },
    new: { bg: "hsl(0 0% 0% / 0.55)", fg: "hsl(189 100% 70%)", border: "hsl(189 100% 55% / 0.5)" },
    soon: { bg: "hsl(0 0% 0% / 0.55)", fg: "hsl(336 90% 78%)", border: "hsl(336 90% 70% / 0.5)" },
    weekly: { bg: "hsl(0 0% 0% / 0.55)", fg: "hsl(0 0% 95%)", border: "hsl(0 0% 100% / 0.2)" },
  };
  const c = map[tone];
  return {
    backgroundColor: c.bg,
    color: c.fg,
    border: `1px solid ${c.border}`,
    backdropFilter: "blur(8px)",
  };
};

const HeroPromo = ({
  title,
  subtitle,
  cta,
  icon: Icon,
  accent,
  onClick,
}: {
  title: string;
  subtitle: string;
  cta: string;
  icon: typeof Ticket;
  accent: "cyan" | "rose";
  onClick: () => void;
}) => {
  const colors =
    accent === "cyan"
      ? { from: "hsl(189 100% 42%)", to: "hsl(210 90% 22%)", glow: "hsl(189 100% 55%)" }
      : { from: "hsl(336 80% 60%)", to: "hsl(310 75% 25%)", glow: "hsl(336 95% 70%)" };

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border border-border p-4 md:p-6 text-left group"
      style={{
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-40 blur-2xl pointer-events-none"
        style={{ background: colors.glow }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mb-1">
            Destacado
          </p>
          <h3 className="text-lg md:text-xl font-extrabold text-white leading-tight mb-1">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-white/80 mb-3 line-clamp-2">{subtitle}</p>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: "hsl(0 0% 0% / 0.45)", color: "white" }}
          >
            {cta}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div
          className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "hsl(0 0% 0% / 0.3)" }}
        >
          <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>
      </div>
    </motion.button>
  );
};

const GamePoster = ({ game, index }: { game: Game; index: number }) => {
  const Icon = game.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => handleGameTap(game.title)}
      className="relative group rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-colors text-left"
      style={{
        aspectRatio: "3 / 4",
        background: game.gradient,
      }}
    >
      {/* Halo radial central */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${game.glow}55 0%, transparent 60%)`,
        }}
      />
      {/* Vignette inferior para legibilidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, hsl(0 0% 0% / 0.55) 80%, hsl(0 0% 0% / 0.85) 100%)",
        }}
      />

      {/* Badge top-left */}
      <div className="absolute top-2 left-2 z-10">
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold"
          style={badgeStyle(game.badge.tone)}
        >
          {game.badge.label}
        </span>
      </div>

      {/* Ícono central con glow */}
      <div className="absolute inset-x-0 top-[28%] flex justify-center">
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: "hsl(0 0% 0% / 0.3)",
            boxShadow: `0 0 32px -4px ${game.glow}`,
            border: `1px solid ${game.glow}55`,
          }}
        >
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Footer info */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 z-10">
        <h3 className="text-sm md:text-base font-extrabold text-white leading-tight mb-0.5">
          {game.title}
        </h3>
        <p className="text-[11px] md:text-xs text-white/75 mb-2 line-clamp-1">{game.tagline}</p>
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{
            backgroundColor: "hsl(0 0% 0% / 0.5)",
            color: "white",
            border: "1px solid hsl(0 0% 100% / 0.15)",
            backdropFilter: "blur(6px)",
          }}
        >
          {game.status}
        </span>
      </div>
    </motion.button>
  );
};

const FanZone = () => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const filtered = GAMES.filter((g) => filter === "all" || g.category === filter);
  const progressPct = Math.min(100, Math.round((USER_STATS.points / USER_STATS.nextLevel) * 100));

  return (
    <div className="py-4 md:py-6 space-y-5 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-headline">Fan Zone</h1>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: "hsl(0 0% 0% / 0.5)",
                color: "hsl(189 100% 70%)",
                border: "1px solid hsl(189 100% 55% / 0.4)",
              }}
            >
              <Sparkles className="w-3 h-3" /> Temporada activa
            </span>
          </div>
          <p className="text-caption">Juega, predice y sube en el ranking del paraíso.</p>
        </div>

        {/* User stats pill */}
        <div
          className="flex items-center gap-1 p-1 rounded-full border border-border self-start"
          style={{ backgroundColor: "hsl(0 0% 0% / 0.5)", backdropFilter: "blur(10px)" }}
        >
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-primary">
            <Trophy className="w-3.5 h-3.5" />
            {USER_STATS.points.toLocaleString()} pts
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-secondary">
            <Flame className="w-3.5 h-3.5" />
            {USER_STATS.streak}
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-foreground">
            <Hash className="w-3 h-3" />
            {USER_STATS.rank}
          </span>
        </div>
      </motion.div>

      {/* Hero promo dual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <HeroPromo
          title="Esta semana se juega doble"
          subtitle="Quiniela activa: tres aciertos, gloria asegurada."
          cta="Jugar ahora"
          icon={Ticket}
          accent="cyan"
          onClick={() => handleGameTap("Quiniela del Paraíso")}
        />
        <HeroPromo
          title="Vota al Amo del Partido"
          subtitle="Se abre al minuto 70 del próximo encuentro."
          cta="Recordarme"
          icon={Crown}
          accent="rose"
          onClick={() => handleGameTap("Amo del Partido")}
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div
          className="flex items-center gap-1 p-1 rounded-full border border-border"
          style={{ backgroundColor: "hsl(0 0% 0% / 0.4)" }}
        >
          {FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <button
          disabled
          className="ml-auto hidden md:flex items-center gap-2 px-3 py-2 rounded-full border border-border text-xs text-muted-foreground opacity-60 cursor-not-allowed"
        >
          <Search className="w-3.5 h-3.5" />
          Buscar (próximamente)
        </button>
      </div>

      {/* Grid de juegos */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-title">Juegos destacados</h2>
          <span className="text-caption">{filtered.length} disponibles</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((game, i) => (
            <GamePoster key={game.id} game={game} index={i} />
          ))}
        </div>
      </section>

      {/* Tu progreso */}
      <section className="bento-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-title">Tu progreso</h2>
            <p className="text-caption">Sigue jugando para subir de nivel.</p>
          </div>
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
          <div className="bento-card-sm text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Puntos</p>
            <p className="text-lg md:text-2xl font-extrabold text-primary">
              {USER_STATS.points.toLocaleString()}
            </p>
          </div>
          <div className="bento-card-sm text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Racha</p>
            <p className="text-lg md:text-2xl font-extrabold text-secondary">
              {USER_STATS.streak} sem
            </p>
          </div>
          <div className="bento-card-sm text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ranking</p>
            <p className="text-lg md:text-2xl font-extrabold text-foreground">#{USER_STATS.rank}</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Siguiente nivel</span>
            <span className="text-foreground font-semibold">
              {USER_STATS.points} / {USER_STATS.nextLevel}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(189 100% 45%), hsl(336 80% 70%))",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FanZone;

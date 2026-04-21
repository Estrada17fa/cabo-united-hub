import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Lock,
  MapPin,
  Camera,
  CheckCircle2,
  Radio,
  Pause,
  Plus,
  Minus,
  ChevronRight,
  Sparkles,
  Ticket,
  ShoppingBag,
  ImageIcon,
  Users,
  Crown,
  Medal,
  Award,
  Brain,
  Target,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { cn } from "@/lib/utils";

/* ----------------------------- Placeholder data ----------------------------- */

const USER_POINTS = 1240;

const QUINIELA_MATCHES = [
  { home: "LC United", away: "Real Cabos", obligatorio: true },
  { home: "Inter Paraíso", away: "Mar de Cortés FC", obligatorio: false },
  { home: "Cabos Sur", away: "Tigres del Cabo", obligatorio: false },
];

const FORMATIONS: Record<string, { x: number; y: number }[]> = {
  "4-3-3": [
    { x: 50, y: 92 }, // GK
    { x: 15, y: 72 }, { x: 38, y: 75 }, { x: 62, y: 75 }, { x: 85, y: 72 }, // DEF
    { x: 28, y: 50 }, { x: 50, y: 52 }, { x: 72, y: 50 }, // MID
    { x: 20, y: 22 }, { x: 50, y: 18 }, { x: 80, y: 22 }, // FWD
  ],
  "4-4-2": [
    { x: 50, y: 92 },
    { x: 15, y: 72 }, { x: 38, y: 75 }, { x: 62, y: 75 }, { x: 85, y: 72 },
    { x: 18, y: 48 }, { x: 40, y: 50 }, { x: 60, y: 50 }, { x: 82, y: 48 },
    { x: 38, y: 20 }, { x: 62, y: 20 },
  ],
  "3-5-2": [
    { x: 50, y: 92 },
    { x: 28, y: 75 }, { x: 50, y: 78 }, { x: 72, y: 75 },
    { x: 12, y: 52 }, { x: 32, y: 50 }, { x: 50, y: 54 }, { x: 68, y: 50 }, { x: 88, y: 52 },
    { x: 38, y: 20 }, { x: 62, y: 20 },
  ],
};

const ROSTER_BY_INDEX = [
  "L. Robles", "C. Vela Jr.", "R. Márquez", "S. Núñez", "E. Pacheco",
  "JP. Ortiz", "L. Bermúdez", "A. Ríos", "N. Vargas", "D. Hernández",
  "B. Cardozo", "A. Solís", "T. Rincón", "M. Téllez", "J. Rivas",
];

const TRIVIA_QUESTIONS = [
  {
    q: "¿En qué año fue fundado Los Cabos United?",
    options: ["2018", "2020", "2022", "2024"],
    correct: 2,
  },
  {
    q: "¿Quién es el máximo goleador histórico del club?",
    options: ["Bruno Cardozo", "Diego Hernández", "Alejandro Ríos", "Adrián Solís"],
    correct: 1,
  },
  {
    q: "¿Cuál es el apodo oficial del equipo?",
    options: ["Los Tiburones", "Los Amos del Paraíso", "Los Delfines", "Los Cabos"],
    correct: 1,
  },
  {
    q: "¿En qué estadio juega de local Los Cabos United?",
    options: ["Estadio Azteca", "Estadio del Paraíso", "Estadio Don Koll", "Estadio BCS"],
    correct: 2,
  },
  {
    q: "¿Qué torneo ganó el club en mayo 2024?",
    options: ["Copa MX", "Liga Premier", "Concachampions", "Copa BCS"],
    correct: 1,
  },
];

const RECENT_VISITS = [
  { user: "@carlos_lcu", place: "Arco de Cabo San Lucas", pts: 30 },
  { user: "@anasur", place: "Playa El Médano", pts: 30 },
  { user: "@mariofan", place: "Marina Cabo San Lucas", pts: 30 },
];

const MOTM_PLAYERS = [
  { name: "Diego Hernández", position: "Delantero", initials: "DH", votes: 124 },
  { name: "Alejandro Ríos", position: "Mediocampista", initials: "AR", votes: 78 },
  { name: "Rafael Márquez", position: "Defensa", initials: "RM", votes: 45 },
];

const LEADERBOARD = [
  { rank: 1, user: "carlos_lcu", initials: "CL", points: 2840 },
  { rank: 2, user: "anasur", initials: "AS", points: 2615 },
  { rank: 3, user: "mariofan", initials: "MF", points: 2410 },
  { rank: 4, user: "fan_paraiso", initials: "FP", points: 2180 },
  { rank: 5, user: "tu_usuario", initials: "TU", points: 1240, isMe: true },
];

const PRIZES = [
  { rank: "1er Lugar", name: "2 Boletos", icon: Ticket, color: "text-yellow-400", border: "border-yellow-400/40", bg: "bg-yellow-400/5" },
  { rank: "2do Lugar", name: "30% Tienda", icon: ShoppingBag, color: "text-zinc-300", border: "border-zinc-300/30", bg: "bg-zinc-300/5" },
  { rank: "3er Lugar", name: "Wallpaper Exclusivo", icon: ImageIcon, color: "text-amber-700", border: "border-amber-700/40", bg: "bg-amber-700/5" },
];

/* ----------------------------- Shared atoms ----------------------------- */

type StatusKind = "open" | "closed" | "submitted" | "live" | "inactive" | "always";

function StatusBadge({ kind, label }: { kind: StatusKind; label: string }) {
  const styles: Record<StatusKind, string> = {
    open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    closed: "bg-red-500/15 text-red-400 border-red-500/30",
    submitted: "bg-muted text-muted-foreground border-border",
    live: "bg-red-500/20 text-red-400 border-red-500/40",
    inactive: "bg-muted text-muted-foreground border-border",
    always: "bg-primary/15 text-primary border-primary/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] md:text-xs font-bold uppercase tracking-wider",
        styles[kind],
        kind === "live" && "animate-pulse",
      )}
    >
      {label}
    </span>
  );
}

function CardShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative bg-card rounded-2xl border border-border p-4 md:p-6 overflow-hidden",
        "hover:border-primary/30 transition-colors duration-300",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function FanZone() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const requireAuth = (cb?: () => void) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    cb?.();
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-4 md:space-y-6">
        {/* HEADER */}
        <FanZoneHeader user={!!user} onLogin={() => setAuthOpen(true)} />

        {/* GAMES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-min">
          <div className="md:col-span-8">
            <QuinielaCard onSubmit={() => requireAuth()} />
          </div>
          <div className="md:col-span-4">
            <MarcadorCard onSubmit={() => requireAuth()} />
          </div>
          <div className="md:col-span-6 md:row-span-2">
            <ArmaTu11Card onSubmit={() => requireAuth()} />
          </div>
          <div className="md:col-span-6 md:row-span-2">
            <TriviaCard onAnswer={() => requireAuth()} />
          </div>
          <div className="md:col-span-4">
            <VisitasCard onSubmit={() => requireAuth()} />
          </div>
          <div className="md:col-span-4">
            <AmoDelPartidoCard onVote={() => requireAuth()} />
          </div>
        </div>

        {/* LEADERBOARD */}
        <LeaderboardSection />
      </div>

      {/* AUTH MODAL */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Inicia sesión para jugar</DialogTitle>
            <DialogDescription>
              Crea tu cuenta gratis y empieza a sumar puntos
            </DialogDescription>
          </DialogHeader>
          <AuthModal onSuccess={() => setAuthOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------------------- Header ----------------------------- */

function FanZoneHeader({ user, onLogin }: { user: boolean; onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-3 bg-card border border-border rounded-2xl p-4 md:p-6"
    >
      <div className="min-w-0">
        <h1 className="text-headline gradient-text">Fan Zone</h1>
        <p className="text-caption mt-1 truncate">
          Juega, compite y gana como un Amo del Paraíso
        </p>
      </div>

      {user ? (
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Tus puntos
            </p>
            <p className="text-lg md:text-xl font-extrabold text-primary leading-tight">
              {USER_POINTS.toLocaleString()}
            </p>
          </div>
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center glow-primary">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background">
              {USER_POINTS}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={onLogin}
          className="flex-shrink-0 inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Inicia sesión para jugar</span>
          <span className="sm:hidden">Entrar</span>
        </button>
      )}
    </motion.div>
  );
}

/* ----------------------------- Quiniela ----------------------------- */

function QuinielaCard({ onSubmit }: { onSubmit: () => void }) {
  const [picks, setPicks] = useState<Record<number, "1" | "X" | "2" | null>>({
    0: null, 1: null, 2: null,
  });

  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3 mb-3">
        <StatusBadge kind="open" label="🟢 Abierta · Cierra Dom 20 Abr 17:00" />
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
      </div>
      <h2 className="text-title md:text-2xl font-extrabold">Quiniela del Paraíso</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Predice los 3 partidos de la jornada
      </p>

      <div className="space-y-2.5">
        {QUINIELA_MATCHES.map((m, idx) => (
          <div
            key={idx}
            className="bg-background/50 border border-border rounded-xl p-3 flex items-center gap-2 md:gap-3"
          >
            {/* Home */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold truncate">{m.home}</p>
                {m.obligatorio && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-yellow-400">
                    <Star className="w-2.5 h-2.5 fill-yellow-400" /> Obligatorio
                  </span>
                )}
              </div>
            </div>

            {/* Picks */}
            <div className="flex gap-1 flex-shrink-0">
              {(["1", "X", "2"] as const).map((k) => {
                const active = picks[idx] === k;
                return (
                  <button
                    key={k}
                    onClick={() => setPicks((p) => ({ ...p, [idx]: k }))}
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-extrabold transition-all border",
                      active
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30"
                        : "bg-card text-muted-foreground border-border hover:border-emerald-500/40 hover:text-foreground",
                    )}
                  >
                    {k}
                  </button>
                );
              })}
            </div>

            {/* Away */}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-xs md:text-sm font-bold truncate">{m.away}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-secondary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] md:text-xs text-muted-foreground text-center mt-4 mb-3">
        Acierto exacto: <span className="text-emerald-400 font-bold">+50 pts</span> · Solo ganador: <span className="text-emerald-400 font-bold">+20 pts</span>
      </p>

      <Button
        onClick={onSubmit}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
      >
        Guardar mi Quiniela
      </Button>
    </CardShell>
  );
}

/* ----------------------------- Marcador Exacto ----------------------------- */

function MarcadorCard({ onSubmit }: { onSubmit: () => void }) {
  const [home, setHome] = useState(2);
  const [away, setAway] = useState(1);

  const NumberPicker = ({ value, set, label }: { value: number; set: (n: number) => void; label: string }) => (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
      <button
        onClick={() => set(Math.min(value + 1, 9))}
        className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-background border-2 border-border flex items-center justify-center text-3xl md:text-4xl font-extrabold text-primary">
        {value}
      </div>
      <button
        onClick={() => set(Math.max(value - 1, 0))}
        className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3 mb-3">
        <StatusBadge kind="open" label="🟢 Abierta" />
        <Target className="w-5 h-5 text-primary flex-shrink-0" />
      </div>
      <h2 className="text-title font-extrabold">Marcador Exacto</h2>
      <p className="text-sm text-muted-foreground mb-4">¿Cuánto va a terminar?</p>

      <div className="flex items-center justify-around py-2">
        <NumberPicker value={home} set={setHome} label="LC United" />
        <span className="text-2xl font-extrabold text-muted-foreground">vs</span>
        <NumberPicker value={away} set={setAway} label="Rival" />
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-4 mb-3 italic">
        Solo <span className="text-primary font-bold">3 usuarios</span> han acertado este año
      </p>

      <Button
        onClick={onSubmit}
        variant="outline"
        className="w-full border-primary/40 text-primary hover:bg-primary/10 font-bold"
      >
        Apostar marcador
      </Button>
    </CardShell>
  );
}

/* ----------------------------- Arma tu 11 ----------------------------- */

function ArmaTu11Card({ onSubmit }: { onSubmit: () => void }) {
  const [formation, setFormation] = useState<keyof typeof FORMATIONS>("4-3-3");
  const [picks, setPicks] = useState<Record<number, string | null>>({});
  const [openSlot, setOpenSlot] = useState<number | null>(null);

  const positions = FORMATIONS[formation];

  return (
    <CardShell className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <StatusBadge kind="open" label="🟢 Abierta · J16" />
        <Users className="w-5 h-5 text-primary flex-shrink-0" />
      </div>
      <h2 className="text-title font-extrabold">Arma tu 11</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Elige tu alineación ideal para el partido
      </p>

      {/* Formation tabs */}
      <div className="flex gap-1.5 bg-background/50 rounded-full p-1 mb-4 self-start">
        {(Object.keys(FORMATIONS) as Array<keyof typeof FORMATIONS>).map((f) => (
          <button
            key={f}
            onClick={() => { setFormation(f); setPicks({}); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
              formation === f
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Pitch */}
      <div className="relative w-full rounded-xl overflow-hidden border border-border bg-gradient-to-b from-emerald-950 to-emerald-900" style={{ aspectRatio: "3/4" }}>
        {/* Pitch lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g stroke="white" strokeOpacity="0.08" strokeWidth="0.4" fill="none">
            <rect x="2" y="2" width="96" height="96" />
            <line x1="2" y1="50" x2="98" y2="50" />
            <circle cx="50" cy="50" r="9" />
            <rect x="25" y="2" width="50" height="14" />
            <rect x="25" y="84" width="50" height="14" />
            <rect x="38" y="2" width="24" height="6" />
            <rect x="38" y="92" width="24" height="6" />
          </g>
        </svg>

        {/* Position dots */}
        {positions.map((pos, idx) => {
          const player = picks[idx];
          const isOpen = openSlot === idx;
          return (
            <div
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <button
                onClick={() => setOpenSlot(isOpen ? null : idx)}
                className={cn(
                  "w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-xs font-extrabold transition-all",
                  player
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/40"
                    : "bg-background/80 border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {player ? player.split(" ").map((s) => s[0]).join("").slice(0, 2) : <Plus className="w-4 h-4" />}
              </button>
              {player && (
                <p className="absolute top-full mt-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded">
                  {player}
                </p>
              )}

              {/* Mini player picker */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 bg-card border border-border rounded-xl shadow-2xl p-1 w-36 max-h-48 overflow-y-auto"
                  >
                    {ROSTER_BY_INDEX.map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          setPicks((p) => ({ ...p, [idx]: name }));
                          setOpenSlot(null);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-4 mb-3">
        Gol: <span className="text-emerald-400 font-bold">+20</span> · Asistencia: <span className="text-emerald-400 font-bold">+15</span> · Portería en cero: <span className="text-emerald-400 font-bold">+25</span>
      </p>

      <Button
        onClick={onSubmit}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold mt-auto"
      >
        Confirmar mi 11
      </Button>
    </CardShell>
  );
}

/* ----------------------------- Trivia ----------------------------- */

function TriviaCard({ onAnswer }: { onAnswer: () => void }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TRIVIA_QUESTIONS.length).fill(null));
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const q = TRIVIA_QUESTIONS[current];
  const done = answers.every((a) => a !== null);
  const score = answers.reduce<number>(
    (acc, a, i) => acc + (a === TRIVIA_QUESTIONS[i].correct ? 1 : 0),
    0,
  );

  const handlePick = (idx: number) => {
    if (!user) {
      onAnswer();
      return;
    }
    if (answers[current] !== null) return;
    const isCorrect = idx === q.correct;
    setFeedback(isCorrect ? "correct" : "wrong");
    setAnswers((arr) => {
      const n = [...arr];
      n[current] = idx;
      return n;
    });
    setTimeout(() => setFeedback(null), 600);
  };

  const next = () => {
    if (current < TRIVIA_QUESTIONS.length - 1) setCurrent(current + 1);
  };

  return (
    <CardShell className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <StatusBadge kind="open" label="🟢 5 Preguntas · Semana 16" />
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          +15 pts
        </span>
      </div>
      <h2 className="text-title font-extrabold">Trivia del Paraíso</h2>
      <p className="text-sm text-muted-foreground mb-4">¿Qué tanto sabes de los Amos?</p>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {answers.map((a, i) => (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full transition-all",
              a === null
                ? "w-2 bg-muted"
                : a === TRIVIA_QUESTIONS[i].correct
                  ? "w-6 bg-emerald-500"
                  : "w-6 bg-red-500",
            )}
          />
        ))}
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <Brain className="w-12 h-12 text-primary mb-3" />
          <p className="text-2xl font-extrabold">{score}/5</p>
          <p className="text-sm text-muted-foreground mt-1">
            Respondiste {score} de 5 · Ganaste{" "}
            <span className="text-emerald-400 font-bold">{score * 15} pts</span>
          </p>
          <Button
            onClick={() => {
              setAnswers(Array(TRIVIA_QUESTIONS.length).fill(null));
              setCurrent(0);
            }}
            variant="outline"
            className="mt-4 border-primary/40 text-primary hover:bg-primary/10"
          >
            Volver a jugar
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <p className="text-base md:text-lg font-bold text-center mb-5 leading-snug">
              {q.q}
            </p>

            <motion.div
              animate={
                feedback === "wrong"
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : feedback === "correct"
                    ? { scale: [1, 1.02, 1] }
                    : {}
              }
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {q.options.map((opt, i) => {
                const answered = answers[current];
                const isSelected = answered === i;
                const isCorrect = i === q.correct;
                return (
                  <button
                    key={i}
                    onClick={() => handlePick(i)}
                    disabled={answered !== null}
                    className={cn(
                      "text-left text-sm font-bold px-4 py-3 rounded-xl border transition-all",
                      answered === null && "bg-background border-border hover:border-primary/40",
                      isSelected && isCorrect && "bg-emerald-500/20 border-emerald-500 text-emerald-300",
                      isSelected && !isCorrect && "bg-red-500/20 border-red-500 text-red-300",
                      answered !== null && !isSelected && isCorrect && "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
                      answered !== null && !isSelected && !isCorrect && "opacity-50",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </motion.div>
          </motion.div>

          <button
            onClick={next}
            disabled={answers[current] === null || current >= TRIVIA_QUESTIONS.length - 1}
            className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-bold text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors self-end"
          >
            Siguiente pregunta <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </CardShell>
  );
}

/* ----------------------------- Visitas ----------------------------- */

function VisitasCard({ onSubmit }: { onSubmit: () => void }) {
  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3 mb-3">
        <StatusBadge kind="always" label="📍 Siempre Activo" />
        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
      </div>
      <h2 className="text-title font-extrabold">Visitas al Paraíso</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Visita Los Cabos y suma puntos
      </p>

      {/* Map thumbnail */}
      <div className="relative w-full h-28 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-border overflow-hidden mb-3">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
          <g stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="0.3" fill="none">
            <path d="M0,30 Q20,20 40,28 T80,25 L100,30" />
            <path d="M0,40 Q25,35 50,38 T100,40" />
            <path d="M10,10 L25,15 L40,8 L60,12 L80,6" />
          </g>
          <circle cx="30" cy="25" r="1.5" fill="hsl(var(--primary))" />
          <circle cx="55" cy="30" r="1.5" fill="hsl(var(--primary))" />
          <circle cx="75" cy="20" r="1.5" fill="hsl(var(--secondary))" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mb-3">
        Visita un lugar del mapa, activa tu GPS y sube tu foto para verificar
      </p>

      <div className="flex items-center justify-between gap-1 mb-4 px-1">
        {[
          { Icon: MapPin, label: "Llega" },
          { Icon: Camera, label: "Foto" },
          { Icon: CheckCircle2, label: "Verificado" },
        ].map(({ Icon, label }, i) => (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
            </div>
            {i < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Recent visits ticker */}
      <div className="space-y-1 mb-4 max-h-24 overflow-hidden">
        {RECENT_VISITS.map((v, i) => (
          <div key={i} className="text-[11px] text-muted-foreground truncate">
            <span className="text-foreground font-bold">{v.user}</span> visitó{" "}
            <span className="text-primary">{v.place}</span> ·{" "}
            <span className="text-emerald-400 font-bold">+{v.pts} pts</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onSubmit}
        variant="outline"
        className="w-full border-primary/40 text-primary hover:bg-primary/10 font-bold"
      >
        Registrar visita
      </Button>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Lugares participantes: <span className="font-bold text-foreground">12</span>
      </p>
    </CardShell>
  );
}

/* ----------------------------- Amo del Partido ----------------------------- */

function AmoDelPartidoCard({ onVote }: { onVote: () => void }) {
  const isLive = false; // placeholder — switch to active when game live past min 70
  const [selected, setSelected] = useState<number | null>(null);
  const totalVotes = useMemo(() => MOTM_PLAYERS.reduce((a, p) => a + p.votes, 0), []);

  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3 mb-3">
        {isLive ? (
          <StatusBadge kind="live" label="🔴 En Vivo · Vota Ahora" />
        ) : (
          <StatusBadge kind="inactive" label="⏸ Se activa al min 70" />
        )}
        {isLive ? (
          <Radio className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
        ) : (
          <Pause className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>
      <h2 className="text-title font-extrabold">Amo del Partido</h2>
      <p className="text-sm text-muted-foreground mb-4">
        ¿Quién fue el mejor en la cancha?
      </p>

      {isLive ? (
        <>
          <div className="space-y-2 mb-4">
            {MOTM_PLAYERS.map((p, i) => {
              const active = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left",
                    active
                      ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "bg-background border-border hover:border-primary/40",
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold border-2",
                    active ? "bg-emerald-500 text-white border-emerald-500" : "bg-card text-primary border-border",
                  )}>
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{p.name}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">{p.position}</p>
                  </div>
                  {active && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-center text-muted-foreground mb-3">
            <span className="text-primary font-bold">{totalVotes}</span> votos
          </p>
          <Button
            onClick={onVote}
            disabled={selected === null}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50"
          >
            Enviar voto
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-around py-4 mb-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-muted/40 border border-border flex items-center justify-center"
              >
                <Users className="w-5 h-5 text-muted-foreground/50" />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-center text-muted-foreground mb-3">
            Activo durante el partido · Próximo: <span className="text-foreground font-bold">Dom 20 Abr</span>
          </p>
          <Button disabled className="w-full bg-muted text-muted-foreground font-bold">
            Votación no disponible
          </Button>
        </>
      )}
    </CardShell>
  );
}

/* ----------------------------- Leaderboard ----------------------------- */

function LeaderboardSection() {
  return (
    <CardShell>
      <div className="flex items-center gap-2 mb-5">
        <Crown className="w-5 h-5 text-yellow-400" />
        <h2 className="text-title font-extrabold">Liga de Amos · Semana 16</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Leaderboard */}
        <div className="md:col-span-7">
          <p className="text-label text-muted-foreground mb-3">Top 5</p>
          <div className="space-y-1.5">
            {LEADERBOARD.map((row) => {
              const isFirst = row.rank === 1;
              return (
                <div
                  key={row.rank}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-xl border transition-colors",
                    row.isMe
                      ? "bg-emerald-500/10 border-emerald-500/40"
                      : isFirst
                        ? "bg-yellow-400/5 border-yellow-400/30"
                        : "bg-background border-border",
                  )}
                >
                  <span
                    className={cn(
                      "w-7 text-center text-sm font-extrabold",
                      isFirst ? "text-yellow-400" : "text-muted-foreground",
                    )}
                  >
                    #{row.rank}
                  </span>
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold border",
                    isFirst
                      ? "bg-yellow-400/20 border-yellow-400/40 text-yellow-400"
                      : row.isMe
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-card border-border text-foreground",
                  )}>
                    {row.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-bold truncate",
                      row.isMe && "text-emerald-300",
                    )}>
                      @{row.user} {row.isMe && <span className="text-[10px] text-emerald-400">(tú)</span>}
                    </p>
                  </div>
                  <span className={cn(
                    "text-sm font-extrabold",
                    isFirst ? "text-yellow-400" : "text-foreground",
                  )}>
                    {row.points.toLocaleString()} <span className="text-[10px] text-muted-foreground">pts</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prizes */}
        <div className="md:col-span-5">
          <p className="text-label text-muted-foreground mb-3">Premios de la semana</p>
          <div className="space-y-2">
            {PRIZES.map((prize, i) => {
              const Icon = prize.icon;
              const RankIcon = i === 0 ? Crown : i === 1 ? Medal : Award;
              return (
                <div
                  key={prize.rank}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    prize.bg,
                    prize.border,
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center bg-background/50 border border-border",
                    prize.color,
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold truncate">{prize.name}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", prize.color)}>
                      <RankIcon className="w-3 h-3" /> {prize.rank}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Gift,
  Sparkles,
  LogIn,
  Ticket,
  ShoppingBag,
  Crown,
  ArrowRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MiniGameCard } from "@/components/fan-zone/MiniGameCard";
import { GAMES } from "@/components/fan-zone/games";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { useAuth } from "@/hooks/useAuth";
import prizeJersey from "@/assets/prize-jersey.jpg";
import prizeTickets from "@/assets/prize-tickets.jpg";
import prizeVestuario from "@/assets/prize-vestuario.jpg";

const TEASER_GAMES = GAMES.filter((g) =>
  ["quiniela", "arma-tu-11", "marcador-exacto", "visitas-paraiso"].includes(g.id),
).map((g) => ({ ...g, status: "soon" as const, reward: "Próximamente" }));

const PRIZE_PREVIEWS = [
  {
    id: "merch",
    title: "Mercancía oficial",
    description: "Jerseys, gorras y artículos exclusivos de Los Cabos United.",
    image: prizeJersey,
    icon: ShoppingBag,
  },
  {
    id: "experiences",
    title: "Boletos y experiencias",
    description: "Entradas, accesos al vestuario y experiencias únicas en el Paraíso.",
    image: prizeVestuario,
    icon: Ticket,
  },
  {
    id: "draws",
    title: "Sorteos exclusivos",
    description: "Participa en rifas y premios solo para miembros de la Fan Zone.",
    image: prizeTickets,
    icon: Crown,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const FanZone = () => {
  const { user } = useAuth();
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-10 md:space-y-14 pb-32 md:pb-8 pt-2"
      >
        {/* HERO */}
        <section className="rounded-2xl border border-border bg-card p-6 md:p-10 overflow-hidden relative">
          <div className="relative z-10 flex flex-col gap-5 md:gap-6 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
                style={{
                  color: "hsl(var(--brand-primary))",
                  borderColor: "hsl(var(--brand-primary) / 0.35)",
                  background: "hsl(var(--brand-primary) / 0.08)",
                }}
              >
                <Sparkles className="w-3 h-3" />
                Próximamente
              </span>
            </div>

            <div className="space-y-3">
              <h1
                className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                La Fan Zone viene en camino
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                Juega minijuegos, gana Cabo Coins, sube de nivel —de Visitante a Local— y canjea premios exclusivos de Los Cabos United.
              </p>
            </div>

            {!user ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                <button
                  onClick={() => setSignupOpen(true)}
                  className="inline-flex items-center justify-center gap-2 font-bold rounded-full h-12 px-6 transition-opacity hover:opacity-90"
                  style={{
                    background: "hsl(var(--brand-primary))",
                    color: "hsl(0 0% 8%)",
                    boxShadow: "0 6px 20px -4px hsl(var(--brand-primary) / 0.55)",
                    fontSize: 14,
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  Crear cuenta gratis
                </button>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-sm font-semibold underline underline-offset-4 text-brand-primary hover:opacity-80 transition-opacity"
                >
                  Ya tengo cuenta
                </button>
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 w-fit"
                style={{
                  borderColor: "hsl(var(--brand-primary) / 0.25)",
                  background: "hsl(var(--brand-primary) / 0.06)",
                }}
              >
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Ya estás dentro — te avisaremos en cuanto abra la Fan Zone.
                </span>
              </div>
            )}
          </div>

          {/* Decorative, minimal */}
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{ background: "hsl(var(--brand-primary))" }}
          />
        </section>

        {/* MINIJUEGOS */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-4">
            <Gamepad2 className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Qué va a haber
            </h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              4 minijuegos
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {TEASER_GAMES.map((game, i) => (
              <MiniGameCard key={game.id} game={game} index={i} onClick={() => {}} />
            ))}
          </div>
        </section>

        {/* PREMIOS PREVIEW */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-4">
            <Gift className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Premios y beneficios
            </h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Canjea Cabo Coins
            </span>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
          >
            {PRIZE_PREVIEWS.map((prize) => {
              const Icon = prize.icon;
              return (
                <motion.div
                  key={prize.id}
                  variants={item}
                  className="group relative rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="relative h-36 md:h-44 overflow-hidden">
                    <img
                      src={prize.image}
                      alt={prize.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, hsl(var(--card)) 0%, hsl(var(--card) / 0.55) 55%, transparent 100%)",
                      }}
                    />
                    <span
                      className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border"
                      style={{
                        color: "hsl(var(--state-coming-soon))",
                        borderColor: "hsl(var(--state-coming-soon) / 0.35)",
                        background: "hsl(var(--state-coming-soon) / 0.08)",
                      }}
                    >
                      Próximamente
                    </span>
                  </div>

                  <div className="p-4 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center border"
                        style={{
                          background: "hsl(var(--brand-primary) / 0.08)",
                          borderColor: "hsl(var(--brand-primary) / 0.25)",
                        }}
                      >
                        <Icon className="w-4 h-4 text-brand-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{prize.title}</h3>
                    </div>
                    <p className="text-[11px] md:text-xs text-muted-foreground leading-snug">
                      {prize.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* CTA FINAL */}
        <section className="rounded-2xl border border-border bg-card p-6 md:p-10 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <h2
              className="text-xl md:text-3xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {user ? "Ya guardaste tu lugar" : "Sé de los primeros en jugar"}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {user
                ? "Te avisaremos apenas la Fan Zone esté lista. Mientras tanto, disfruta de Match Zone y Mi Club."
                : "Crea tu cuenta gratis y recibe acceso anticipado a los minijuegos, sorteos y premios de Los Cabos United."}
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSignupOpen(true)}
                  className="inline-flex items-center justify-center gap-2 font-bold rounded-full h-12 px-8 transition-opacity hover:opacity-90"
                  style={{
                    background: "hsl(var(--brand-primary))",
                    color: "hsl(0 0% 8%)",
                    boxShadow: "0 6px 20px -4px hsl(var(--brand-primary) / 0.55)",
                    fontSize: 14,
                  }}
                >
                  Crear cuenta gratis
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-sm font-semibold underline underline-offset-4 text-brand-primary hover:opacity-80 transition-opacity"
                >
                  Ya tengo cuenta
                </button>
              </div>
            )}
          </div>
        </section>
      </motion.div>

      {/* Mobile sticky CTA */}
      {!user && (
        <div
          className="md:hidden fixed left-0 right-0 z-30 px-4 pb-3"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 70px)",
          }}
        >
          <button
            onClick={() => setSignupOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 font-bold rounded-full h-12 backdrop-blur-xl"
            style={{
              background: "hsl(var(--brand-primary))",
              color: "hsl(0 0% 8%)",
              boxShadow:
                "0 10px 30px -6px hsl(var(--brand-primary) / 0.55), 0 0 0 1px hsl(0 0% 100% / 0.05)",
              fontSize: 14,
            }}
          >
            <LogIn className="w-4 h-4" />
            Crear cuenta gratis
          </button>
        </div>
      )}

      {/* Signup flow */}
      <AuthFlow open={signupOpen} onClose={() => setSignupOpen(false)} />

      {/* Login dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Inicia sesión</DialogTitle>
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
    </>
  );
};

export default FanZone;

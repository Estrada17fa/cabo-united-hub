import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Lock, MapPin, Play, Shield, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { HeroCard, Crest, LiveBadge, LcuButton, BentoTile } from "@/components/ui-lcu";
import { useAuth } from "@/hooks/useAuth";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { getEmbedUrl } from "@/lib/streamUrl";
import type { Tables } from "@/integrations/supabase/types";

interface LiveHeroProps {
  match: Tables<"matches"> | null;
  ourTeam: string;
  logoMap: Record<string, string>;
  onRequestLogin: () => void;
  onRequestSignup: () => void;
}

/**
 * Hero único de Match Zone: cuenta regresiva cuando no hay partido activo y
 * reproductor (con gate de login solo para el video) cuando la fase está en curso.
 */
export function LiveHero({
  match,
  ourTeam,
  logoMap,
  onRequestLogin,
  onRequestSignup,
}: LiveHeroProps) {
  const { isLive, isFinished, clock } = useLiveMatch(match);
  const { user, loading: authLoading } = useAuth();
  const embed = getEmbedUrl(match?.live_stream_url);

  if (!match) {
    return (
      <HeroCard focus={false} contentClassName="p-8 text-center">
        <Shield className="mx-auto mb-3 h-10 w-10 text-label-fg" />
        <h1 className="text-display-lg text-foreground">Sin partidos</h1>
        <p className="mt-2 text-sm text-secondary-fg">
          En cuanto se confirme el calendario, aquí verás la cuenta regresiva.
        </p>
      </HeroCard>
    );
  }

  const kickoff = new Date(`${match.match_date}T${match.match_time || "19:00:00"}`);
  const rival = match.home_team === ourTeam ? match.away_team : match.home_team;
  const isHome = match.home_team === ourTeam;

  return (
    <HeroCard contentClassName="p-4 md:p-6">
      {/* Cabecera del partido */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-label-fg">
          {match.jornada != null ? `Jornada ${match.jornada}` : "Amistoso"}
        </span>
        {isLive ? (
          <LiveBadge clock={clock} />
        ) : isFinished ? (
          <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-secondary-fg">
            Finalizado
          </span>
        ) : (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
            {isHome ? "De local" : "De visita"}
          </span>
        )}
      </div>

      {/* Escudos + marcador / VS */}
      <div className="flex items-center justify-center gap-4">
        <HeroTeam name={match.home_team} logo={logoMap[match.home_team]} ours={isHome} />
        <div className="shrink-0 text-center">
          {isLive || isFinished ? (
            <p className="num-hero text-4xl text-foreground md:text-5xl">
              {match.home_score ?? 0}
              <span className="mx-2 text-label-fg">-</span>
              {match.away_score ?? 0}
            </p>
          ) : (
            <p className="font-display text-lg font-extrabold text-label-fg">VS</p>
          )}
        </div>
        <HeroTeam
          name={match.away_team}
          logo={logoMap[match.away_team]}
          ours={!isHome && match.away_team === ourTeam}
        />
      </div>

      {/* Cuenta regresiva o reproductor */}
      {isLive ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <div className="relative aspect-video w-full">
            {!user && !authLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-6 text-center backdrop-blur-sm">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10">
                  <Lock className="h-5 w-5 text-primary" />
                </span>
                <p className="max-w-xs text-sm font-semibold text-foreground">
                  Inicia sesión o crea tu cuenta para ver el partido en vivo
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <LcuButton size="sm" onClick={onRequestLogin}>
                    Iniciar sesión
                  </LcuButton>
                  <LcuButton size="sm" variant="outline" onClick={onRequestSignup}>
                    Crear cuenta
                  </LcuButton>
                </div>
              </div>
            ) : embed ? (
              <iframe
                key={embed.embedUrl}
                src={embed.embedUrl}
                title={`Transmisión: ${match.home_team} vs ${match.away_team}`}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <Play className="h-8 w-8 text-primary" />
                <p className="text-sm text-secondary-fg">
                  {match.live_stream_url
                    ? "Esta transmisión no se puede incrustar."
                    : "La transmisión aún no está disponible."}
                </p>
                {match.live_stream_url && (
                  <a
                    href={match.live_stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver transmisión
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ) : isFinished ? (
        <div className="mt-5 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-label-fg">
            Último resultado
          </p>
        </div>
      ) : (
        <Countdown target={kickoff} rival={rival} />
      )}

      {/* Datos del partido */}
      <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {match.venue || "Sede por confirmar"}
        </p>
        <p className="flex items-center gap-1.5 text-xs capitalize text-secondary-fg">
          <Calendar className="h-3.5 w-3.5" />
          {format(kickoff, "EEEE d 'de' MMMM · h:mm a", { locale: es })}
        </p>
      </div>

      {!isLive && !isFinished && isHome && (
        <Link
          to="/abonos"
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground"
        >
          <Ticket className="h-4 w-4" />
          Quiero mis boletos
        </Link>
      )}
    </HeroCard>
  );
}

function HeroTeam({ name, logo, ours }: { name: string; logo?: string; ours: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <Crest teamName={name} logoUrl={logo} size={56} highlight={ours} />
      <span
        className={`max-w-full truncate text-xs font-bold md:text-sm ${
          ours ? "text-primary" : "text-foreground"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

function Countdown({ target, rival }: { target: Date; rival: string }) {
  const [left, setLeft] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="mt-5">
      <p className="mb-2.5 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
        Faltan para el partido vs {rival}
      </p>
      <motion.div layout className="grid grid-cols-4 gap-2">
        {[
          { v: left.d, l: "Días" },
          { v: left.h, l: "Hrs" },
          { v: left.m, l: "Min" },
          { v: left.s, l: "Seg" },
        ].map((b, i) => (
          <BentoTile
            key={b.l}
            index={i}
            value={String(b.v).padStart(2, "0")}
            label={b.l}
            emphasis={i === 0}
          />
        ))}
      </motion.div>
    </div>
  );
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

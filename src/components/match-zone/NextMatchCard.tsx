import { useState } from "react";
import { Bell, CalendarDays, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import { buildIcs, downloadIcs, formatKickoff } from "@/lib/matchClock";
import { CountdownTimer, MatchupRow, PrimaryButton } from "@/components/lcu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { useAuth } from "@/hooks/useAuth";
import type { Match } from "./types";

export function NextMatchCard({ match }: { match: Match }) {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const { date, time } = formatKickoff(match.kickoff_at);
  const isHome = !!match.home_team?.is_ours;

  const remind = () => {
    const title = `${match.home_team?.name ?? "Local"} vs ${match.away_team?.name ?? "Visita"}`;
    downloadIcs(
      "los-cabos-united.ics",
      buildIcs({ title, start: match.kickoff_at, venue: match.venue, url: window.location.href })
    );
    toast.success("Recordatorio listo: ábrelo para agregarlo a tu calendario");
  };

  return (
    <article className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Próximo partido{match.matchday ? ` · Jornada ${match.matchday}` : ""}
      </p>

      <div className="mt-4">
        <MatchupRow match={match} />
      </div>

      <div className="mt-4">
        <CountdownTimer kickoffAt={match.kickoff_at} />
      </div>

      {!user && (
        <div className="mt-4 rounded-xl border border-hairline bg-surface-2 p-3.5 text-center">
          <p className="text-xs font-semibold text-foreground">
            La transmisión en vivo es exclusiva para miembros
          </p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Crea tu cuenta gratis y estará lista cuando arranque el partido.
          </p>
          <div className="mt-3 flex flex-col items-center gap-2">
            <PrimaryButton className="w-full" onClick={() => setSignupOpen(true)}>
              Crear cuenta gratis
            </PrimaryButton>
            <button
              onClick={() => setLoginOpen(true)}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              Ya tengo cuenta, iniciar sesión
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-secondary-fg">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          {date} · {time}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {match.venue || "Sede por confirmar"}
        </span>
      </div>

      <div className="mt-3">
        <span className="inline-flex items-center rounded-md border border-primary/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          {isHome ? "Local" : "Visita"}
        </span>
      </div>

      {isHome && match.tickets_url ? (
        <PrimaryButton
          className="mt-4 w-full"
          onClick={() => window.open(match.tickets_url!, "_blank")}
        >
          <Ticket className="h-4 w-4" />
          Comprar boletos
        </PrimaryButton>
      ) : (
        <PrimaryButton className="mt-4 w-full" onClick={remind}>
          <Bell className="h-4 w-4" />
          Recordarme
        </PrimaryButton>
      )}

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle>Acceso de aficionados</DialogTitle>
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

      <AuthFlow open={signupOpen} onClose={() => setSignupOpen(false)} />
    </article>
  );
}

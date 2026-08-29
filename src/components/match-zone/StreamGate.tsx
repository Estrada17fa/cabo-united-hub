import { useState } from "react";
import { Lock, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { getEmbedUrl } from "@/lib/streamUrl";
import { useAuth } from "@/hooks/useAuth";
import { LcuButton } from "@/components/ui-lcu";

interface Props {
  streamUrl: string | null;
  title: string;
}

/**
 * El reproductor es el único bloque que exige cuenta.
 * Sin sesión se ve el marco borroso + acceso con el mismo formulario del sitio.
 */
export function StreamGate({ streamUrl, title }: Props) {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const embed = getEmbedUrl(streamUrl);

  return (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-pop/25 bg-surface-3">
        {embed && user ? (
          <iframe
            src={embed.embedUrl}
            title={title}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.18),transparent_60%),radial-gradient(circle_at_75%_80%,hsl(var(--pop)/0.16),transparent_55%)] blur-[2px]"
              aria-hidden
            />
            <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              {embed ? (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-2">
                    <Lock className="h-5 w-5 text-primary" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    La transmisión es exclusiva para aficionados con cuenta
                  </p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Crea tu cuenta gratis, ve el partido en vivo y gana XP mientras alientas.
                  </p>
                  <div className="mt-1 flex w-full max-w-xs flex-col gap-2">
                    <LcuButton onClick={() => setSignupOpen(true)}>Crear cuenta gratis</LcuButton>
                    <button
                      onClick={() => setLoginOpen(true)}
                      className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Ya tengo cuenta, iniciar sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-2">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    La transmisión se activa al arrancar el partido
                  </p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Mientras tanto sigue el marcador y los momentos aquí mismo.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

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
    </>
  );
}

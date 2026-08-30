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
 * BANDERA TEMPORAL: mientras se arregla el correo de verificación,
 * la transmisión se muestra sin login. Cambiar a false para volver
 * al gate de acceso con cuenta.
 */
const STREAM_OPEN = true;

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
      <div
        className={
          embed && (user || STREAM_OPEN)
            ? "relative aspect-video w-full overflow-hidden rounded-xl border border-hairline bg-surface-3"
            : "relative w-full overflow-hidden rounded-xl border border-hairline bg-surface-3 min-h-[320px] sm:aspect-video"
        }
      >
        {embed && (user || STREAM_OPEN) ? (
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
              className="absolute inset-0 bg-surface-3 blur-[2px]"
              aria-hidden
            />
            <div className="relative flex min-h-[320px] h-full flex-col items-center justify-center gap-2.5 px-5 py-6 text-center sm:min-h-0">
              {embed ? (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-surface-1 sm:h-11 sm:w-11">
                    <Lock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </span>
                  <p className="text-[13px] font-semibold leading-snug text-foreground sm:text-sm">
                    Inicia sesión o crea tu cuenta para ver el partido en vivo
                  </p>
                  <p className="max-w-xs text-[11px] leading-snug text-muted-foreground sm:text-xs">
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
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-surface-1">
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

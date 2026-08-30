import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { EmailOtpType } from "@supabase/supabase-js";

type State = "verifying" | "success" | "error";

const ConfirmarCorreo = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ran = useRef(false);
  const [state, setState] = useState<State>("verifying");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      const errorDescription =
        params.get("error_description") ||
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description");
      if (errorDescription) {
        setState("error");
        setMessage(errorDescription);
        return;
      }

      const code = params.get("code");
      const tokenHash = params.get("token_hash") || params.get("token");
      const type = (params.get("type") || "signup") as EmailOtpType;

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
        } else {
          // Tokens en el hash (#access_token=...) los procesa el cliente automáticamente.
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            setState("error");
            setMessage("El enlace de verificación no es válido o ya se usó.");
            return;
          }
        }

        const { data } = await supabase.auth.getUser();
        if (data.user?.email) setEmail(data.user.email);
        setState("success");
      } catch (e: any) {
        setState("error");
        setMessage(e?.message || "El enlace de verificación expiró o ya se usó.");
      }
    };

    run();
  }, [params]);

  const resend = async () => {
    if (!email) {
      toast.error("Escribe tu correo para reenviar la verificación.");
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/confirmar-correo` },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("Te enviamos un nuevo enlace de verificación.");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 md:p-8 text-center space-y-5">
        {state === "verifying" && (
          <>
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-primary" />
            <h1
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Verificando tu cuenta…
            </h1>
            <p className="text-sm text-muted-foreground">Esto toma solo un momento.</p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto text-brand-primary" />
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ¡Cuenta verificada!
            </h1>
            <p className="text-sm text-muted-foreground">
              Ya eres parte de Los Cabos United. Tu pase digital está listo.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Button onClick={() => navigate("/mi-pase")} className="h-11 rounded-full font-bold">
                Ver mi pase
              </Button>
              <Link
                to="/mi-perfil"
                className="text-sm font-semibold underline underline-offset-4 text-brand-primary"
              >
                Ir a mi perfil
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <MailWarning className="w-10 h-10 mx-auto text-muted-foreground" />
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Enlace no válido
            </h1>
            <p className="text-sm text-muted-foreground">
              {message} Escribe tu correo y te enviamos uno nuevo.
            </p>
            <div className="space-y-2 pt-1 text-left">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
              <Button
                onClick={resend}
                disabled={resending}
                className="w-full h-11 rounded-full font-bold"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reenviar verificación
                  </>
                )}
              </Button>
            </div>
            <Link
              to="/"
              className="inline-block text-sm font-semibold underline underline-offset-4 text-brand-primary"
            >
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmarCorreo;

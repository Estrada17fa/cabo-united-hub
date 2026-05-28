import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ConsentimientoTutor() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"loading" | "ok" | "already" | "expired" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    (async () => {
      const { data, error } = await supabase.functions.invoke("parental-consent-confirm", {
        body: { token },
      });
      if (error || !data) return setState("error");
      if (data.error === "expired") return setState("expired");
      if (data.error) return setState("error");
      if (data.alreadyConfirmed) return setState("already");
      setState("ok");
    })();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full text-center space-y-3">
        {state === "loading" && (
          <>
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-primary" />
            <p className="text-sm text-muted-foreground">Validando autorización…</p>
          </>
        )}
        {(state === "ok" || state === "already") && (
          <>
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400" />
            <h1 className="text-lg font-bold text-foreground">
              {state === "already" ? "Autorización ya registrada" : "¡Autorización confirmada!"}
            </h1>
            <p className="text-sm text-muted-foreground">
              El menor a tu cargo ya puede usar Fan Zone Los Cabos United bajo tu supervisión.
              Puedes cerrar esta ventana.
            </p>
          </>
        )}
        {state === "expired" && (
          <>
            <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />
            <h1 className="text-lg font-bold text-foreground">Enlace caducado</h1>
            <p className="text-sm text-muted-foreground">
              El enlace expiró. Pide al menor que solicite uno nuevo desde la app.
            </p>
          </>
        )}
        {state === "error" && (
          <>
            <AlertTriangle className="w-10 h-10 mx-auto text-destructive" />
            <h1 className="text-lg font-bold text-foreground">Enlace inválido</h1>
            <p className="text-sm text-muted-foreground">No pudimos validar la autorización. Verifica el enlace.</p>
            <Link to="/" className="text-xs text-brand-primary underline">Ir al inicio</Link>
          </>
        )}
      </div>
    </div>
  );
}
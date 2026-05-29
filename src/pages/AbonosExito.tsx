import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

const MAX_ATTEMPTS = 15;

export default function AbonosExito() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<"polling" | "ready" | "timeout">("polling");
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Compra confirmada | Los Cabos United";
    if (!user) return;
    let attempts = 0;
    let cancelled = false;

    const env = getStripeEnvironment();

    const poll = async () => {
      attempts += 1;
      const { data } = await supabase
        .from("subscriptions")
        .select("status, price_id, environment")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data && (data.status === "active" || data.status === "trialing")) {
        const { data: prod } = await supabase
          .from("stripe_products")
          .select("tier")
          .eq("stripe_price_id", data.price_id)
          .maybeSingle();
        setTier((prod as any)?.tier ?? null);
        await refreshProfile();
        setStatus("ready");
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        setStatus("timeout");
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        {status === "polling" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Activando tu abono…</h1>
            <p className="text-muted-foreground text-sm">
              Estamos confirmando tu pago con Stripe. No cierres esta ventana.
            </p>
            {sessionId && <p className="text-[10px] text-muted-foreground/60">ref: {sessionId.slice(-12)}</p>}
          </motion.div>
        )}
        {status === "ready" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">¡Bienvenido al programa {tier}!</h1>
            <p className="text-muted-foreground">
              Tu abono está activo. Ya tienes acceso a todos los beneficios de Fan Zone.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button asChild>
                <Link to="/mi-perfil">Ver mi perfil</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/fan-zone">Ir a Fan Zone</Link>
              </Button>
            </div>
          </motion.div>
        )}
        {status === "timeout" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Pago recibido</h1>
            <p className="text-muted-foreground text-sm">
              Tu pago fue procesado, pero la activación está tardando más de lo normal. Revisa tu perfil en unos minutos o contáctanos si no aparece.
            </p>
            <Button asChild>
              <Link to="/mi-perfil">Ir a mi perfil</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
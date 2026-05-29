import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { AuthModal } from "@/components/auth/AuthModal";

type Tier = "FAN" | "GOLD" | "PREMIUM" | "PLATINO";

const TIERS: {
  key: Tier;
  name: string;
  priceId: string | null;
  priceLabel: string;
  accent: string;
  perks: string[];
  highlight?: boolean;
}[] = [
  {
    key: "FAN",
    name: "FAN",
    priceId: null,
    priceLabel: "Gratis",
    accent: "from-zinc-700 to-zinc-900",
    perks: ["Acceso a Fan Zone", "Pase digital básico", "Acumulación de XP/CC"],
  },
  {
    key: "GOLD",
    name: "GOLD",
    priceId: "abono_gold_anual",
    priceLabel: "$1,499 MXN / año",
    accent: "from-amber-500 to-amber-700",
    perks: ["Todo lo de FAN", "Multiplicador 1× XP/CC", "Descuentos en tienda", "Acceso anticipado a partidos"],
  },
  {
    key: "PREMIUM",
    name: "PREMIUM",
    priceId: "abono_premium_anual",
    priceLabel: "$2,499 MXN / año",
    accent: "from-primary to-cyan-700",
    highlight: true,
    perks: ["Todo lo de GOLD", "Multiplicador 1.5× XP/CC", "Mejor zona en estadio", "Eventos exclusivos"],
  },
  {
    key: "PLATINO",
    name: "PLATINO",
    priceId: "abono_platino_anual",
    priceLabel: "$4,999 MXN / año",
    accent: "from-fuchsia-500 to-pink-700",
    perks: ["Todo lo de PREMIUM", "Multiplicador 1.5× XP/CC", "Meet & greet con jugadores", "Merchandising premium anual"],
  },
];

export default function Abonos() {
  const { user, profile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<Tier | null>(null);

  const currentTier = (profile as any)?.subscription_tier ?? "FAN";
  const activeTier = TIERS.find((t) => t.key === checkoutTier);

  const handleSelect = (tier: typeof TIERS[number]) => {
    if (!tier.priceId) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setCheckoutTier(tier.key);
  };

  return (
    <>
      <Helmet>
        <title>Abonos Fan Zone | Los Cabos United</title>
        <meta
          name="description"
          content="Adquiere tu abono anual GOLD, PREMIUM o PLATINO y vive Los Cabos United con beneficios exclusivos."
        />
        <link rel="canonical" href={`${window.location.origin}/abonos`} />
      </Helmet>

      <PaymentTestModeBanner />

      <div className="max-w-6xl mx-auto py-8 md:py-12 space-y-10">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Fan Zone · Abonos anuales
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Elige tu nivel de afición
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Más beneficios, más XP, más cerca del equipo. Cambia de plan cuando quieras.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier, idx) => {
            const isCurrent = currentTier === tier.key;
            return (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative rounded-3xl bg-card border ${tier.highlight ? "border-primary shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]" : "border-border"} overflow-hidden flex flex-col`}
              >
                {tier.highlight && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    Más popular
                  </div>
                )}
                <div className={`h-2 bg-gradient-to-r ${tier.accent}`} />
                <div className="p-6 flex flex-col gap-5 flex-1">
                  <div>
                    <h2 className="text-2xl font-bold">{tier.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{tier.priceLabel}</p>
                  </div>
                  <ul className="space-y-2 text-sm flex-1">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.key === "FAN" ? (
                    <div className="text-center text-xs font-semibold text-muted-foreground py-3 border border-dashed rounded-xl">
                      {isCurrent ? "Plan actual" : "Gratis"}
                    </div>
                  ) : isCurrent ? (
                    <Button disabled variant="secondary" className="w-full rounded-full">
                      Plan actual
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSelect(tier)}
                      className="w-full rounded-full"
                      variant={tier.highlight ? "default" : "outline"}
                    >
                      Adquirir {tier.name}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Pagos procesados por Stripe. Puedes cancelar tu renovación automática cuando quieras desde tu perfil.
        </p>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      <Dialog open={!!checkoutTier} onOpenChange={(o) => !o && setCheckoutTier(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Adquirir abono {activeTier?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-2 md:p-4">
            {activeTier?.priceId && user ? (
              <StripeEmbeddedCheckout
                priceId={activeTier.priceId}
                userId={user.id}
                customerEmail={user.email ?? undefined}
                returnUrl={`${window.location.origin}/abonos/exito?session_id={CHECKOUT_SESSION_ID}`}
              />
            ) : (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
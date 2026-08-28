import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { motion } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { FanPassCard } from "@/components/pass/FanPassCard";
import { supabase } from "@/integrations/supabase/client";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { LevelProgress } from "@/components/profile/LevelProgress";
import { TransactionsList } from "@/components/profile/TransactionsList";
import { VerificationBadges } from "@/components/profile/VerificationBadges";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useFanProfile } from "@/hooks/useFanProfile";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

interface FanPass {
  id: string;
  pass_code: string;
  full_name: string;
  tier: "fan" | "gold" | "premium" | "platino";
  status: string;
  payment_status: string;
  issued_at: string;
  birth_date: string;
  favorite_player_id: string | null;
}

export default function MiPerfil() {
  const { user, profile, signOut, loading } = useAuth();
  const { transactions, hasDoubleActive } = useFanProfile();
  const { t } = useTranslation();
  const [authOpen, setAuthOpen] = useState(false);
  const [pass, setPass] = useState<FanPass | null>(null);
  const [favPlayer, setFavPlayer] = useState<string | null>(null);
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    if (!user) {
      setPass(null);
      return;
    }
    setLoadingPass(true);
    supabase
      .from("fan_passes")
      .select("id, pass_code, full_name, tier, status, payment_status, issued_at, birth_date, favorite_player_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        setPass(data as FanPass | null);
        if (data?.favorite_player_id) {
          const { data: p } = await supabase
            .from("players")
            .select("name")
            .eq("id", data.favorite_player_id)
            .maybeSingle();
          setFavPlayer(p?.name ?? null);
        }
        setLoadingPass(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex items-center justify-center p-4"
      >
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{t("profile.title")}</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión para ver tu pase digital.</p>
          <Button onClick={() => setAuthOpen(true)} className="w-full">
            Iniciar sesión / Crear cuenta
          </Button>
        </div>
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle>Acceso de aficionados</DialogTitle>
            </DialogHeader>
            <AuthModal onSuccess={() => setAuthOpen(false)} />
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-2 py-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("profile.title")}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-1" /> {t("common.logout")}
        </Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <AvatarUploader />
          <div className="flex gap-3">
            <Stat label={t("profile.xpTotal")} value={(profile?.xp ?? 0).toLocaleString()} accent="primary" />
            <Stat label={t("profile.ccBalance")} value={(profile?.cc ?? 0).toLocaleString()} accent="accent" />
          </div>
        </div>
        <LevelProgress xp={profile?.xp ?? 0} />
        {hasDoubleActive && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold"
            style={{
              background: "hsl(var(--brand-accent) / 0.12)",
              border: "1px solid hsl(var(--brand-accent) / 0.4)",
              color: "hsl(var(--brand-accent))",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("profile.doubleActive")} — {t("profile.doubleActiveHint")}
          </div>
        )}
        <VerificationBadges
          emailVerified={profile?.email_verified ?? !!user.email_confirmed_at}
          phoneVerified={profile?.phone_verified ?? false}
          identityVerified={profile?.identity_verified ?? false}
        />
      </section>

      {loadingPass ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : pass ? (
        <>
          <FanPassCard pass={pass} favoritePlayerName={favPlayer} avatarUrl={profile?.avatar_url} />
          <Button asChild variant="outline" className="w-full">
            <Link to="/mi-pase">Ver mi pase completo</Link>
          </Button>
          {pass.status !== "active" && (
            <div className="rounded-xl bg-card border border-amber-500/30 p-4 text-sm text-foreground/85">
              Tu pase está en estado <span className="font-bold">{pass.status}</span>. Completa tu pago para activarlo y
              poder generar el QR de acceso al estadio.
            </div>
          )}
        </>

      ) : (
        <div className="rounded-xl bg-card border border-border p-6 text-center text-sm text-muted-foreground">
          Aún no tienes un pase digital. Ve a <span className="text-foreground font-bold">Accesos</span> para elegir tu nivel.
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground mb-2">
          {t("profile.transactions")}
        </h2>
        <TransactionsList items={transactions} />
      </section>

      <OnboardingFlow />
    </motion.div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "primary" | "accent" }) {
  return (
    <div className="text-right">
      <div
        className="text-2xl font-extrabold tabular-nums tracking-tight"
        style={{ color: accent === "primary" ? "hsl(var(--brand-primary))" : "hsl(var(--brand-accent))" }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
    </div>
  );
}

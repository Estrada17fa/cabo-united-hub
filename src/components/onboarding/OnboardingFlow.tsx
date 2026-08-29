import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Coins, Crown, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const STEPS = [
  { icon: Sparkles, key: "step1" },
  { icon: Zap, key: "step2" },
  { icon: Coins, key: "step3" },
  { icon: Crown, key: "step4" },
  { icon: Target, key: "step5" },
] as const;

export function OnboardingFlow() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_onboarding")
      .select("completed_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.completed_at) setOpen(true);
      });
  }, [user]);

  const finish = async () => {
    if (!user) return;
    await supabase
      .from("user_onboarding")
      .upsert({ user_id: user.id, completed_at: new Date().toISOString() });
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const Icon = STEPS[step].icon;
  const k = STEPS[step].key;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent className="bg-card border-border max-w-sm p-0 overflow-hidden">
        <DialogTitle className="sr-only">Onboarding</DialogTitle>
        <div className="flex gap-1 p-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{ background: i <= step ? "hsl(var(--brand-primary))" : "hsl(0 0% 100% / 0.1)" }}
            />
          ))}
        </div>
        <div className="px-6 pb-6 pt-2 min-h-[260px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 text-center space-y-4"
            >
              <div
                className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "hsl(var(--brand-primary) / 0.12)" }}
              >
                <Icon className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t(`onboarding.${k}Title`)}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`onboarding.${k}Body`)}
              </p>
              {step === 0 && (
                <p className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">
                  {t("onboarding.welcomeBonus")}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={finish}>
              {t("onboarding.skip")}
            </Button>
            <Button onClick={next} className="px-6">
              {step === STEPS.length - 1 ? t("onboarding.start") : t("onboarding.next")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
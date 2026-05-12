import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Mail, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
}

export function VerificationBadges({ emailVerified, phoneVerified, identityVerified }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [resending, setResending] = useState(false);

  const resendEmail = async () => {
    if (!user?.email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success(t("auth.verifyEmail"));
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {t("profile.verifications")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Badge icon={Mail} label="Email" ok={emailVerified} t={t} />
        <Badge icon={Phone} label="Tel." ok={phoneVerified} t={t} />
        <Badge icon={Shield} label="ID" ok={identityVerified} t={t} />
      </div>
      {!emailVerified && (
        <Button size="sm" variant="ghost" onClick={resendEmail} disabled={resending} className="h-7 text-xs">
          {t("auth.resendVerification")}
        </Button>
      )}
    </div>
  );
}

function Badge({
  icon: Icon,
  label,
  ok,
  t,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ok: boolean;
  t: (k: string) => string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center"
      style={{
        borderColor: ok ? "hsl(var(--brand-primary) / 0.4)" : "hsl(var(--border))",
        background: ok ? "hsl(var(--brand-primary) / 0.06)" : "transparent",
      }}
    >
      <div className="flex items-center gap-1">
        <Icon className="w-3.5 h-3.5 text-foreground/80" />
        {ok && <Check className="w-3 h-3 text-brand-primary" />}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">{label}</span>
      <span className="text-[9px] text-muted-foreground">
        {ok ? t("profile.verified") : t("profile.pending")}
      </span>
    </div>
  );
}
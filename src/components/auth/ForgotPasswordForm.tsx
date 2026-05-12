import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { resetPassword } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("auth.resetSent"));
    onBack();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-foreground">{t("auth.resetTitle")}</h3>
        <p className="text-xs text-muted-foreground">{t("auth.resetSubtitle")}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reset-email" className="text-xs text-muted-foreground">
          {t("common.email")}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="pl-9 bg-card border-border"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onBack} className="flex-1">
          {t("common.back")}
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? t("common.loading") : t("auth.sendCode")}
        </Button>
      </div>
    </form>
  );
}
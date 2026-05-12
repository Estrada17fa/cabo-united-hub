import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery hash and creates a session
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Mínimo 8 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("auth.passwordUpdated"));
    navigate("/mi-perfil");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t("auth.resetTitle")}</h1>
          <p className="text-xs text-muted-foreground">
            {ready ? t("auth.newPassword") : t("common.loading")}
          </p>
        </div>
        {ready && (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("auth.newPassword")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="bg-card border-border"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("common.loading") : t("auth.updatePassword")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
import { useMemo, useState } from "react";
import { Check, ChevronDown, KeyRound, Loader2, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Misma regla de contraseña que el registro (AuthFlow). */
export function passwordChecks(p: string) {
  return [
    { label: "8+ caracteres", ok: p.length >= 8 },
    { label: "Una mayúscula", ok: /[A-Z]/.test(p) },
    { label: "Una minúscula", ok: /[a-z]/.test(p) },
    { label: "Un número", ok: /[0-9]/.test(p) },
    { label: "Un símbolo", ok: /[^A-Za-z0-9]/.test(p) },
  ];
}

export function PasswordChangeCard() {
  const { user, resetPassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const checks = useMemo(() => passwordChecks(password), [password]);
  const valid = checks.every((c) => c.ok);
  const matches = password.length > 0 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !matches) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    setOpen(false);
    toast.success("Contraseña actualizada");
  };

  const sendLink = async () => {
    if (!user?.email) return;
    setSending(true);
    const { error } = await resetPassword(user.email);
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Te enviamos un enlace a tu correo");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-5"
      >
        <span className="flex items-center gap-2.5">
          <KeyRound className="h-4 w-4 text-primary" />
          <span>
            <span className="block text-[13px] font-bold text-foreground">Cambiar contraseña</span>
            <span className="block text-[11px] text-muted-foreground">
              Mínimo 8 caracteres, con mayúscula, número y símbolo
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <form onSubmit={submit} className="space-y-4 border-t border-hairline px-4 py-4 md:px-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Nueva contraseña
                  </Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-hairline bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Confirmar contraseña
                  </Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="border-hairline bg-background"
                  />
                </div>
              </div>

              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {checks.map((c) => (
                  <li
                    key={c.label}
                    className={`flex items-center gap-1.5 text-[11px] font-medium ${
                      c.ok ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {c.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-50" />}
                    {c.label}
                  </li>
                ))}
              </ul>

              {confirm.length > 0 && !matches && (
                <p className="text-[11px] font-medium text-destructive">Las contraseñas no coinciden.</p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="submit" disabled={!valid || !matches || saving} className="sm:flex-1">
                  {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Guardar contraseña
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={sendLink}
                  disabled={sending}
                  className="text-[12px] text-muted-foreground"
                >
                  {sending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Recibir enlace por correo
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

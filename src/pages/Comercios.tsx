import { useState } from "react";
import { Loader2, Store, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const TIER_LABEL: Record<string, string> = {
  fan: "FAN", gold: "GOLD", premium: "PREMIUM", platino: "PLATINO",
};

interface Member {
  pass_code: string;
  full_name: string;
  tier: string;
  avatar_url: string | null;
  discount: number | null;
}

export default function Comercios() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [business, setBusiness] = useState<string | null>(null);
  const [alreadyToday, setAlreadyToday] = useState(false);
  const [done, setDone] = useState(false);

  const call = async (action: "validate" | "redeem") => {
    if (!token.trim()) return;
    setBusy(true);
    setError(null);
    const { data, error: fnErr } = await supabase.functions.invoke("redeem-member-qr", {
      body: { token: token.trim(), action },
    });
    setBusy(false);
    if (fnErr || !data) {
      setError((data as any)?.error ?? "No pudimos validar el código.");
      return;
    }
    if ((data as any).error) {
      setError((data as any).error);
      setMember(null);
      return;
    }
    setMember((data as any).member as Member);
    setBusiness((data as any).business ?? null);
    setAlreadyToday(!!(data as any).already_redeemed_today);
    setDone(!!(data as any).redeemed);
  };

  const reset = () => {
    setToken("");
    setMember(null);
    setError(null);
    setDone(false);
    setAlreadyToday(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <Store className="w-8 h-8 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">Portal de comercios</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión con la cuenta de tu negocio.</p>
          <Button onClick={() => setAuthOpen(true)} className="w-full">Iniciar sesión</Button>
        </div>
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle>Acceso de comercios</DialogTitle>
            </DialogHeader>
            <AuthModal onSuccess={() => setAuthOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-5">
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-foreground">Validar pase</h1>
        <p className="text-sm text-muted-foreground">{business ?? "Escanea o escribe el código del aficionado"}</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Pega o escanea el código"
          className="text-center font-mono"
          autoFocus
        />
        <div className="flex gap-2">
          <Button onClick={() => call("validate")} disabled={busy || !token.trim()} className="flex-1">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validar"}
          </Button>
          <Button variant="ghost" onClick={reset} disabled={busy}>Limpiar</Button>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      {member && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-center">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {member.full_name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("")}
              </span>
            )}
          </div>
          <div>
            <div className="text-lg font-extrabold text-foreground">{member.full_name}</div>
            <div className="text-xs font-mono text-muted-foreground">{member.pass_code}</div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-primary text-primary-foreground">
              {TIER_LABEL[member.tier] ?? member.tier}
            </span>
            {member.discount != null && (
              <span className="text-sm font-bold text-foreground">{member.discount}% de descuento</span>
            )}
          </div>

          {alreadyToday ? (
            <div className="text-sm text-amber-500 font-semibold">Ya canjeó su beneficio hoy en este negocio.</div>
          ) : done ? (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-500">
              <CheckCircle2 className="w-4 h-4" /> Canje confirmado
            </div>
          ) : (
            <Button onClick={() => call("redeem")} disabled={busy} className="w-full">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar canje"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

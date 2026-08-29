import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ExternalLink,
  Loader2,
  LogOut,
  Pencil,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { MiniPassChip } from "@/components/pass/MiniPassChip";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { PasswordChangeCard } from "@/components/profile/PasswordChangeCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { tierStyle } from "@/lib/tiers";

const BOLETOMOVIL_URL = "https://www.boletomovil.com";

interface PassSummary {
  pass_code: string;
  tier: "fan" | "gold" | "premium" | "platino";
  status: string;
}

export default function MiPerfil() {
  const { user, profile, signOut, loading, refreshProfile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [pass, setPass] = useState<PassSummary | null>(null);
  const [loadingPass, setLoadingPass] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    setName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  useEffect(() => {
    if (!user) {
      setPass(null);
      setLoadingPass(false);
      return;
    }
    let alive = true;
    setLoadingPass(true);
    supabase
      .from("fan_passes")
      .select("pass_code, tier, status")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setPass((data as PassSummary | null) ?? null);
        setLoadingPass(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const saveName = async () => {
    const clean = name.trim();
    if (!user) return;
    if (clean.length < 2 || clean.length > 60) {
      toast.error("El nombre debe tener entre 2 y 60 caracteres");
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: clean })
      .eq("id", user.id);
    setSavingName(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    setEditingName(false);
    toast.success("Nombre actualizado");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] items-center justify-center p-4"
      >
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-hairline bg-surface-1 p-6 text-center">
          <h1 className="font-display text-xl font-bold text-foreground">Mi perfil</h1>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Inicia sesión para ver tu pase digital y administrar tu cuenta.
          </p>
          <Button onClick={() => setAuthOpen(true)} className="w-full">
            Iniciar sesión / Crear cuenta
          </Button>
        </div>
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent className="max-w-sm border-hairline bg-surface-1">
            <DialogHeader>
              <DialogTitle>Acceso de aficionados</DialogTitle>
            </DialogHeader>
            <AuthModal onSuccess={() => setAuthOpen(false)} />
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  const ts = pass ? tierStyle(pass.tier) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-4 px-3 py-6 md:px-4"
    >
      {/* Encabezado */}
      <header className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Mi cuenta
          </p>
          <h1 className="mt-0.5 truncate font-display text-2xl font-bold text-foreground">
            {profile?.display_name ?? "Aficionado"}
          </h1>
          <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>
        </div>
      </header>

      {/* Mini pase */}
      <section className="rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5">
        {loadingPass ? (
          <div className="flex h-16 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : pass && ts ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Pase digital
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="rounded-[9px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    background: ts.bg,
                    border: `1px solid ${ts.accent}40`,
                    color: ts.accent,
                  }}
                >
                  {ts.label}
                </span>
                <span className="font-display text-[15px] font-bold tabular-nums text-foreground">
                  {pass.pass_code}
                </span>
              </div>
              {pass.status !== "active" && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Estado: <span className="font-semibold text-foreground">{pass.status}</span>
                </p>
              )}
            </div>
            <MiniPassChip />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Pase digital
              </p>
              <p className="mt-1 text-[13px] font-semibold text-foreground">
                Aún no tienes pase
              </p>
              <p className="text-[11px] text-muted-foreground">
                Elige tu nivel y actívalo en segundos.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/accesos">
                Obtener mi pase <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Datos de cuenta */}
      <section className="space-y-4 rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Datos de cuenta
        </h2>

        <AvatarUploader size={72} />

        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Nombre
          </Label>
          {editingName ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="border-hairline bg-background"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveName} disabled={savingName}>
                  {savingName && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setName(profile?.display_name ?? "");
                    setEditingName(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-background px-3 py-2.5">
              <span className="truncate text-[13px] text-foreground">
                {profile?.display_name ?? "Sin nombre"}
              </span>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold text-primary"
              >
                <Pencil className="h-3 w-3" /> Editar
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Correo
          </Label>
          <div className="rounded-xl border border-hairline bg-background px-3 py-2.5 text-[13px] text-muted-foreground">
            {user.email}
          </div>
        </div>
      </section>

      {/* Contraseña */}
      <PasswordChangeCard />

      {/* Accesos rápidos */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/tienda"
          className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-1 px-4 py-4 transition-colors hover:border-primary/40"
        >
          <span className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="text-[13px] font-bold text-foreground">Tienda Oficial</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <a
          href={BOLETOMOVIL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-1 px-4 py-4 transition-colors hover:border-primary/40"
        >
          <span className="flex items-center gap-2.5">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="text-[13px] font-bold text-foreground">Boletos</span>
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      </section>

      {/* Cerrar sesión */}
      <Button
        variant="outline"
        onClick={signOut}
        className="w-full border-hairline text-muted-foreground"
      >
        <LogOut className="mr-1.5 h-4 w-4" /> Cerrar sesión
      </Button>
    </motion.div>
  );
}

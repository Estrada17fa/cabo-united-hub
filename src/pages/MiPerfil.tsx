import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { FanPassCard } from "@/components/pass/FanPassCard";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, signOut, loading } = useAuth();
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
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Mi pase digital</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-1" /> Salir
        </Button>
      </div>

      {loadingPass ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : pass ? (
        <>
          <FanPassCard pass={pass} favoritePlayerName={favPlayer} />
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
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { FanPassCard } from "@/components/pass/FanPassCard";
import { useAuth } from "@/hooks/useAuth";
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

export default function MiPase() {
  const { user, profile, loading } = useAuth();
  const [pass, setPass] = useState<FanPass | null>(null);
  const [favPlayer, setFavPlayer] = useState<string | null>(null);
  const [loadingPass, setLoadingPass] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setPass(null);
      setLoadingPass(false);
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

  if (loading || loadingPass) {
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
          <Ticket className="w-8 h-8 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">Mi Pase</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión para abrir tu pase digital.</p>
          <Button onClick={() => setAuthOpen(true)} className="w-full">Iniciar sesión</Button>
        </div>
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle>Acceso de aficionados</DialogTitle>
            </DialogHeader>
            <AuthModal onSuccess={() => setAuthOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <Ticket className="w-8 h-8 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">Aún no tienes tu pase</h1>
          <p className="text-sm text-muted-foreground">
            Elige tu nivel de abono y tu pase digital se genera al instante.
          </p>
          <Button asChild className="w-full">
            <Link to="/abonos">Ver abonos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-md mx-auto py-6 flex flex-col items-center"
    >
      <h1 className="sr-only">Mi Pase digital Los Cabos United</h1>
      <FanPassCard pass={pass} favoritePlayerName={favPlayer} avatarUrl={profile?.avatar_url} />
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FlipPass } from "@/components/accesos/FlipPass";

export default function MiPase() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [pass, setPass] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/accesos/registro"); return; }
    (async () => {
      const { data: p } = await supabase.from("fan_passes").select("*").eq("user_id", user.id).maybeSingle();
      if (!p) { navigate("/accesos/registro"); return; }
      setPass(p);
      if (p.favorite_player_id) {
        const { data: pl } = await supabase.from("players").select("name,jersey_number").eq("id", p.favorite_player_id).single();
        setPlayer(pl);
      }
      const { data: h } = await supabase.from("pass_redemptions").select("*").eq("pass_id", p.id).order("created_at", { ascending: false }).limit(5);
      setHistory(h ?? []);
      setBusy(false);
    })();
  }, [user, loading]);

  if (busy) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-5 pt-8">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black mb-1">Tu Pase</motion.h1>
        <p className="text-white/55 mb-8">Toca el pase para ver el reverso.</p>

        <FlipPass pass={pass} player={player} />

        <div className="mt-10">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <History className="w-4 h-4" /> Historial reciente
          </div>
          {history.length === 0 ? (
            <div className="text-white/40 text-xs bg-[#121212] border border-white/5 rounded-xl p-4 text-center">Sin canjes todavía. Vamos al estadio.</div>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between bg-[#121212] border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold capitalize">{h.label || h.kind}</div>
                    <div className="text-[11px] text-white/45">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{h.kind}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
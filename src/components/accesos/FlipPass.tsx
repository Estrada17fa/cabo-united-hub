import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, Repeat, Sparkles, Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TIER_META, type TierId } from "@/lib/tiers";
import lcuCrest from "@/assets/lcu-crest.png";
import { toast } from "sonner";

type Pass = {
  id: string; full_name: string; tier: TierId; pass_code: string;
  expires_at: string | null; favorite_player_id: string | null;
};
type Player = { name: string; jersey_number: number | null };

export function FlipPass({ pass, player }: { pass: Pass; player: Player | null }) {
  const [flipped, setFlipped] = useState(false);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [eventQr, setEventQr] = useState<{ token: string; exp: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const meta = TIER_META[pass.tier];

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const { data } = await supabase.functions.invoke("get-master-qr", {
        headers: { Authorization: `Bearer ${sess.session?.access_token}` },
      });
      if ((data as any)?.token) setToken((data as any).token);
      setLoading(false);
    })();
  }, [pass.id]);

  const generateMatchQr = async () => {
    setGenerating(true);
    const { data: sess } = await supabase.auth.getSession();
    const { data } = await supabase.functions.invoke("generate-event-qr", {
      body: { kind: "match", ref_id: "next", ttl_minutes: 240 },
      headers: { Authorization: `Bearer ${sess.session?.access_token}` },
    });
    setGenerating(false);
    if ((data as any)?.error) { toast.error((data as any).error); return; }
    setEventQr({ token: (data as any).token, exp: (data as any).expires_at });
    toast.success("QR de partido generado");
  };

  return (
    <div className="w-full max-w-[420px] mx-auto" style={{ perspective: 1400 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 90 }}
        style={{ transformStyle: "preserve-3d", position: "relative" }}
        className="aspect-[1/1.55] cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden border border-white/10" style={{ backfaceVisibility: "hidden", background: meta.gradient }}>
          <div className="absolute inset-0 opacity-[0.07] flex items-center justify-center pointer-events-none">
            {player && <span className="text-[260px] font-black leading-none">{player.jersey_number}</span>}
          </div>
          <div className="relative h-full p-6 flex flex-col text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={lcuCrest} alt="" className="w-8 h-8" />
                <span className="text-[10px] tracking-[0.3em] uppercase opacity-80">Pase Oficial</span>
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.35)" }}>
                {meta.label}
              </span>
            </div>

            <div className="mt-auto">
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-70">Aficionado</div>
              <div className="text-2xl font-black leading-tight mt-0.5">{pass.full_name}</div>
              {player && <div className="text-xs opacity-70 mt-1">#{player.jersey_number} · {player.name}</div>}
            </div>

            <div className="mt-4 bg-white rounded-2xl p-3 flex items-center justify-center">
              {loading ? <Loader2 className="w-8 h-8 text-black animate-spin" /> : token ? <QRCodeSVG value={token} size={160} level="M" /> : <span className="text-black text-xs">QR no disponible</span>}
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] opacity-80">
              <span>{pass.pass_code}</span>
              <span className="inline-flex items-center gap-1"><Repeat className="w-3 h-3" /> Toca para voltear</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden border border-white/10 bg-[#0e0e0e]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div className="h-full p-6 flex flex-col text-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-70">Tu nivel</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: meta.accent }}>{meta.label}</span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <Row icon={<Ticket className="w-4 h-4" style={{ color: meta.accent }} />} label="Acceso al estadio" value={pass.tier === "fan" ? "10% descuento" : "Incluido"} />
              <Row icon={<Sparkles className="w-4 h-4" style={{ color: meta.accent }} />} label="Beneficios exclusivos" value={pass.tier === "platino" ? "Plenos" : pass.tier === "premium" ? "Avanzados" : pass.tier === "gold" ? "Esenciales" : "Comunidad"} />
              <Row icon={<Calendar className="w-4 h-4" style={{ color: meta.accent }} />} label="Vigencia" value={pass.expires_at ? new Date(pass.expires_at).toLocaleDateString() : "Permanente"} />
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-60 mb-2">Próximo partido</div>
              {eventQr ? (
                <div className="bg-white rounded-xl p-2 flex items-center justify-center">
                  <QRCodeSVG value={eventQr.token} size={120} level="M" />
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); generateMatchQr(); }}
                  disabled={generating || pass.tier === "fan"}
                  className="w-full h-11 rounded-full font-bold text-sm disabled:opacity-50"
                  style={{ background: meta.accent, color: "#0a0a0a" }}
                >
                  {generating ? "Generando..." : pass.tier === "fan" ? "Sube de nivel para acceder" : "Generar QR de entrada"}
                </button>
              )}
            </div>

            <div className="mt-auto text-[10px] opacity-50 text-center">Toca para voltear</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2 text-white/65 text-xs">{icon}{label}</div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}
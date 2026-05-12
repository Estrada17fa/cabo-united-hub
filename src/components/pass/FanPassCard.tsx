import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { RotateCw, Loader2, Calendar, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import lcuCrest from "@/assets/lcu-crest.png";

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

interface QrPayload {
  token: string;
  expires_at: string;
  match: {
    id: string;
    home_team: string;
    away_team: string;
    match_date: string;
    match_time: string | null;
    venue: string | null;
  } | null;
}

const TIER_STYLE: Record<FanPass["tier"], { accent: string; label: string; bg: string }> = {
  fan: { accent: "#FFFFFF", label: "FAN", bg: "linear-gradient(135deg, #1a1a1a, #0a0a0a)" },
  gold: { accent: "#F59E0B", label: "GOLD", bg: "linear-gradient(135deg, #2a1f08, #0a0a0a)" },
  premium: { accent: "#00abc4", label: "PREMIUM", bg: "linear-gradient(135deg, #06222a, #0a0a0a)" },
  platino: { accent: "#E2E8F0", label: "PLATINO", bg: "linear-gradient(135deg, #1f2330, #0a0a0a)" },
};

export function FanPassCard({ pass, favoritePlayerName }: { pass: FanPass; favoritePlayerName?: string | null }) {
  const [flipped, setFlipped] = useState(false);
  const [qr, setQr] = useState<QrPayload | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const tier = TIER_STYLE[pass.tier];
  const issuedDate = new Date(pass.issued_at).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const fetchQr = async () => {
    if (pass.status !== "active") {
      setQrError("Tu pase aún no está activo");
      return;
    }
    setLoadingQr(true);
    setQrError(null);
    const { data, error } = await supabase.functions.invoke("issue-match-qr");
    setLoadingQr(false);
    if (error || !data?.token) {
      setQrError("No pudimos generar tu QR. Intenta de nuevo.");
      return;
    }
    setQr(data as QrPayload);
  };

  useEffect(() => {
    if (flipped && !qr && pass.status === "active") fetchQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  return (
    <div className="w-full max-w-md mx-auto" style={{ perspective: 1400 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
        style={{ transformStyle: "preserve-3d", aspectRatio: "1.6 / 1" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            background: tier.bg,
            border: `1px solid ${tier.accent}40`,
            boxShadow: `0 30px 60px -20px ${tier.accent}30, inset 0 1px 0 ${tier.accent}20`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <img src={lcuCrest} alt="LCU" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-[9px] tracking-[0.18em] text-white/60 font-bold">LOS CABOS UNITED</div>
                <div className="text-[10px] text-white/50">Pase digital · Temporada 25–26</div>
              </div>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full"
              style={{ background: tier.accent, color: "#0a0a0a" }}
            >
              {tier.label}
            </span>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/50 mb-1">Titular</div>
            <div className="text-xl md:text-2xl font-bold text-white leading-tight">{pass.full_name}</div>
            {favoritePlayerName && (
              <div className="text-[11px] text-white/60 mt-1 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" style={{ color: tier.accent }} /> Jugador favorito: {favoritePlayerName}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">N° de pase</div>
              <div className="text-sm font-mono font-bold text-white tracking-widest">{pass.pass_code}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">Emitido</div>
              <div className="text-[11px] text-white/80">{issuedDate}</div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#fff",
            border: `1px solid ${tier.accent}55`,
            boxShadow: `0 30px 60px -20px ${tier.accent}30`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-black/55 font-bold">Acceso al estadio</div>
              <div className="text-[11px] text-black/55">QR único por partido</div>
            </div>
            <ShieldCheck className="w-5 h-5" style={{ color: tier.accent }} />
          </div>

          <div className="flex-1 flex items-center justify-center my-2">
            {loadingQr ? (
              <div className="flex flex-col items-center gap-2 text-black/60">
                <Loader2 className="w-6 h-6 animate-spin" />
                <div className="text-xs">Generando QR…</div>
              </div>
            ) : qrError ? (
              <div className="text-center">
                <div className="text-xs text-red-600 mb-2">{qrError}</div>
                <button onClick={fetchQr} className="text-xs underline text-black/70">
                  Reintentar
                </button>
              </div>
            ) : qr ? (
              <div className="bg-white p-2 rounded-md">
                <QRCodeSVG value={qr.token} size={140} level="M" includeMargin={false} />
              </div>
            ) : (
              <div className="text-xs text-black/50">Toca el botón para generar</div>
            )}
          </div>

          {qr?.match ? (
            <div className="text-[11px] text-black/70 leading-snug">
              <div className="font-bold text-black truncate">
                {qr.match.home_team} vs {qr.match.away_team}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {qr.match.match_date}
                  {qr.match.match_time ? ` · ${qr.match.match_time.slice(0, 5)}` : ""}
                </span>
                {qr.match.venue && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {qr.match.venue}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-black/50">No hay próximo partido programado.</div>
          )}
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] px-4 py-2 rounded-full bg-card border border-border text-foreground hover:border-primary/40 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          {flipped ? "Ver frente" : "Ver QR del partido"}
        </button>
        {flipped && (
          <button
            onClick={fetchQr}
            disabled={loadingQr}
            className="text-xs text-muted-foreground underline disabled:opacity-50"
          >
            Regenerar
          </button>
        )}
      </div>
    </div>
  );
}
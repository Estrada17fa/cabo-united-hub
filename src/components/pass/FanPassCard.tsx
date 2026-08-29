import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Calendar, MapPin, Sparkles, ShieldCheck, Download, Share2, Store, Ticket } from "lucide-react";

import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import lcuCrest from "@/assets/lcu-crest.png";
import { tierStyle } from "@/lib/tiers";

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

// Estilo de tier centralizado en src/lib/tiers.ts (fuente única)

const TIER_DISCOUNT: Record<FanPass["tier"], number> = {
  fan: 10, gold: 15, premium: 20, platino: 25,
};

const MEMBER_TTL_MS = 180_000;

interface MemberQr {
  token: string;
  issued_at: number;
  ttl: number;
}

function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}


export function FanPassCard({
  pass,
  favoritePlayerName,
  avatarUrl,
}: {
  pass: FanPass;
  favoritePlayerName?: string | null;
  avatarUrl?: string | null;
}) {
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"stadium" | "business">("stadium");
  const [qr, setQr] = useState<QrPayload | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<null | "card" | "story">(null);
  const [memberQr, setMemberQr] = useState<MemberQr | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const frontRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const tier = tierStyle(pass.tier);
  const issuedDate = new Date(pass.issued_at).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const accessZone = pass.tier === "premium" || pass.tier === "platino" ? "Zona Preferencial" : "Acceso General";

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

  const fetchMemberQr = useCallback(async () => {
    if (pass.status !== "active") {
      setMemberError("Tu pase aún no está activo");
      return;
    }
    setMemberLoading(true);
    const { data, error } = await supabase.functions.invoke("issue-member-qr");
    setMemberLoading(false);
    if (error || !data?.token) {
      setMemberError("No pudimos actualizar tu QR. Revisa tu conexión.");
      return;
    }
    setMemberError(null);
    setMemberQr({ token: data.token, issued_at: Date.now(), ttl: (data.ttl_seconds ?? 180) * 1000 });
  }, [pass.status]);

  useEffect(() => {
    if (flipped && mode === "stadium" && !qr && pass.status === "active") fetchQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, mode]);

  // QR de comercios: se genera al entrar al modo y se renueva cada 3 minutos
  useEffect(() => {
    if (!flipped || mode !== "business" || pass.status !== "active") return;
    if (!memberQr) fetchMemberQr();
    const interval = window.setInterval(fetchMemberQr, MEMBER_TTL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchMemberQr();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, mode, pass.status]);

  // Tick para el anillo de cuenta regresiva
  useEffect(() => {
    if (!flipped || mode !== "business") return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [flipped, mode]);

  const memberElapsed = memberQr ? now - memberQr.issued_at : 0;
  const memberSecondsLeft = memberQr ? Math.max(0, Math.ceil((memberQr.ttl - memberElapsed) / 1000)) : 0;
  const memberProgress = memberQr ? Math.max(0, Math.min(1, 1 - memberElapsed / memberQr.ttl)) : 0;
  const memberStale = !!memberQr && memberElapsed > memberQr.ttl;
  const memberAgeLabel = `${Math.max(1, Math.round(memberElapsed / 60000))} min`;


  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCard = async () => {
    if (!frontRef.current) return;
    setExporting("card");
    try {
      const wasFlipped = flipped;
      if (wasFlipped) setFlipped(false);
      await new Promise((r) => setTimeout(r, 50));
      const dataUrl = await toPng(frontRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "transparent",
      });
      downloadDataUrl(dataUrl, `LCU-Pase-${pass.pass_code}.png`);
    } finally {
      setExporting(null);
    }
  };

  const exportStory = async () => {
    if (!storyRef.current) return;
    setExporting("story");
    try {
      const dataUrl = await toPng(storyRef.current, {
        pixelRatio: 1,
        cacheBust: true,
        width: 1080,
        height: 1920,
      });
      downloadDataUrl(dataUrl, `LCU-Story-${pass.pass_code}.png`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="w-full max-w-[340px] mx-auto select-none" style={{ perspective: 1600 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setFlipped((f) => !f)}
        whileTap={{ scale: 0.98 }}
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d", aspectRatio: "0.63 / 1" }}
      >
        {/* FRONT */}
        <div
          ref={frontRef}
          className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            background: tier.bg,
            border: `1px solid ${tier.accent}40`,
            boxShadow: `0 30px 60px -20px ${tier.accent}30, inset 0 1px 0 ${tier.accent}20`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <img src={lcuCrest} alt="LCU" className="w-9 h-9 object-contain" />
              <div>
                <div className="text-[9px] tracking-[0.18em] text-white/60 font-bold">LOS CABOS UNITED</div>
                <div className="text-[9px] text-white/45">Temporada 25–26</div>
              </div>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
              style={{ background: tier.accent, color: "#0a0a0a" }}
            >
              {tier.label}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: `${tier.accent}18`,
                border: `2px solid ${tier.accent}`,
                boxShadow: `0 8px 30px -8px ${tier.accent}80`,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={pass.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white tracking-wide">
                  {getInitials(pass.full_name) || "LCU"}
                </span>
              )}
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.18em] mt-3 font-bold"
              style={{ color: tier.accent }}
            >
              Amo del Paraíso
            </div>
            <div className="text-lg font-bold text-white leading-tight mt-0.5 px-2">{pass.full_name}</div>
            {favoritePlayerName && (
              <div className="text-[10px] text-white/60 mt-1 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" style={{ color: tier.accent }} /> Fav: {favoritePlayerName}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">N° de pase</div>
              <div className="text-[13px] font-mono font-bold text-white tracking-widest">{pass.pass_code}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">Emitido</div>
              <div className="text-[11px] text-white/80">{issuedDate}</div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-3xl p-5 flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#fff",
            border: `1px solid ${tier.accent}55`,
            boxShadow: `0 30px 60px -20px ${tier.accent}30`,
          }}
        >
          {/* Selector de modo */}
          <div
            className="flex items-center gap-1 p-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.06)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {([
              { id: "stadium" as const, label: "Estadio", Icon: Ticket },
              { id: "business" as const, label: "Comercios", Icon: Store },
            ]).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-bold uppercase tracking-wider transition"
                style={
                  mode === id
                    ? { background: tier.accent, color: "#0a0a0a" }
                    : { color: "rgba(0,0,0,0.55)" }
                }
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {mode === "stadium" ? (
            <>
              <div className="flex items-start justify-between mt-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-black/55 font-bold">Acceso al estadio</div>
                  <div className="text-[11px] text-black/55">Acceso digital próximamente</div>
                </div>
                <ShieldCheck className="w-5 h-5" style={{ color: tier.accent }} />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center my-2 text-center px-4">
                <Ticket className="w-8 h-8 mb-3" style={{ color: tier.accent }} />
                <div className="text-sm font-bold text-black/80 leading-snug">
                  Próximamente verás tu QR para ingresar al estadio
                </div>
                <div className="text-[11px] text-black/55 mt-1">Espéralo</div>
              </div>

              <div
                className="flex items-center justify-between rounded-xl px-3 py-2 mb-2"
                style={{ background: `${tier.accent}1f`, border: `1px solid ${tier.accent}55` }}
              >
                <span className="text-[10px] uppercase tracking-[0.14em] text-black/55 font-bold">Acceso</span>
                <span className="text-[12px] font-bold text-black inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {accessZone}
                </span>
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
            </>
          ) : (
            <>
              <div className="flex items-start justify-between mt-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-black/55 font-bold">Beneficios en comercios</div>
                  <div className="text-[11px] text-black/55">Canjea beneficios próximamente</div>
                </div>
                <Store className="w-5 h-5" style={{ color: tier.accent }} />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center my-2 text-center px-4">
                <Store className="w-8 h-8 mb-3" style={{ color: tier.accent }} />
                <div className="text-sm font-bold text-black/80 leading-snug">
                  Próximamente verás tu QR para sumar puntos y obtener descuentos en comercios
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tier.accent}22`, border: `2px solid ${tier.accent}` }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={pass.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-black/70">{getInitials(pass.full_name) || "LCU"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-black leading-tight truncate">
                    {pass.full_name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                      style={{ background: tier.accent === "#FFFFFF" ? "#0a0a0a" : tier.accent, color: tier.accent === "#FFFFFF" ? "#fff" : "#0a0a0a" }}
                    >
                      {tier.label}
                    </span>
                    <span className="text-[11px] font-bold text-black/70">
                      {TIER_DISCOUNT[pass.tier]}% de descuento
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </motion.div>

      <div className="mt-4 flex flex-col items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Toca el pase para girarlo
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={exportCard}
            disabled={!!exporting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur hover:bg-white/10 transition disabled:opacity-50"
          >
            {exporting === "card" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Descargar pase
          </button>
          <button
            onClick={exportStory}
            disabled={!!exporting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${tier.accent}, #f298c0)`,
              color: "#0a0a0a",
            }}
          >
            {exporting === "story" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
            Compartir story
          </button>
        </div>
      </div>

      {/* Hidden story canvas (1080x1920) for export */}
      <div
        style={{
          position: "fixed",
          top: -10000,
          left: -10000,
          pointerEvents: "none",
          opacity: 0,
        }}
        aria-hidden
      >
        <div
          ref={storyRef}
          style={{
            width: 1080,
            height: 1920,
            position: "relative",
            background: `radial-gradient(circle at 30% 20%, ${tier.accent}26, transparent 55%), radial-gradient(circle at 75% 85%, #f298c033, transparent 55%), #050505`,
            fontFamily: "Poppins, system-ui, sans-serif",
            overflow: "hidden",
            color: "#fff",
          }}
        >
          {/* Big crest watermark */}
          <img
            src={lcuCrest}
            alt=""
            style={{
              position: "absolute",
              right: -180,
              top: -120,
              width: 900,
              opacity: 0.07,
              transform: "rotate(-12deg)",
            }}
          />

          {/* Header */}
          <div style={{ position: "absolute", top: 80, left: 80, display: "flex", alignItems: "center", gap: 18 }}>
            <img src={lcuCrest} alt="" style={{ width: 90, height: 90, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 22, letterSpacing: 6, color: "#ffffffaa", fontWeight: 700 }}>
                LOS CABOS UNITED
              </div>
              <div style={{ fontSize: 18, color: "#ffffff66" }}>Pase Oficial · Temporada 25–26</div>
            </div>
          </div>

          {/* Tier ribbon */}
          <div
            style={{
              position: "absolute",
              top: 110,
              right: 80,
              padding: "12px 28px",
              borderRadius: 999,
              background: tier.accent,
              color: "#0a0a0a",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: 4,
            }}
          >
            {tier.label}
          </div>

          {/* Pass card mock — recreated at story scale */}
          <div
            style={{
              position: "absolute",
              top: 320,
              left: "50%",
              transform: "translateX(-50%)",
              width: 720,
              height: 1140,
              borderRadius: 56,
              padding: 56,
              background: tier.bg,
              border: `2px solid ${tier.accent}80`,
              boxShadow: `0 60px 120px -30px ${tier.accent}55, inset 0 2px 0 ${tier.accent}40`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img src={lcuCrest} alt="" style={{ width: 70, height: 70, objectFit: "contain" }} />
                <div>
                  <div style={{ fontSize: 16, letterSpacing: 4, color: "#ffffffaa", fontWeight: 700 }}>
                    LCU
                  </div>
                  <div style={{ fontSize: 14, color: "#ffffff70" }}>Temporada 25–26</div>
                </div>
              </div>
              <div
                style={{
                  background: tier.accent,
                  color: "#0a0a0a",
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: 3,
                  padding: "8px 18px",
                  borderRadius: 999,
                }}
              >
                {tier.label}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: "50%",
                  background: `${tier.accent}28`,
                  border: `4px solid ${tier.accent}`,
                  boxShadow: `0 20px 60px -15px ${tier.accent}90`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 96, fontWeight: 800, color: "#fff" }}>
                    {getInitials(pass.full_name) || "LCU"}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: 6,
                  color: tier.accent,
                  marginTop: 28,
                  textTransform: "uppercase",
                }}
              >
                Amo del Paraíso
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, color: "#fff", marginTop: 8, lineHeight: 1.1 }}>
                {pass.full_name}
              </div>
              {favoritePlayerName && (
                <div style={{ fontSize: 20, color: "#ffffff99", marginTop: 14 }}>
                  Fav: {favoritePlayerName}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 14, letterSpacing: 3, color: "#ffffff70", fontWeight: 700 }}>
                  N° DE PASE
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontFamily: "monospace",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: 4,
                  }}
                >
                  {pass.pass_code}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, letterSpacing: 3, color: "#ffffff70", fontWeight: 700 }}>
                  EMITIDO
                </div>
                <div style={{ fontSize: 18, color: "#ffffffcc" }}>{issuedDate}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 70,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 22,
              letterSpacing: 6,
              color: "#ffffff80",
              fontWeight: 700,
            }}
          >
            #SOYLCU · loscabosunited.mx
          </div>
        </div>
      </div>
    </div>
  );
}

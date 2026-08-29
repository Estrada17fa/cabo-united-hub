import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import lcuCrest from "@/assets/lcu-crest.png";

const TIER_ACCENT: Record<string, { color: string; label: string; bg: string }> = {
  fan: { color: "#FFFFFF", label: "FAN", bg: "linear-gradient(120deg, #1f1f1f, #0a0a0a)" },
  gold: { color: "#F59E0B", label: "GOLD", bg: "linear-gradient(120deg, #2a1f08, #0a0a0a)" },
  premium: { color: "#00abc4", label: "PREMIUM", bg: "linear-gradient(120deg, #06222a, #0a0a0a)" },
  platino: { color: "#E2E8F0", label: "PLATINO", bg: "linear-gradient(120deg, #1f2330, #0a0a0a)" },
};

interface Props {
  userId?: string;
  onTierLoad?: (tier: string | null) => void;
  /** Vista estática usada durante el registro (aún no existe pase en la base) */
  preview?: { tier: string; name: string; status?: string };
}

export function FanPassPreview({ userId, onTierLoad, preview }: Props) {
  const navigate = useNavigate();
  const [pass, setPass] = useState<{ pass_code: string; tier: string; status: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("fan_passes")
      .select("pass_code, tier, status")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setPass(data as any);
        setLoaded(true);
        onTierLoad?.((data as any)?.tier ?? null);
      });
  }, [userId, onTierLoad]);

  if (preview) {
    const tp = TIER_ACCENT[preview.tier] ?? TIER_ACCENT.fan;
    const waitlist = preview.status === "waitlist";
    return (
      <div
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{
          background: tp.bg,
          border: `1px solid ${tp.color}40`,
          boxShadow: `0 18px 48px -22px ${tp.color}66, inset 0 1px 0 ${tp.color}22`,
        }}
      >
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: tp.color }}
        />
        <div className="relative flex items-center gap-4">
          <img src={lcuCrest} alt="Escudo Los Cabos United" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
                style={{ background: tp.color, color: "#0a0a0a" }}
              >
                {tp.label}
              </span>
              {waitlist && (
                <span className="text-[10px] uppercase tracking-wider text-amber-400/90">Lista de espera</span>
              )}
            </div>
            <div className="text-base font-bold text-white mt-1.5 truncate">{preview.name}</div>
            <div className="text-[11px] text-white/55 mt-1 inline-flex items-center gap-1">
              <IdCard className="w-3 h-3" /> Tu código LCU se genera al confirmar
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div
        className="rounded-2xl p-6 h-[160px] animate-pulse"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
      />
    );
  }

  if (!pass) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="text-sm text-white/70 mb-3">
          Aún no tienes tu pase generado. Completa tu registro para activarlo.
        </div>
        <button
          onClick={() => navigate("/mi-perfil")}
          className="inline-flex items-center gap-2 font-bold text-[13px] px-4 py-2 rounded-lg"
          style={{ background: "#00abc4", color: "#0a0a0a" }}
        >
          Ir a mi perfil <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const t = TIER_ACCENT[pass.tier] ?? TIER_ACCENT.fan;
  const active = pass.status === "active";

  return (
    <button
      type="button"
      onClick={() => navigate("/mi-pase")}
      className="relative block w-full text-left rounded-2xl p-5 md:p-6 overflow-hidden group transition-transform hover:-translate-y-0.5"
      style={{
        background: t.bg,
        border: `1px solid ${t.color}40`,
        boxShadow: `0 18px 48px -22px ${t.color}66, inset 0 1px 0 ${t.color}22`,
      }}
    >
      <div
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: t.color }}
      />
      <div className="relative flex items-center gap-4 md:gap-5">
        <img src={lcuCrest} alt="LCU" className="w-14 h-14 md:w-16 md:h-16 object-contain flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
              style={{ background: t.color, color: "#0a0a0a" }}
            >
              {t.label}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Amo del Paraíso
            </span>
            {!active && (
              <span className="text-[10px] uppercase tracking-wider text-amber-400/90">Pendiente</span>
            )}
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-white tracking-widest mt-1.5 truncate">
            {pass.pass_code}
          </div>
          <div className="text-[11px] text-white/55 mt-1 inline-flex items-center gap-1">
            <IdCard className="w-3 h-3" /> Temporada 2025–26 · {active ? "Activo" : "Pendiente de pago"}
          </div>
        </div>
        <div
          className="hidden sm:inline-flex items-center gap-1.5 font-bold text-[12px] px-3.5 py-2 rounded-lg flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: `1px solid ${t.color}55` }}
        >
          Ver mi pase
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import lcuCrest from "@/assets/lcu-crest.png";

const TIER_ACCENT: Record<string, { color: string; label: string; bg: string }> = {
  fan: { color: "#FFFFFF", label: "FAN", bg: "linear-gradient(120deg, #1f1f1f, #0a0a0a)" },
  gold: { color: "#F59E0B", label: "GOLD", bg: "linear-gradient(120deg, #2a1f08, #0a0a0a)" },
  premium: { color: "#00abc4", label: "PREMIUM", bg: "linear-gradient(120deg, #06222a, #0a0a0a)" },
  platino: { color: "#E2E8F0", label: "PLATINO", bg: "linear-gradient(120deg, #1f2330, #0a0a0a)" },
};

interface Props {
  userId: string;
  onNavigate?: () => void;
}

export function FanPassMini({ userId, onNavigate }: Props) {
  const [pass, setPass] = useState<{ pass_code: string; tier: string; status: string } | null>(null);

  useEffect(() => {
    supabase
      .from("fan_passes")
      .select("pass_code, tier, status")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setPass(data as any));
  }, [userId]);

  if (!pass) return null;
  const t = TIER_ACCENT[pass.tier] ?? TIER_ACCENT.fan;
  const active = pass.status === "active";

  return (
    <Link
      to="/mi-perfil"
      onClick={onNavigate}
      className="relative block rounded-2xl p-3 overflow-hidden group"
      style={{
        background: t.bg,
        border: `1px solid ${t.color}40`,
        boxShadow: `0 12px 30px -14px ${t.color}55, inset 0 1px 0 ${t.color}22`,
      }}
    >
      {/* Glow accent */}
      <div
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: t.color }}
      />
      <div className="relative flex items-center gap-3">
        <img src={lcuCrest} alt="LCU" className="w-9 h-9 object-contain flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full"
              style={{ background: t.color, color: "#0a0a0a" }}
            >
              {t.label}
            </span>
            {!active && (
              <span className="text-[9px] uppercase tracking-wider text-amber-400/90">Pendiente</span>
            )}
          </div>
          <div className="text-[10px] text-white/55 mt-1 inline-flex items-center gap-1">
            <IdCard className="w-3 h-3" /> Pase digital
          </div>
          <div className="text-[12px] font-mono font-bold text-white tracking-widest truncate">
            {pass.pass_code}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

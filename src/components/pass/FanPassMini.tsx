import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import lcuCrest from "@/assets/lcu-crest.png";
import { tierStyle } from "@/lib/tiers";

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
  const s0 = tierStyle(pass.tier);
  const t = { color: s0.accent, label: s0.label, bg: s0.bg };
  const active = pass.status === "active";

  return (
    <Link
      to="/mi-pase"
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

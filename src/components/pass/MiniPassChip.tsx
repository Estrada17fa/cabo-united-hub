import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { tierStyle } from "@/lib/tiers";
import lcuCrest from "@/assets/lcu-crest.png";

interface Props {
  /** Se invoca cuando no hay sesión y el usuario toca el chip. */
  onRequestAuth?: () => void;
}

/**
 * Versión compacta del pase real para la barra superior.
 * Color/estilo derivados de los tokens de tier (src/lib/tiers.ts).
 */
export function MiniPassChip({ onRequestAuth }: Props) {
  const { user } = useAuth();
  const [pass, setPass] = useState<{ pass_code: string; tier: string } | null>(null);

  useEffect(() => {
    if (!user) {
      setPass(null);
      return;
    }
    let alive = true;
    supabase
      .from("fan_passes")
      .select("pass_code, tier")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setPass((data as { pass_code: string; tier: string } | null) ?? null);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user || !pass) {
    return (
      <button
        type="button"
        onClick={onRequestAuth}
        className="flex items-center gap-1.5 rounded-[11px] border border-hairline bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/50"
      >
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="hidden sm:inline">Iniciar sesión</span>
        <span className="sm:hidden">Entrar</span>
      </button>
    );
  }

  const t = tierStyle(pass.tier);

  return (
    <Link
      to="/mi-pase"
      aria-label="Ver mi pase"
      className="flex items-center gap-2 overflow-hidden rounded-[11px] px-2 py-1.5 transition-transform active:scale-[0.98]"
      style={{
        background: t.bg,
        border: `1px solid ${t.accent}40`,
        boxShadow: `inset 0 1px 0 ${t.accent}1f`,
      }}
    >
      <img src={lcuCrest} alt="" className="h-6 w-6 flex-shrink-0 object-contain" />
      <span className="min-w-0 leading-tight">
        <span
          className="block text-[8px] font-bold uppercase tracking-[0.14em]"
          style={{ color: t.accent }}
        >
          {t.label}
        </span>
        <span className="block truncate font-display text-[10px] font-medium tabular-nums text-foreground/80">
          {pass.pass_code}
        </span>
      </span>
      <span
        className="hidden text-[10px] font-semibold sm:inline"
        style={{ color: t.accent }}
      >
        Ver mi pase
      </span>
      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: t.accent }} />
    </Link>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { tierStyle } from "@/lib/tiers";

interface Props {
  /** Se invoca cuando no hay sesión y el usuario toca el chip. */
  onRequestAuth?: () => void;
}

/**
 * Versión compacta del pase para la barra superior.
 * Solo texto + chevron; el color de fondo/borde viene del tier del usuario.
 */
export function MiniPassChip({ onRequestAuth }: Props) {
  const { user } = useAuth();
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTier(null);
      return;
    }
    let alive = true;
    supabase
      .from("fan_passes")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setTier((data as { tier: string } | null)?.tier ?? "fan");
      });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={onRequestAuth}
        className="flex items-center gap-1 rounded-[11px] border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap">Quiero Mi Pase</span>
      </button>
    );
  }

  const t = tierStyle(tier ?? "fan");

  return (
    <Link
      to="/mi-pase"
      aria-label="Ver mi pase"
      className="flex items-center gap-0.5 rounded-[11px] px-2.5 py-1.5 transition-transform active:scale-[0.97]"
      style={{
        background: t.bg,
        border: `1px solid ${t.accent}40`,
        boxShadow: `inset 0 1px 0 ${t.accent}1f`,
      }}
    >
      <span
        className="whitespace-nowrap text-[11px] font-semibold"
        style={{ color: t.accent }}
      >
        Ver mi pase
      </span>
      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: t.accent }} />
    </Link>
  );
}

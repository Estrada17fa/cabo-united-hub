import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Ticket, ShoppingBag, Crown, ChevronRight, Coins, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import prizeTickets from "@/assets/prize-tickets.jpg";
import prizeJersey from "@/assets/prize-jersey.jpg";
import prizePass from "@/assets/prize-pass.jpg";
import prizeVestuario from "@/assets/prize-vestuario.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ACCENT = "#00abc4";

const ICONS: Record<string, LucideIcon> = { Ticket, ShoppingBag, Crown, Gift };
const FALLBACK_IMAGES = [prizeTickets, prizePass, prizeJersey, prizeVestuario];

interface Prize {
  id: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  title: string;
  cc_cost: number;
  image: string;
  description: string;
  tier: string;
}

interface PrizesCarouselCardProps {
  className?: string;
  showFooterLink?: boolean;
}

export function PrizesCarouselCard({
  className = "",
  showFooterLink = true,
}: PrizesCarouselCardProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [index, setIndex] = useState(0);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    supabase
      .from("rewards")
      .select("id,slug,title,description,image_url,icon,cc_cost,tier,sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setPrizes(
          data.map((r: any, i: number) => ({
            id: r.id,
            slug: r.slug,
            icon: ICONS[r.icon] ?? Gift,
            color: r.tier === "premium" ? "#F59E0B" : ACCENT,
            title: r.title,
            cc_cost: r.cc_cost,
            image: r.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
            description: r.description ?? "",
            tier: r.tier,
          })),
        );
      });
  }, []);

  useEffect(() => {
    if (prizes.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % prizes.length);
    }, 4500);
    return () => clearInterval(id);
  }, [prizes.length]);

  if (prizes.length === 0) {
    return (
      <div
        className={`rounded-2xl border ${className}`}
        style={{ background: "#0f0f0f", borderColor: "rgba(255,255,255,0.07)", minHeight: 320 }}
      />
    );
  }

  const current = prizes[index];
  const Icon = current.icon;
  const canRedeem = !!user && (profile?.cc ?? 0) >= current.cc_cost;

  const handleRedeem = async () => {
    if (!user) {
      toast.error("Inicia sesión para canjear premios");
      return;
    }
    if (!canRedeem) {
      toast.error("Te faltan Cabo Coins", {
        description: `Necesitas ${current.cc_cost.toLocaleString()} CC y tienes ${(profile?.cc ?? 0).toLocaleString()}.`,
      });
      return;
    }
    setRedeeming(true);
    const { error } = await (supabase.rpc as any)("redeem_reward", { _reward_id: current.id });
    setRedeeming(false);
    if (error) {
      toast.error("No se pudo canjear", { description: error.message });
      return;
    }
    toast.success("¡Canje exitoso!", { description: `Revisa tu perfil para ver el código.` });
    refreshProfile();
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col ${className}`}
      style={{
        background: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4" style={{ color: ACCENT }} />
          <h3
            className="font-semibold text-white uppercase"
            style={{ fontSize: 12, letterSpacing: "0.16em" }}
          >
            Premios por puntos
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
          {index + 1} / {prizes.length}
        </span>
      </div>

      <div
        className="relative flex-1 mx-3 rounded-xl overflow-hidden border"
        style={{ borderColor: "rgba(255,255,255,0.07)", minHeight: 240 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <img
              src={current.image}
              alt={current.title}
              loading="lazy"
              width={800}
              height={512}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.2) 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${current.color}26`,
                    border: `1px solid ${current.color}66`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: current.color }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    background: `${current.color}26`,
                    color: current.color,
                    border: `1px solid ${current.color}55`,
                  }}
                >
                  <Coins className="inline w-3 h-3 mr-1 -mt-0.5" />
                  {current.cc_cost.toLocaleString()} CC
                </span>
              </div>
              <div className="text-[15px] font-bold text-white leading-tight mb-1">
                {current.title}
              </div>
              <div className="text-[11px] text-white/65 leading-snug line-clamp-2">
                {current.description}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        {prizes.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Ir al premio ${i + 1}`}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index ? 18 : 6,
              background: i === index ? ACCENT : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleRedeem}
        disabled={redeeming || !canRedeem}
        className="mx-3 mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
        style={{
          background: current.color,
          color: "#0a0a0a",
        }}
      >
        <Coins className="w-3.5 h-3.5" />
        {!user
          ? "Inicia sesión para canjear"
          : !canRedeem
            ? `Te faltan ${(current.cc_cost - (profile?.cc ?? 0)).toLocaleString()} CC`
            : redeeming
              ? "Canjeando..."
              : "Canjear ahora"}
      </button>

      {showFooterLink && (
        <Link
          to="/fan-zone"
          className="mx-3 mb-3 mt-3 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-bold transition-colors hover:bg-white/5"
          style={{ color: ACCENT }}
        >
          Ver todos los premios <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
      {!showFooterLink && <div className="h-3" />}
    </div>
  );
}
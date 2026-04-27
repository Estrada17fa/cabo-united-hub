import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Ticket, ShoppingBag, Crown, ChevronRight } from "lucide-react";
import prizeTickets from "@/assets/prize-tickets.jpg";
import prizeJersey from "@/assets/prize-jersey.jpg";
import prizePass from "@/assets/prize-pass.jpg";
import prizeVestuario from "@/assets/prize-vestuario.jpg";

const ACCENT = "#00abc4";

export const PRIZES = [
  {
    icon: Ticket,
    color: ACCENT,
    title: "Boletos para el próximo partido",
    threshold: "5,000 pts",
    image: prizeTickets,
    description: "Asiste al próximo partido en casa con boletos cortesía de Los Cabos United.",
  },
  {
    icon: ShoppingBag,
    color: "hsl(336 80% 77%)",
    title: "Jersey oficial firmado",
    threshold: "15,000 pts",
    image: prizeJersey,
    description: "Llévate un jersey oficial autografiado por todo el plantel.",
  },
  {
    icon: Crown,
    color: "#F59E0B",
    title: "Pase del Amo · 20% en tienda",
    threshold: "10,000 pts",
    image: prizePass,
    description: "Acceso preferencial y 20% de descuento permanente en la tienda oficial.",
  },
  {
    icon: Gift,
    color: "#A78BFA",
    title: "Experiencia en el vestuario",
    threshold: "25,000 pts",
    image: prizeVestuario,
    description: "Conoce el vestuario oficial y vive el día de partido como un jugador.",
  },
];

interface PrizesCarouselCardProps {
  className?: string;
  showFooterLink?: boolean;
}

export function PrizesCarouselCard({
  className = "",
  showFooterLink = true,
}: PrizesCarouselCardProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PRIZES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const current = PRIZES[index];
  const Icon = current.icon;

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
            className="font-extrabold text-white uppercase"
            style={{ fontSize: 12, letterSpacing: "0.16em" }}
          >
            Premios por puntos
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
          {index + 1} / {PRIZES.length}
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
                  A partir de {current.threshold}
                </span>
              </div>
              <div className="text-[15px] font-extrabold text-white leading-tight mb-1">
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
        {PRIZES.map((_, i) => (
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

      {showFooterLink && (
        <Link
          to="/fan-zone"
          className="mx-3 mb-3 mt-3 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-bold transition-colors hover:bg-white/5"
          style={{ color: ACCENT }}
        >
          Ver todos los premios <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
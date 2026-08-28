import { motion } from "framer-motion";
import type { ReactNode } from "react";
import heroStadium from "@/assets/match-hero-stadium.jpg";

interface HeroCardProps {
  children: ReactNode;
  /** Imagen de fondo oscurecida; por defecto el estadio LCU */
  image?: string | null;
  /** Textura de ola de marca detrás del contenido */
  wave?: boolean;
  /** Aro de foco cyan (elemento hero de la pantalla) */
  focus?: boolean;
  className?: string;
  contentClassName?: string;
}

/** Tarjeta hero del sistema LCU: foto oscurecida + degradado a negro + ola. */
export function HeroCard({
  children,
  image = heroStadium,
  wave = true,
  focus = true,
  className = "",
  contentClassName = "",
}: HeroCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-card border ${
        focus ? "border-primary/25" : "border-white/[0.07]"
      } bg-surface-1 ${wave ? "wave-motif wave-motif-soft" : ""} ${className}`}
      style={
        focus
          ? { boxShadow: "0 24px 60px -32px hsl(var(--primary) / 0.55)" }
          : undefined
      }
    >
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, hsl(0 0% 0% / 0.55) 0%, hsl(0 0% 0% / 0.82) 55%, hsl(0 0% 0% / 0.97) 100%)",
            }}
          />
        </>
      )}
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </motion.section>
  );
}

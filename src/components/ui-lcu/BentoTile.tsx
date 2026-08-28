import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BentoTileProps {
  value: ReactNode;
  label: string;
  /** Destaca el dato principal con el acento cyan */
  emphasis?: boolean;
  index?: number;
  className?: string;
}

/** Tile de mosaico bento: número grande + label chico. */
export function BentoTile({ value, label, emphasis, index = 0, className = "" }: BentoTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
      className={`rounded-2xl px-3 py-3 text-center ${
        emphasis
          ? "border border-primary/35 bg-primary/10"
          : "border border-white/[0.07] bg-surface-2"
      } ${className}`}
    >
      <p
        className={`num-hero text-2xl md:text-3xl ${
          emphasis ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-label-fg">
        {label}
      </p>
    </motion.div>
  );
}

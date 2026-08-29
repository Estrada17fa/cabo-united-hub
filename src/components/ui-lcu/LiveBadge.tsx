import { motion } from "framer-motion";

interface LiveBadgeProps {
  /** Texto extra a la derecha, p.ej. el minuto del partido */
  clock?: string | null;
  label?: string;
  className?: string;
}

/** Badge "EN VIVO" con pulso en rosa (uso exclusivo del acento secundario). */
export function LiveBadge({ clock, label = "EN VIVO", className = "" }: LiveBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border border-pop/40 bg-pop/15 px-2.5 py-1 ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pop opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pop" />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pop">
        {label}
        {clock ? ` · ${clock}` : ""}
      </span>
    </motion.span>
  );
}

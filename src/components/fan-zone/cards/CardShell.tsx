import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  index?: number;
  className?: string;
  inactive?: boolean;
  onClick?: () => void;
  accent?: string;
}

export function CardShell({
  children,
  index = 0,
  className = "",
  inactive = false,
  onClick,
  accent,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: inactive ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={inactive ? undefined : { y: -2 }}
      onClick={inactive ? undefined : onClick}
      className={`group relative rounded-2xl border bg-card overflow-hidden p-5 md:p-5 flex flex-col transition-colors duration-200 ${
        inactive ? "cursor-not-allowed" : "cursor-pointer hover:border-white/15"
      } ${className}`}
      style={{
        borderColor: "hsl(0 0% 100% / 0.06)",
        borderTop: accent ? `1px solid ${accent}` : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

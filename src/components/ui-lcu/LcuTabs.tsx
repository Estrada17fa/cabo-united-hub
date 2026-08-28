import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface LcuTabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Punto rosa de aviso (p.ej. hay partido en vivo) */
  dot?: boolean;
}

interface LcuTabsProps {
  items: LcuTabItem[];
  value: string;
  onChange: (id: string) => void;
  /** pill = segmentado; underline = subnavegación */
  variant?: "pill" | "underline";
  layoutId: string;
  className?: string;
}

export function LcuTabs({
  items,
  value,
  onChange,
  variant = "pill",
  layoutId,
  className = "",
}: LcuTabsProps) {
  if (variant === "underline") {
    return (
      <div
        className={`-mx-1 flex gap-4 overflow-x-auto px-1 scrollbar-hide ${className}`}
        role="tablist"
      >
        {items.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={`relative shrink-0 whitespace-nowrap pb-2.5 text-sm font-semibold transition-colors ${
                active ? "text-foreground" : "text-label-fg hover:text-secondary-fg"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {t.icon && <t.icon className="h-4 w-4" />}
                {t.label}
                {t.dot && <span className="h-1.5 w-1.5 rounded-full bg-pop" />}
              </span>
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={`grid gap-1 rounded-full border border-white/[0.07] bg-surface-2 p-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`relative flex h-9 items-center justify-center gap-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
              active ? "text-primary-foreground" : "text-label-fg hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {t.icon && <t.icon className="h-3.5 w-3.5" />}
              {t.label}
              {t.dot && !active && <span className="h-1.5 w-1.5 rounded-full bg-pop" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

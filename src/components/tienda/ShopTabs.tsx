import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShopTabsProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  variant?: "segment" | "type";
  ariaLabel?: string;
}

export const ShopTabs = ({
  options,
  value,
  onChange,
  variant = "segment",
  ariaLabel = "Filtros de tienda",
}: ShopTabsProps) => {
  if (options.length === 0) return null;

  if (variant === "type") {
    return (
      <div
        className="flex gap-6 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const active = option.id === value;
          return (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "relative h-9 shrink-0 rounded-none px-0 pb-3 pt-2 text-[11px] font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground",
                active && "text-foreground",
              )}
            >
              {option.label}
              {active && (
                <motion.span
                  layoutId="shop-type-indicator"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  className="absolute inset-x-0 bottom-0 h-px bg-primary"
                />
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="flex min-w-max gap-1 rounded-xl border border-hairline bg-surface-1 p-1"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <Button
            key={opt.id}
            type="button"
            variant="ghost"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative h-8 shrink-0 rounded-lg px-3 text-[11px] font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 md:px-4",
              active && "text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="shop-segment-indicator"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                className="absolute inset-0 rounded-lg bg-surface-2"
              >
                <span className="absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-primary" />
              </motion.span>
            )}
            <span className="relative z-10">{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

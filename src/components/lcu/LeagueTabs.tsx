import { cn } from "@/lib/utils";

export interface LeagueTabItem {
  id: string;
  label: string;
}

/** Tabs de subrayado: activo blanco con línea cyan de 2px. */
export function LeagueTabs({
  items,
  value,
  onChange,
  className,
}: {
  items: LeagueTabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-stretch gap-5 overflow-x-auto border-b border-hairline scrollbar-hide",
        className
      )}
    >
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={cn(
              "relative shrink-0 pb-3 pt-1 text-sm transition-colors",
              active
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:text-secondary-fg"
            )}
          >
            {it.label}
            {active && (
              <span
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

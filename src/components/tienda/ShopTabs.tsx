interface ShopTabsProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  /** Pestañas grandes (nivel 1) vs. segmentos secundarios (niveles 2 y 3). */
  size?: "lg" | "sm";
}

/** Fila de pestañas/segmentos de la tienda. Scroll horizontal en móvil. */
export const ShopTabs = ({ options, value, onChange, size = "sm" }: ShopTabsProps) => {
  if (options.length === 0) return null;
  const isLg = size === "lg";
  return (
    <div
      className={`-mx-1 flex gap-1 overflow-x-auto px-1 scrollbar-hide ${
        isLg ? "border-b border-hairline" : ""
      }`}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`shrink-0 whitespace-nowrap font-bold transition-colors ${
              isLg
                ? `border-b-2 px-4 py-2.5 text-[14px] ${
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`
                : `rounded-lg px-3 py-1.5 text-[12px] ${
                    active
                      ? "bg-surface-2 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

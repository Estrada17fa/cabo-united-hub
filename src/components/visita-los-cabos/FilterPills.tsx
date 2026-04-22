import { Search } from "lucide-react";
import { CATEGORY_META, PlaceCategory } from "@/lib/visita-los-cabos-data";

export type FilterValue = PlaceCategory | "todos" | "patrocinadores";

const FILTERS: { value: FilterValue; label: string; emoji: string }[] = [
  { value: "todos", label: "Todos", emoji: "" },
  { value: "restaurantes", label: "Restaurantes", emoji: CATEGORY_META.restaurantes.emoji },
  { value: "bares", label: "Bares", emoji: CATEGORY_META.bares.emoji },
  { value: "tours", label: "Tours", emoji: CATEGORY_META.tours.emoji },
  { value: "tiendas", label: "Tiendas", emoji: CATEGORY_META.tiendas.emoji },
  { value: "hoteles", label: "Hoteles", emoji: CATEGORY_META.hoteles.emoji },
  { value: "patrocinadores", label: "Patrocinadores", emoji: "⭐" },
];

interface FilterPillsProps {
  active: FilterValue;
  onChange: (v: FilterValue) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export function FilterPills({ active, onChange, search, onSearchChange }: FilterPillsProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((f) => {
          const isActive = f.value === active;
          return (
            <button
              key={f.value}
              onClick={() => onChange(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "text-[hsl(0_0%_8%)]"
                  : "bg-card border border-border text-foreground hover:border-foreground/40"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: "#00FF87",
                      boxShadow: "0 4px 14px -4px #00FF8780",
                    }
                  : undefined
              }
            >
              {f.emoji && <span className="mr-1">{f.emoji}</span>}
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar lugar en Los Cabos..."
          className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>
    </div>
  );
}
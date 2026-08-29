import { Search } from "lucide-react";
import {
  LCU_CYAN,
  PlaceCategory,
  SPONSOR_GOLD,
} from "@/lib/visita-los-cabos-data";
import { usePlaceCategories } from "@/hooks/usePlaceCategories";
import { CategoryIcon } from "./CategoryIcon";

export type FilterValue = PlaceCategory | "todos" | "patrocinadores";


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
          const isSponsors = f.value === "patrocinadores";
          const activeColor = isSponsors ? SPONSOR_GOLD : LCU_CYAN;
          return (
            <button
              key={f.value}
              onClick={() => onChange(f.value)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "text-[hsl(0_0%_8%)]"
                  : "bg-card border border-border text-foreground hover:border-foreground/40"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: activeColor,
                      boxShadow: `0 4px 14px -4px ${activeColor}80`,
                    }
                  : undefined
              }
            >
              {f.icon && (
                <CategoryIcon
                  name={f.icon}
                  className="w-3.5 h-3.5"
                  style={
                    !isActive && isSponsors ? { color: SPONSOR_GOLD } : undefined
                  }
                />
              )}
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

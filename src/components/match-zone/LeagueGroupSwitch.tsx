import { motion } from "framer-motion";

interface Props {
  groups: string[];
  value: string;
  onChange: (g: string) => void;
  allLabel?: string;
  layoutId: string;
}

export function LeagueGroupSwitch({ groups, value, onChange, allLabel = "Todos", layoutId }: Props) {
  if (groups.length === 0) return null;
  const options = [{ id: "all", label: allLabel }, ...groups.map((g) => ({ id: g, label: g }))];

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`relative shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors border ${
              active ? "border-primary/60 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary/12"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

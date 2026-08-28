import { motion } from "framer-motion";
import { Radio, Trophy } from "lucide-react";

interface MatchTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MATCH_ZONE_TABS = [
  { id: "envivo", label: "En vivo", icon: Radio },
  { id: "liga", label: "Liga", icon: Trophy },
];

export function MatchTabs({ activeTab, onTabChange }: MatchTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MATCH_ZONE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative h-14 rounded-full flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wide transition-colors border ${
              isActive
                ? "border-primary/60 text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            style={
              isActive
                ? undefined
                : { backgroundColor: "rgba(255,255,255,0.04)" }
            }
          >
            {isActive && (
              <motion.span
                layoutId="match-zone-chip"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

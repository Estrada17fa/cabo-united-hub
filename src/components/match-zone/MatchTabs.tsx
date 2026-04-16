import { motion } from "framer-motion";

interface MatchTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "partidos", label: "Nuestros Partidos" },
  { id: "liga", label: "Liga Premier Serie A" },
];

export function MatchTabs({ activeTab, onTabChange }: MatchTabsProps) {
  return (
    <div className="flex gap-6 border-b border-border pb-0">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap"
          style={{ color: activeTab === tab.id ? "hsl(0 0% 100%)" : "hsl(0 0% 45%)" }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

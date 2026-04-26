import { motion } from "framer-motion";

export interface CategoryTab {
  id: string;
  label: string;
}

interface Props {
  tabs: CategoryTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function CategoryTabs({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="flex gap-6 border-b border-border pb-0 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap"
          style={{
            color: activeTab === tab.id ? "hsl(0 0% 100%)" : "hsl(0 0% 45%)",
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tienda-tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

import { Radio, Trophy } from "lucide-react";
import { LcuTabs } from "@/components/ui-lcu";

interface MatchTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Marca con punto rosa que hay partido en vivo */
  liveNow?: boolean;
}

export const MATCH_ZONE_TABS = [
  { id: "envivo", label: "En vivo", icon: Radio },
  { id: "liga", label: "Liga", icon: Trophy },
];

export function MatchTabs({ activeTab, onTabChange, liveNow }: MatchTabsProps) {
  return (
    <LcuTabs
      layoutId="match-zone-chip"
      value={activeTab}
      onChange={onTabChange}
      items={MATCH_ZONE_TABS.map((t) => ({
        ...t,
        dot: t.id === "envivo" && liveNow,
      }))}
    />
  );
}

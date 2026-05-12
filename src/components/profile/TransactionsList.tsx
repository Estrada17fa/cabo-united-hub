import { useTranslation } from "react-i18next";
import type { Transaction } from "@/hooks/useFanProfile";
import { Award, Coins, Gamepad2, Gift, MapPin, ShoppingBag, Sparkles, Zap } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bonus: Sparkles,
  mission: Award,
  checkin: MapPin,
  game: Gamepad2,
  redeem: Gift,
  purchase: ShoppingBag,
  adjust: Zap,
};

export function TransactionsList({ items }: { items: Transaction[] }) {
  const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">{t("profile.noTransactions")}</p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((tx) => {
        const Icon = ICONS[tx.type] ?? Coins;
        return (
          <li key={tx.id} className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-foreground/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {tx.description ?? tx.source ?? tx.type}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {new Date(tx.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right shrink-0 tabular-nums">
              {tx.xp_delta !== 0 && (
                <div className={`text-sm font-bold ${tx.xp_delta > 0 ? "text-brand-primary" : "text-destructive"}`}>
                  {tx.xp_delta > 0 ? "+" : ""}
                  {tx.xp_delta} XP
                </div>
              )}
              {tx.cc_delta !== 0 && (
                <div className={`text-[11px] font-semibold ${tx.cc_delta > 0 ? "text-brand-accent" : "text-destructive"}`}>
                  {tx.cc_delta > 0 ? "+" : ""}
                  {tx.cc_delta} CC
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
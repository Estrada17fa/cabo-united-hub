import { progressToNext } from "@/lib/levels";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LevelProgress({ xp }: { xp: number }) {
  const { t } = useTranslation();
  const { current, next, earned, span, pct, remaining } = progressToNext(xp);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-brand-accent" />
          <span className="text-sm font-extrabold text-brand-accent">{current.name}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
            {t("fanZone.level")} {current.level}
          </span>
        </div>
        {next && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {earned.toLocaleString()} / {span.toLocaleString()} XP
          </span>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "hsl(0 0% 100% / 0.06)" }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            borderRadius: "9999px",
            background: "hsl(var(--brand-primary))",
            boxShadow: "0 0 10px hsl(var(--brand-primary) / 0.45)",
          }}
        />
      </div>
      {next ? (
        <p className="text-[11px] text-muted-foreground">
          {t("profile.nextLevelIn", { xp: remaining.toLocaleString(), name: next.name })}
        </p>
      ) : (
        <p className="text-[11px] text-brand-accent font-semibold">Nivel máximo alcanzado.</p>
      )}
    </div>
  );
}
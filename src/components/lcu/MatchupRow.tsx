import { cn } from "@/lib/utils";
import type { Match } from "@/components/match-zone/types";
import { Crest } from "./Crest";

/** Fila de enfrentamiento: escudo · nombre / VS / nombre · escudo. */
export function MatchupRow({ match, center }: { match: Match; center?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <Side team={match.home_team} />
      <div className="min-w-[44px] text-center">
        {center ?? (
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            VS
          </span>
        )}
      </div>
      <Side team={match.away_team} align="right" />
    </div>
  );
}

function Side({
  team,
  align = "left",
}: {
  team?: Match["home_team"];
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <Crest team={team} size="lg" />
      <p
        className={cn(
          "min-w-0 text-[15px] font-semibold leading-tight",
          team?.is_ours ? "text-foreground" : "text-secondary-fg"
        )}
      >
        {team?.name ?? "Por definir"}
      </p>
    </div>
  );
}

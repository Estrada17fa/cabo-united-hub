import { useRecentResults } from "@/hooks/useMatches";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentResults() {
  const { data: matches, isLoading } = useRecentResults(5);

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border animate-pulse">
        <div className="h-40" />
      </Card>
    );
  }

  if (!matches?.length) {
    return (
      <Card className="p-6 bg-card border-border text-center">
        <p className="text-muted-foreground">No hay resultados recientes</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-semibold mb-4">Resultados Recientes</h3>
      <div className="space-y-3">
        {matches.map((m) => {
          const isWin = m.is_home_game
            ? m.home_score > m.away_score
            : m.away_score > m.home_score;
          const isDraw = m.home_score === m.away_score;

          return (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Badge
                variant="outline"
                className={
                  isWin
                    ? "bg-green-500/10 text-green-400 border-green-500/30 text-[10px]"
                    : isDraw
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px]"
                    : "bg-red-500/10 text-red-400 border-red-500/30 text-[10px]"
                }
              >
                {isWin ? "V" : isDraw ? "E" : "D"}
              </Badge>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium truncate max-w-[80px]">{m.home_team}</span>
                <span className="text-lg font-bold tabular-nums px-2">
                  {m.home_score} - {m.away_score}
                </span>
                <span className="text-sm font-medium truncate max-w-[80px] text-right">{m.away_team}</span>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                J{m.jornada || "—"}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

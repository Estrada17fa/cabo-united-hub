import { useMatches } from "@/hooks/useMatches";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";

export function MatchCalendar() {
  const { data: matches, isLoading } = useMatches();

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border animate-pulse">
        <div className="h-60" />
      </Card>
    );
  }

  if (!matches?.length) {
    return (
      <Card className="p-6 bg-card border-border text-center">
        <p className="text-muted-foreground">No hay partidos en el calendario</p>
      </Card>
    );
  }

  // Group by jornada
  const byJornada = matches.reduce((acc, m) => {
    const key = m.jornada ?? 0;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<number, typeof matches>);

  const sortedJornadas = Object.keys(byJornada)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-semibold mb-4">Calendario</h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {sortedJornadas.map((jornada) => (
          <div key={jornada}>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Jornada {jornada || "Sin asignar"}
            </div>
            <div className="space-y-2">
              {byJornada[jornada].map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{m.home_team}</span>
                    {m.status === "finished" ? (
                      <span className="text-sm font-bold tabular-nums">
                        {m.home_score} - {m.away_score}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {m.status === "live" ? "🔴 EN VIVO" : "Programado"}
                      </Badge>
                    )}
                    <span className="text-sm font-medium text-right">{m.away_team}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(m.match_date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </span>
                    {m.match_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {m.match_time.slice(0, 5)}
                      </span>
                    )}
                    {m.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {m.venue}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

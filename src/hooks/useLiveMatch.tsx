import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MatchPhase =
  | "scheduled"
  | "first_half"
  | "halftime"
  | "second_half"
  | "finished";

export const PHASE_LABEL: Record<MatchPhase, string> = {
  scheduled: "Por comenzar",
  first_half: "1ª Parte",
  halftime: "Medio Tiempo",
  second_half: "2ª Parte",
  finished: "Finalizado",
};

/** Umbral (min reales) para avisar en el panel que un partido quedó abierto. */
export const STALE_PHASE_MINUTES = 150;

function elapsedMinutes(from: string | null, now: number) {
  if (!from) return 0;
  const start = new Date(from).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now - start) / 60_000));
}

/**
 * Formatea el minuto de juego según la fase.
 * - first_half: 1..45, luego 45+N (topado por stoppage_minutes si existe)
 * - halftime: sin número
 * - second_half: 45 + minutos, luego 90+N
 * - scheduled / finished: sin reloj
 */
export function formatMatchClock(
  match: Pick<
    Tables<"matches">,
    "phase" | "first_half_started_at" | "second_half_started_at" | "stoppage_minutes"
  > | null,
  now: number = Date.now(),
): string | null {
  if (!match) return null;
  const phase = (match.phase ?? "scheduled") as MatchPhase;
  const stoppage = match.stoppage_minutes ?? 0;

  if (phase === "halftime") return "Medio Tiempo";
  if (phase === "first_half") {
    const m = Math.max(1, elapsedMinutes(match.first_half_started_at, now));
    if (m <= 45) return `${m}'`;
    const extra = Math.min(m - 45, stoppage > 0 ? stoppage : m - 45);
    return `45+${Math.max(1, extra)}'`;
  }
  if (phase === "second_half") {
    const m = Math.max(1, elapsedMinutes(match.second_half_started_at, now));
    const total = 45 + m;
    if (total <= 90) return `${total}'`;
    const extra = Math.min(total - 90, stoppage > 0 ? stoppage : total - 90);
    return `90+${Math.max(1, extra)}'`;
  }
  return null;
}

export function useLiveMatch(match: Tables<"matches"> | null) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => Date.now());

  // Tick cada 30s solo para refrescar el reloj mostrado
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const phase = ((match?.phase ?? "scheduled") as MatchPhase);

  const isLive =
    !!match && (phase === "first_half" || phase === "halftime" || phase === "second_half");
  const isFinished = !!match && phase === "finished";

  const clock = formatMatchClock(match, now);

  const currentMinute = (() => {
    if (!match) return 0;
    if (phase === "first_half") return Math.max(1, elapsedMinutes(match.first_half_started_at, now));
    if (phase === "second_half")
      return 45 + Math.max(1, elapsedMinutes(match.second_half_started_at, now));
    return 0;
  })();

  const { data: events = [] } = useQuery({
    queryKey: ["match_events", match?.id],
    enabled: !!match?.id && (isLive || isFinished),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_events")
        .select("*")
        .eq("match_id", match!.id)
        .order("minute", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Realtime mientras el partido esté en curso
  useEffect(() => {
    if (!match?.id || !isLive) return;

    const channel = supabase
      .channel(`live-match-${match.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${match.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${match.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["match_events", match.id] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id, isLive, queryClient]);

  return { phase, isLive, isFinished, clock, currentMinute, events };
}

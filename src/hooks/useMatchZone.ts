import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMatches } from "./useLeague";
import { isLivePhase, type Match, type MatchEvent } from "@/components/match-zone/types";

export type MatchZoneState = "live" | "pre" | "post" | "empty";

/**
 * Decide el partido protagonista de la página:
 * en vivo > destacado por admin > próximo > último finalizado (48 h).
 */
export function useFeaturedMatch() {
  const { data: matches = [], isLoading } = useMatches();

  const { match, state } = useMemo(() => {
    const now = Date.now();
    const live = matches.find((m) => isLivePhase(m.phase));
    if (live) return { match: live, state: "live" as MatchZoneState };

    const featured = matches.find((m) => m.is_featured && m.phase === "scheduled");
    const next = matches
      .filter((m) => m.phase === "scheduled" && new Date(m.kickoff_at).getTime() > now)
      .sort((a, b) => +new Date(a.kickoff_at) - +new Date(b.kickoff_at))[0];

    const recent = matches
      .filter(
        (m) =>
          m.phase === "finished" &&
          now - new Date(m.kickoff_at).getTime() < 48 * 3600 * 1000
      )
      .sort((a, b) => +new Date(b.kickoff_at) - +new Date(a.kickoff_at))[0];

    if (recent && (!next || now - new Date(recent.kickoff_at).getTime() < 12 * 3600 * 1000)) {
      return { match: recent, state: "post" as MatchZoneState };
    }
    const pick = featured ?? next;
    if (pick) return { match: pick, state: "pre" as MatchZoneState };
    if (recent) return { match: recent, state: "post" as MatchZoneState };
    return { match: null as Match | null, state: "empty" as MatchZoneState };
  }, [matches]);

  return { match, state, isLoading, matches };
}

export function useMatchEvents(matchId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["lcu-match-events", matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_events")
        .select("*")
        .eq("match_id", matchId!)
        .order("minute", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MatchEvent[];
    },
  });

  useEffect(() => {
    if (!matchId) return;
    const channel = supabase
      .channel(`lcu-events-${matchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${matchId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["lcu-match-events", matchId] });
          qc.invalidateQueries({ queryKey: ["lcu-matches"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, qc]);

  return query;
}

/** Tic de un segundo para el reloj y la cuenta regresiva. */
export function useTicker(active = true, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

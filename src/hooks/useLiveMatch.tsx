import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000; // 2h
const FINISHED_VISIBILITY_MS = 24 * 60 * 60 * 1000; // 24h after end

export function useLiveMatch(match: Tables<"matches"> | null) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => Date.now());

  // Tick every 30s to recompute live status / minute
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const matchStart = match
    ? new Date(`${match.match_date}T${match.match_time || "19:00:00"}`).getTime()
    : null;

  const matchEnd = matchStart !== null ? matchStart + MATCH_DURATION_MS : null;

  const isLive =
    !!match &&
    match.status !== "finished" &&
    (match.status === "live" ||
      (matchStart !== null && matchEnd !== null && now >= matchStart && now <= matchEnd));

  const isFinished =
    !!match &&
    (match.status === "finished" ||
      (matchEnd !== null && now > matchEnd && now <= matchEnd + FINISHED_VISIBILITY_MS));

  const currentMinute =
    isLive && matchStart
      ? Math.max(1, Math.min(120, Math.floor((now - matchStart) / 60_000)))
      : 0;

  // Fetch events for this match (live or recently finished)
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

  // Realtime subscriptions (only while live)
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

  return { isLive, isFinished, currentMinute, events };
}

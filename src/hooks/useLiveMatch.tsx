import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000; // 2h

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

  const isLive =
    !!match &&
    (match.status === "live" ||
      (matchStart !== null && now >= matchStart && now <= matchStart + MATCH_DURATION_MS));

  const currentMinute =
    isLive && matchStart
      ? Math.max(1, Math.min(120, Math.floor((now - matchStart) / 60_000)))
      : 0;

  // Fetch events for this match
  const { data: events = [] } = useQuery({
    queryKey: ["match_events", match?.id],
    enabled: !!match?.id && isLive,
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

  // Realtime subscriptions
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

  return { isLive, currentMinute, events };
}

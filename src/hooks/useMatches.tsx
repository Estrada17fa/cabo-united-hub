import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Match {
  id: string;
  season: string;
  jornada: number | null;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  match_date: string;
  match_time: string | null;
  venue: string | null;
  status: "scheduled" | "live" | "finished";
  is_home_game: boolean;
  source: "manual" | "scraped";
  created_at: string;
  updated_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  minute: number;
  event_type: "goal" | "yellow_card" | "red_card" | "substitution" | "penalty" | "own_goal";
  player_name: string | null;
  team: string | null;
  description: string | null;
  created_at: string;
}

export function useMatches(season?: string) {
  return useQuery({
    queryKey: ["matches", season],
    queryFn: async () => {
      let query = supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });
      if (season) query = query.eq("season", season);
      const { data, error } = await query;
      if (error) throw error;
      return data as Match[];
    },
  });
}

export function useNextMatch() {
  return useQuery({
    queryKey: ["next-match"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .gte("match_date", today)
        .eq("status", "scheduled")
        .order("match_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Match | null;
    },
  });
}

export function useRecentResults(limit = 5) {
  return useQuery({
    queryKey: ["recent-results", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "finished")
        .order("match_date", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Match[];
    },
  });
}

export function useMatchEvents(matchId: string) {
  return useQuery({
    queryKey: ["match-events", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_events")
        .select("*")
        .eq("match_id", matchId)
        .order("minute", { ascending: true });
      if (error) throw error;
      return data as MatchEvent[];
    },
    enabled: !!matchId,
  });
}

export async function upsertMatch(match: Partial<Match>) {
  const { data, error } = await supabase.functions.invoke("manage-matches", {
    body: { action: "upsert_match", data: match },
  });
  if (error) throw error;
  return data;
}

export async function deleteMatch(id: string) {
  const { data, error } = await supabase.functions.invoke("manage-matches", {
    body: { action: "delete_match", data: { id } },
  });
  if (error) throw error;
  return data;
}

export async function addMatchEvent(event: Omit<MatchEvent, "id" | "created_at">) {
  const { data, error } = await supabase.functions.invoke("manage-matches", {
    body: { action: "add_event", data: event },
  });
  if (error) throw error;
  return data;
}

export async function deleteMatchEvent(id: string) {
  const { data, error } = await supabase.functions.invoke("manage-matches", {
    body: { action: "delete_event", data: { id } },
  });
  if (error) throw error;
  return data;
}

export async function scrapeResults(query?: string) {
  const { data, error } = await supabase.functions.invoke("scrape-match-results", {
    body: { query, teamName: "Los Cabos United" },
  });
  if (error) throw error;
  return data;
}

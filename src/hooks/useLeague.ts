import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Match, Scorer, Season, Standing, Team } from "@/components/match-zone/types";

export const SEASON = "2026";

const MATCH_SELECT =
  "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)";

export function useTeams(season = SEASON) {
  return useQuery({
    queryKey: ["lcu-teams", season],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("season", season)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Team[];
    },
  });
}

export function useMatches(season = SEASON) {
  return useQuery({
    queryKey: ["lcu-matches", season],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(MATCH_SELECT)
        .eq("season", season)
        .order("kickoff_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Match[];
    },
  });
}

export function useStandings(season = SEASON) {
  return useQuery({
    queryKey: ["lcu-standings", season],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_standings")
        .select("*, team:teams(*)")
        .eq("season", season)
        .order("points", { ascending: false })
        .order("goal_diff", { ascending: false })
        .order("goals_for", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Standing[];
    },
  });
}

export function useScorers(season = SEASON) {
  return useQuery({
    queryKey: ["lcu-scorers", season],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_scorers")
        .select("*, team:teams(*), player:players(id, name, photo_url, jersey_number)")
        .eq("season", season)
        .order("goals", { ascending: false })
        .order("assists", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Scorer[];
    },
  });
}

/** Torneos/temporadas reales capturados en el panel de admin. */
export function useSeasons() {
  return useQuery({
    queryKey: ["lcu-seasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select("id, name, season_key, start_date, end_date, status")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Season[];
    },
  });
}


/** Invalida las consultas de liga cuando cambian los partidos (realtime). */
export function useLeagueRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("lcu-league")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
        qc.invalidateQueries({ queryKey: ["lcu-matches"] });
        qc.invalidateQueries({ queryKey: ["lcu-standings"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "match_events" }, () => {
        qc.invalidateQueries({ queryKey: ["lcu-match-events"] });
        qc.invalidateQueries({ queryKey: ["lcu-matches"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

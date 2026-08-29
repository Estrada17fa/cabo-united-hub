import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Match, Scorer, Season, Standing, Team } from "@/components/match-zone/types";

/** Respaldo si aún no hay torneo marcado como activo en el panel. */
export const SEASON = "2026";

const MATCH_SELECT =
  "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)";

const SEASON_SELECT =
  "id, name, season_key, start_date, end_date, status, is_active, logo_url, points_rules, qualifiers_count, groups";

/** Torneo con los campos extra del panel de admin. */
export type SeasonRow = Season & {
  is_active: boolean;
  logo_url: string | null;
  points_rules: Record<string, unknown>;
  qualifiers_count: number;
  groups: string[];
};

/** Torneo activo: única fuente de verdad de la temporada que lee el sitio. */
export function useActiveSeason() {
  return useQuery({
    queryKey: ["lcu-active-season"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select(SEASON_SELECT)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as (Season & {
        is_active: boolean;
        logo_url: string | null;
        points_rules: Record<string, unknown>;
        qualifiers_count: number;
      }) | null;
    },
  });
}

/** Clave de temporada vigente (torneo activo, con respaldo). */
export function useSeasonKey() {
  const { data } = useActiveSeason();
  return data?.season_key ?? SEASON;
}

export function useTeams(season?: string) {
  const active = useSeasonKey();
  const key = season ?? active;
  return useQuery({
    queryKey: ["lcu-teams", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("season", key)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Team[];
    },
  });
}

export function useMatches(season?: string) {
  const active = useSeasonKey();
  const key = season ?? active;
  return useQuery({
    queryKey: ["lcu-matches", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(MATCH_SELECT)
        .eq("season", key)
        .order("kickoff_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Match[];
    },
  });
}

export function useStandings(season?: string) {
  const active = useSeasonKey();
  const key = season ?? active;
  return useQuery({
    queryKey: ["lcu-standings", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_standings")
        .select("*, team:teams(*)")
        .eq("season", key)
        .order("points", { ascending: false })
        .order("goal_diff", { ascending: false })
        .order("goals_for", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Standing[];
    },
  });
}

export function useScorers(season?: string) {
  const active = useSeasonKey();
  const key = season ?? active;
  return useQuery({
    queryKey: ["lcu-scorers", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_scorers")
        .select("*, team:teams(*), player:players(id, name, photo_url, jersey_number)")
        .eq("season", key)
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
        .select(SEASON_SELECT)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (Season & {
        is_active: boolean;
        logo_url: string | null;
        points_rules: Record<string, unknown>;
        qualifiers_count: number;
      })[];
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

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Match, Scorer, Season, Standing, Team } from "@/components/match-zone/types";

/** Respaldo si aún no hay torneo marcado como activo en el panel. */
export const SEASON = "2026";

/** Minutos de frescura por tipo de dato (stale-while-revalidate). */
const EDITORIAL_STALE = 5 * 60 * 1000;
const LEAGUE_STALE = 60 * 1000;

const TEAM_COLS =
  "id, name, short_name, logo_url, group_name, city, venue, is_ours, season, active";

const MATCH_COLS =
  "id, season, matchday, group_name, stage, home_team_id, away_team_id, kickoff_at, venue, phase, " +
  "first_half_started_at, second_half_started_at, stoppage_minutes, home_score, away_score, " +
  "manual_score, home_pens, away_pens, home_points, away_points, stream_url, tickets_url, " +
  "highlights_url, is_featured, notes";

const MATCH_SELECT =
  `${MATCH_COLS}, home_team:teams!matches_home_team_id_fkey(${TEAM_COLS}), away_team:teams!matches_away_team_id_fkey(${TEAM_COLS})`;

const STANDING_SELECT =
  `id, season, group_name, team_id, played, won, drawn, lost, goals_for, goals_against, goal_diff, ` +
  `points, manual_adjustment, adjustment_note, form, team:teams(${TEAM_COLS})`;

const SCORER_SELECT =
  `id, season, player_name, team_id, player_id, goals, assists, matches_played, ` +
  `team:teams(${TEAM_COLS}), player:players(id, name, photo_url, jersey_number)`;

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
    staleTime: EDITORIAL_STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select(SEASON_SELECT)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as SeasonRow | null;
    },
  });
}

/** Clave de temporada vigente (torneo activo, con respaldo). */
export function useSeasonKey() {
  const { data } = useActiveSeason();
  return data?.season_key ?? SEASON;
}

/** Grupos configurados en el torneo activo (vacío = tabla única). */
export function useSeasonGroups() {
  const { data } = useActiveSeason();
  return (data?.groups ?? []).filter(Boolean);
}

/** Clasificados configurados en el torneo activo. */
export function useQualifiersCount() {
  const { data } = useActiveSeason();
  return data?.qualifiers_count ?? 4;
}

/**
 * Clave de temporada ya resuelta, o null mientras el torneo activo no responde.
 * Se usa para filtrar en el cliente y NO encadenar las consultas de liga:
 * partidos, posiciones y goleo salen en paralelo con el torneo activo.
 */
function useResolvedSeasonKey(): string | null {
  const { data } = useActiveSeason();
  return data?.season_key ?? null;
}

export function useTeams(season?: string) {
  const resolved = useResolvedSeasonKey();
  const query = useQuery({
    queryKey: season ? ["lcu-teams", season] : ["lcu-teams", "all"],
    staleTime: EDITORIAL_STALE,
    queryFn: async () => {
      let q = supabase.from("teams").select(TEAM_COLS).order("name");
      if (season) q = q.eq("season", season);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Team[];
    },
  });

  const data = useMemo(() => {
    const rows = query.data ?? [];
    if (season) return rows;
    return resolved ? rows.filter((t) => t.season === resolved) : rows;
  }, [query.data, season, resolved]);

  return { ...query, data };
}

export function useMatches(season?: string) {
  const resolved = useResolvedSeasonKey();
  const query = useQuery({
    queryKey: season ? ["lcu-matches", season] : ["lcu-matches", "all"],
    staleTime: LEAGUE_STALE,
    queryFn: async () => {
      let q = supabase
        .from("matches")
        .select(MATCH_SELECT)
        .order("kickoff_at", { ascending: true });
      if (season) q = q.eq("season", season);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Match[];
    },
  });

  const data = useMemo(() => {
    const rows = query.data ?? [];
    if (season) return rows;
    return resolved ? rows.filter((m) => m.season === resolved) : rows;
  }, [query.data, season, resolved]);

  return { ...query, data };
}

export function useStandings(season?: string) {
  const resolved = useResolvedSeasonKey();
  const query = useQuery({
    queryKey: season ? ["lcu-standings", season] : ["lcu-standings", "all"],
    staleTime: LEAGUE_STALE,
    queryFn: async () => {
      let q = supabase
        .from("league_standings")
        .select(STANDING_SELECT)
        .order("points", { ascending: false })
        .order("goal_diff", { ascending: false })
        .order("goals_for", { ascending: false });
      if (season) q = q.eq("season", season);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Standing[];
    },
  });

  const data = useMemo(() => {
    const rows = query.data ?? [];
    if (season) return rows;
    return resolved ? rows.filter((s) => s.season === resolved) : rows;
  }, [query.data, season, resolved]);

  return { ...query, data };
}

export function useScorers(season?: string) {
  const resolved = useResolvedSeasonKey();
  const query = useQuery({
    queryKey: season ? ["lcu-scorers", season] : ["lcu-scorers", "all"],
    staleTime: LEAGUE_STALE,
    queryFn: async () => {
      let q = supabase
        .from("top_scorers")
        .select(SCORER_SELECT)
        .order("goals", { ascending: false })
        .order("assists", { ascending: false });
      if (season) q = q.eq("season", season);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Scorer[];
    },
  });

  const data = useMemo(() => {
    const rows = query.data ?? [];
    if (season) return rows;
    return resolved ? rows.filter((s) => s.season === resolved) : rows;
  }, [query.data, season, resolved]);

  return { ...query, data };
}

/** Torneos/temporadas reales capturados en el panel de admin. */
export function useSeasons() {
  return useQuery({
    queryKey: ["lcu-seasons"],
    staleTime: EDITORIAL_STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select(SEASON_SELECT)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SeasonRow[];
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

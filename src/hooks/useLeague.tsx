import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type LeagueMatch = Tables<"matches">;
export type LeagueTeam = Tables<"teams">;
export type LeagueStanding = Tables<"league_standings">;
export type LeagueScorer = Tables<"top_scorers">;

export const GENERAL_GROUP = "general";

export function isFinished(m: LeagueMatch) {
  return m.phase === "finished" || m.status === "finished";
}

export function matchDateTime(m: LeagueMatch) {
  return new Date(`${m.match_date}T${m.match_time || "23:59:59"}`);
}

/** Etiqueta corta del reglamento aplicado a un partido terminado */
export function pointsLabel(m: LeagueMatch, side: "home" | "away") {
  const pts = side === "home" ? m.home_points : m.away_points;
  return pts ? `+${pts}` : null;
}

export function useLeagueTeams() {
  return useQuery({
    queryKey: ["league", "teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as LeagueTeam[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useLeagueMatches() {
  return useQuery({
    queryKey: ["league", "matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });
      if (error) throw error;
      return data as LeagueMatch[];
    },
  });
}

export function useLeagueStandings() {
  return useQuery({
    queryKey: ["league", "standings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_standings")
        .select("*")
        .order("pos", { ascending: true });
      if (error) throw error;
      return data as LeagueStanding[];
    },
  });
}

export function useLeagueScorers() {
  return useQuery({
    queryKey: ["league", "scorers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_scorers")
        .select("*")
        .order("goals", { ascending: false });
      if (error) throw error;
      return data as LeagueScorer[];
    },
  });
}

/** Nombre del equipo propio (marcado en admin) con fallback al histórico */
export function useOurTeamName() {
  const { data: teams = [] } = useLeagueTeams();
  return useMemo(
    () => teams.find((t) => t.is_ours)?.name ?? "Los Cabos United",
    [teams],
  );
}

export function useTeamLogoMap() {
  const { data: teams = [] } = useLeagueTeams();
  return useMemo(() => {
    const map: Record<string, string> = {};
    teams.forEach((t) => {
      if (t.logo_url) map[t.name] = t.logo_url;
    });
    return map;
  }, [teams]);
}

/** Grupos disponibles en la temporada; vacío = tabla única */
export function useLeagueGroups() {
  const { data: standings = [] } = useLeagueStandings();
  const { data: teams = [] } = useLeagueTeams();
  return useMemo(() => {
    const set = new Set<string>();
    standings.forEach((s) => s.group_name && set.add(s.group_name));
    teams.forEach((t) => t.group_name && set.add(t.group_name));
    return Array.from(set).sort();
  }, [standings, teams]);
}

/** Racha (últimos 5 resultados, más reciente primero) por equipo */
export function useTeamStreaks() {
  const { data: matches = [] } = useLeagueMatches();
  return useMemo(() => {
    const map: Record<string, ("W" | "D" | "L")[]> = {};
    const finished = matches
      .filter(isFinished)
      .sort((a, b) => b.match_date.localeCompare(a.match_date));
    finished.forEach((m) => {
      const h = m.home_score ?? 0;
      const a = m.away_score ?? 0;
      const push = (team: string, res: "W" | "D" | "L") => {
        if (!map[team]) map[team] = [];
        if (map[team].length < 5) map[team].push(res);
      };
      push(m.home_team, h > a ? "W" : h === a ? "D" : "L");
      push(m.away_team, a > h ? "W" : h === a ? "D" : "L");
    });
    return map;
  }, [matches]);
}

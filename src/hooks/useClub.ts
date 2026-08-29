import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMatches, useStandings } from "@/hooks/useLeague";

/* ------------------------------ Resumen de temporada ------------------------------ */

export type FormResult = "W" | "D" | "L";

export interface SeasonSummary {
  position: number;
  points: number;
  played: number;
  goalDiff: number;
  groupName: string | null;
  form: FormResult[];
  teamName: string;
}

/**
 * Resumen real de temporada: lee la tabla de posiciones del torneo activo
 * (misma fuente que el admin de Torneo) y los partidos finalizados de LCU.
 */
export function useSeasonSummary() {
  const { data: standings = [], isLoading: loadingStandings } = useStandings();
  const { data: matches = [], isLoading: loadingMatches } = useMatches();

  const summary = useMemo<SeasonSummary | null>(() => {
    const ours = standings.find((s) => s.team?.is_ours);
    if (!ours) return null;

    const group = ours.group_name ?? null;
    const sameGroup = standings.filter((s) => (s.group_name ?? null) === group);
    const position = sameGroup.findIndex((s) => s.id === ours.id) + 1;

    const teamId = ours.team_id;
    const form = matches
      .filter(
        (m) =>
          m.phase === "finished" &&
          (m.home_team_id === teamId || m.away_team_id === teamId)
      )
      .sort(
        (a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime()
      )
      .slice(0, 5)
      .reverse()
      .map<FormResult>((m) => {
        const home = m.home_team_id === teamId;
        const mine = home ? m.home_score : m.away_score;
        const theirs = home ? m.away_score : m.home_score;
        if (mine > theirs) return "W";
        if (mine < theirs) return "L";
        return "D";
      });

    return {
      position: position > 0 ? position : 0,
      points: ours.points,
      played: ours.played,
      goalDiff: ours.goal_diff,
      groupName: group,
      form,
      teamName: ours.team?.name ?? "Los Cabos United",
    };
  }, [standings, matches]);

  return { summary, loading: loadingStandings || loadingMatches };
}

/* ---------------------------------- Plantel ---------------------------------- */

export interface ClubPlayer {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
  photo_url: string | null;
  short_bio: string | null;
}

export function useClubPlayers() {
  return useQuery({
    queryKey: ["lcu-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, jersey_number, position, photo_url, short_bio")
        .eq("active", true)
        .order("jersey_number", { nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as ClubPlayer[];
    },
  });
}

/* ---------------------------------- Noticias ---------------------------------- */

export interface ClubNews {
  id: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
}

export function useClubNews(limit = 9) {
  return useQuery({
    queryKey: ["lcu-news", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title, category, excerpt, content, image_url, author, published_at, created_at"
        )
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ClubNews[];
    },
  });
}

/* ----------------------------------- Afición ----------------------------------- */

export interface FanPost {
  id: string;
  author: string;
  handle: string | null;
  network: string;
  text: string;
  image_url: string | null;
  link_url: string | null;
  created_at: string;
}

export function useFanPosts() {
  return useQuery({
    queryKey: ["lcu-fan-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fan_posts")
        .select("id, author, handle, network, text, image_url, link_url, created_at")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FanPost[];
    },
  });
}

/* -------------------------------- Equipo juvenil -------------------------------- */

export interface YouthTeam {
  id: string;
  name: string;
  tournament: string;
  description: string | null;
  image_url: string | null;
}

export function useYouthTeam() {
  return useQuery({
    queryKey: ["lcu-youth-team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youth_team")
        .select("id, name, tournament, description, image_url")
        .eq("visible", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as YouthTeam | null;
    },
  });
}

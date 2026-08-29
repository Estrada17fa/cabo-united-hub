export type MatchPhase =
  | "scheduled"
  | "first_half"
  | "halftime"
  | "second_half"
  | "finished"
  | "postponed"
  | "canceled";

export type MatchEventType =
  | "goal"
  | "own_goal"
  | "penalty_goal"
  | "penalty_miss"
  | "yellow"
  | "red"
  | "substitution"
  | "note"
  | "var";

export interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  group_name: string | null;
  city: string | null;
  venue?: string | null;
  is_ours: boolean;
  season: string;
  active: boolean;
}

export interface Match {
  id: string;
  season: string;
  matchday: number | null;
  group_name: string | null;
  stage: "regular" | "final";
  home_team_id: string;
  away_team_id: string;
  kickoff_at: string;
  venue: string | null;
  phase: MatchPhase;
  first_half_started_at: string | null;
  second_half_started_at: string | null;
  stoppage_minutes: number;
  home_score: number;
  away_score: number;
  manual_score: boolean;
  home_pens: number | null;
  away_pens: number | null;
  home_points: number;
  away_points: number;
  stream_url: string | null;
  tickets_url: string | null;
  highlights_url: string | null;
  is_featured: boolean;
  notes: string | null;
  home_team?: Team | null;
  away_team?: Team | null;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  minute: number;
  minute_extra: number | null;
  type: MatchEventType;
  team_id: string | null;
  player_id: string | null;
  player_name: string | null;
  description: string | null;
  created_at: string;
}

export interface Standing {
  id: string;
  season: string;
  group_name: string | null;
  team_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
  manual_adjustment: number;
  adjustment_note: string | null;
  form: string | null;
  team?: Team | null;
}

export interface Scorer {
  id: string;
  season: string;
  player_name: string;
  team_id: string | null;
  player_id?: string | null;
  goals: number;
  assists: number;
  matches_played: number;
  team?: Team | null;
  player?: { id: string; name: string; photo_url: string | null; jersey_number: number | null } | null;
}

export interface Season {
  id: string;
  name: string;
  season_key: string | null;
  start_date: string;
  end_date: string;
  status: string;
}


export const LIVE_PHASES: MatchPhase[] = ["first_half", "halftime", "second_half"];

export const isLivePhase = (p: MatchPhase) => LIVE_PHASES.includes(p);

export const PHASE_LABEL: Record<MatchPhase, string> = {
  scheduled: "Programado",
  first_half: "1er tiempo",
  halftime: "Medio tiempo",
  second_half: "2do tiempo",
  finished: "Finalizado",
  postponed: "Pospuesto",
  canceled: "Cancelado",
};

export const EVENT_LABEL: Record<MatchEventType, string> = {
  goal: "Gol",
  own_goal: "Autogol",
  penalty_goal: "Gol de penal",
  penalty_miss: "Penal fallado",
  yellow: "Tarjeta amarilla",
  red: "Tarjeta roja",
  substitution: "Cambio",
  note: "Nota",
  var: "Revisión VAR",
};

export const GOAL_EVENTS: MatchEventType[] = ["goal", "own_goal", "penalty_goal"];

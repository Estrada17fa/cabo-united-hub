import { NextMatchCard } from "@/components/match-zone/NextMatchCard";
import { StandingsTable } from "@/components/match-zone/StandingsTable";
import type { Match, Standing, Team } from "@/components/match-zone/types";

const team = (name: string, ours = false): Team => ({
  id: name,
  name,
  short_name: name,
  logo_url: null,
  group_name: null,
  city: null,
  is_ours: ours,
  season: "2026",
  active: true,
});

const match = {
  id: "m1",
  season: "2026",
  matchday: 12,
  group_name: null,
  stage: "regular",
  home_team_id: "a",
  away_team_id: "b",
  kickoff_at: new Date(Date.now() + 1000 * 60 * 60 * 62).toISOString(),
  venue: "Estadio Don Koll",
  phase: "scheduled",
  first_half_started_at: null,
  second_half_started_at: null,
  stoppage_minutes: 0,
  home_score: 0,
  away_score: 0,
  manual_score: false,
  home_pens: null,
  away_pens: null,
  home_points: 0,
  away_points: 0,
  stream_url: null,
  tickets_url: "https://example.com",
  highlights_url: null,
  is_featured: true,
  notes: null,
  home_team: team("Los Cabos United", true),
  away_team: team("Apodaca FC"),
} as Match;

const rows: Standing[] = [
  ["Tepic", 11, 14, 26, false],
  ["Los Cabos United", 11, 8, 24, true],
  ["Mazatlán", 11, 6, 22, false],
  ["Culiacán", 11, 3, 19, false],
  ["La Paz", 11, -1, 15, false],
].map(([n, pj, dif, pts, ours], i) => ({
  id: String(i),
  season: "2026",
  group_name: null,
  team_id: String(i),
  played: pj as number,
  won: 0,
  drawn: 0,
  lost: 0,
  goals_for: 0,
  goals_against: 0,
  goal_diff: dif as number,
  points: pts as number,
  manual_adjustment: 0,
  adjustment_note: null,
  form: null,
  team: team(n as string, ours as boolean),
}));

export default function DemoMZ() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <NextMatchCard match={match} />
      <StandingsTable standings={rows} />
    </div>
  );
}

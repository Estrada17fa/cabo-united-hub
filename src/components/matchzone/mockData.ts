// ── Mock Data for Match Zone ──

export interface Team {
  name: string;
  shortName: string;
  initials: string;
  color: string;
}

export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  x: number; // percentage on pitch
  y: number; // percentage on pitch
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchEvent {
  minute: number;
  type: "goal";
  team: "home" | "away";
  player: string;
  assist?: string;
}

export interface StandingRow {
  pos: number;
  team: string;
  initials: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  isLCU?: boolean;
}

export interface TopScorer {
  name: string;
  team: string;
  goals: number;
}

export const LCU: Team = {
  name: "Los Cabos United",
  shortName: "LCU",
  initials: "LCU",
  color: "hsl(189 100% 38%)",
};

export const RIVAL: Team = {
  name: "Dorados de Sinaloa",
  shortName: "Dorados",
  initials: "DOR",
  color: "hsl(45 100% 50%)",
};

// Next match date — set ~3 days in the future for demo
const now = new Date();
export const NEXT_MATCH_DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 20, 0, 0);

export const MATCH_VENUE = {
  stadium: "Estadio Don Koll",
  address: "San José del Cabo, B.C.S., México",
  matchday: "Jornada 8",
};

// Head to Head
export const H2H = {
  lcuWins: 3,
  draws: 2,
  rivalWins: 1,
  lastEncounters: [
    { home: "LCU", away: "DOR", homeScore: 2, awayScore: 1 },
    { home: "DOR", away: "LCU", homeScore: 0, awayScore: 0 },
    { home: "LCU", away: "DOR", homeScore: 3, awayScore: 2 },
    { home: "DOR", away: "LCU", homeScore: 1, awayScore: 1 },
    { home: "LCU", away: "DOR", homeScore: 1, awayScore: 0 },
  ],
  lcuForm: ["W", "D", "W", "W", "L"] as ("W" | "D" | "L")[],
  rivalForm: ["L", "W", "D", "L", "W"] as ("W" | "D" | "L")[],
  lcuTablePos: 3,
  rivalTablePos: 7,
  stats: [
    { label: "Goles", home: 14, away: 9 },
    { label: "Posesión", home: 58, away: 47 },
    { label: "Tiros a gol", home: 42, away: 31 },
  ],
};

// Recent & Upcoming
export const RECENT_RESULTS = [
  { rival: "Atlético Morelia", riIn: "AM", lcuScore: 3, rivalScore: 1, result: "W" as const },
  { rival: "Inter Playa", riIn: "IP", lcuScore: 1, rivalScore: 1, result: "D" as const },
  { rival: "FC Juárez II", riIn: "JZ", lcuScore: 0, rivalScore: 2, result: "L" as const },
];

export const UPCOMING_MATCHES = [
  { rival: "Dorados de Sinaloa", riIn: "DOR", date: NEXT_MATCH_DATE },
  { rival: "Cimarrones FC", riIn: "CIM", date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 18, 0) },
  { rival: "Cancún FC", riIn: "CAN", date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 17, 20, 0) },
];

// Standings
const createStandings = (highlight: number): StandingRow[] => [
  { pos: 1, team: "Atlético Morelia", initials: "AM", played: 7, won: 5, drawn: 1, lost: 1, gf: 15, ga: 6, gd: 9, points: 16 },
  { pos: 2, team: "Cimarrones FC", initials: "CIM", played: 7, won: 5, drawn: 0, lost: 2, gf: 12, ga: 7, gd: 5, points: 15 },
  { pos: 3, team: "Los Cabos United", initials: "LCU", played: 7, won: 4, drawn: 2, lost: 1, gf: 14, ga: 8, gd: 6, points: 14, isLCU: true },
  { pos: 4, team: "Cancún FC", initials: "CAN", played: 7, won: 4, drawn: 1, lost: 2, gf: 11, ga: 9, gd: 2, points: 13 },
  { pos: 5, team: "Inter Playa", initials: "IP", played: 7, won: 3, drawn: 3, lost: 1, gf: 10, ga: 7, gd: 3, points: 12 },
  { pos: 6, team: "Leones Negros", initials: "LN", played: 7, won: 3, drawn: 2, lost: 2, gf: 9, ga: 8, gd: 1, points: 11 },
  { pos: 7, team: "Dorados de Sinaloa", initials: "DOR", played: 7, won: 3, drawn: 1, lost: 3, gf: 10, ga: 11, gd: -1, points: 10 },
  { pos: 8, team: "Tlaxcala FC", initials: "TLX", played: 7, won: 2, drawn: 3, lost: 2, gf: 8, ga: 8, gd: 0, points: 9 },
  { pos: 9, team: "FC Juárez II", initials: "JZ", played: 7, won: 2, drawn: 2, lost: 3, gf: 7, ga: 10, gd: -3, points: 8 },
  { pos: 10, team: "Alebrijes", initials: "ALE", played: 7, won: 2, drawn: 1, lost: 4, gf: 6, ga: 11, gd: -5, points: 7 },
  { pos: 11, team: "Mineros", initials: "MIN", played: 7, won: 1, drawn: 2, lost: 4, gf: 5, ga: 12, gd: -7, points: 5 },
  { pos: 12, team: "Correcaminos", initials: "COR", played: 7, won: 0, drawn: 2, lost: 5, gf: 4, ga: 14, gd: -10, points: 2 },
];

export const STANDINGS = {
  general: createStandings(3),
  group1: createStandings(3).slice(0, 4),
  group2: createStandings(3).slice(4, 8),
  group3: createStandings(3).slice(8, 12),
};

export const TOP_SCORERS: TopScorer[] = [
  { name: "Carlos Méndez", team: "AM", goals: 7 },
  { name: "Roberto Silva", team: "LCU", goals: 6 },
  { name: "Diego Herrera", team: "CIM", goals: 5 },
  { name: "Luis Ramos", team: "CAN", goals: 5 },
  { name: "Andrés Torres", team: "LCU", goals: 4 },
  { name: "Miguel Ángel", team: "DOR", goals: 4 },
  { name: "Pablo Reyes", team: "IP", goals: 3 },
  { name: "Fernando Díaz", team: "LN", goals: 3 },
];

// Lineup — 4-3-3
export const LINEUP: Player[] = [
  { id: 1, name: "M. López", number: 1, position: "POR", x: 50, y: 92, goals: 0, assists: 0, minutes: 630, yellowCards: 0, redCards: 0 },
  { id: 2, name: "J. Ramírez", number: 4, position: "DFC", x: 20, y: 75, goals: 0, assists: 1, minutes: 580, yellowCards: 2, redCards: 0 },
  { id: 3, name: "A. Gutiérrez", number: 5, position: "DFC", x: 40, y: 75, goals: 1, assists: 0, minutes: 630, yellowCards: 1, redCards: 0 },
  { id: 4, name: "D. Morales", number: 3, position: "DFC", x: 60, y: 75, goals: 0, assists: 0, minutes: 540, yellowCards: 3, redCards: 0 },
  { id: 5, name: "R. Castro", number: 2, position: "DFC", x: 80, y: 75, goals: 0, assists: 2, minutes: 600, yellowCards: 1, redCards: 0 },
  { id: 6, name: "F. Herrera", number: 8, position: "MC", x: 30, y: 52, goals: 2, assists: 3, minutes: 610, yellowCards: 2, redCards: 0 },
  { id: 7, name: "C. Vega", number: 6, position: "MC", x: 50, y: 55, goals: 1, assists: 2, minutes: 590, yellowCards: 1, redCards: 0 },
  { id: 8, name: "P. Núñez", number: 10, position: "MC", x: 70, y: 52, goals: 3, assists: 4, minutes: 620, yellowCards: 0, redCards: 0 },
  { id: 9, name: "R. Silva", number: 11, position: "DEL", x: 20, y: 28, goals: 6, assists: 2, minutes: 600, yellowCards: 1, redCards: 0 },
  { id: 10, name: "A. Torres", number: 9, position: "DEL", x: 50, y: 22, goals: 4, assists: 1, minutes: 580, yellowCards: 0, redCards: 0 },
  { id: 11, name: "L. Ríos", number: 7, position: "DEL", x: 80, y: 28, goals: 3, assists: 3, minutes: 550, yellowCards: 2, redCards: 0 },
];

// Live match events
export const LIVE_EVENTS: MatchEvent[] = [
  { minute: 12, type: "goal", team: "home", player: "R. Silva", assist: "P. Núñez" },
  { minute: 34, type: "goal", team: "away", player: "M. Ángel" },
  { minute: 67, type: "goal", team: "home", player: "A. Torres", assist: "F. Herrera" },
];

export const LIVE_SCORE = { home: 2, away: 1, minute: 72, half: "2T" };

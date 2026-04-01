// Mock data for Zona de Partido

export interface Player {
  id: string;
  name: string;
  number: number;
  position: "GK" | "DEF" | "MID" | "FWD";
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  image?: string;
}

export interface MatchEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "substitution" | "half" | "var";
  team: "home" | "away";
  player: string;
  detail?: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  venue: string;
  jornada: number;
  grupo: number;
  status: "upcoming" | "live" | "finished";
  minute?: number;
  events?: MatchEvent[];
  homeLogo?: string;
  awayLogo?: string;
}

export interface TeamStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  grupo: number;
}

export interface TopScorer {
  position: number;
  player: string;
  team: string;
  goals: number;
  assists: number;
}

// ── Players ──
export const players: Player[] = [
  { id: "1", name: "Carlos Mendoza", number: 1, position: "GK", goals: 0, assists: 0, yellowCards: 1, redCards: 0, minutesPlayed: 810 },
  { id: "2", name: "Diego Ramírez", number: 4, position: "DEF", goals: 1, assists: 2, yellowCards: 3, redCards: 0, minutesPlayed: 790 },
  { id: "3", name: "Alejandro Torres", number: 6, position: "DEF", goals: 0, assists: 1, yellowCards: 2, redCards: 0, minutesPlayed: 720 },
  { id: "4", name: "Miguel Ángel Cruz", number: 3, position: "DEF", goals: 0, assists: 0, yellowCards: 1, redCards: 0, minutesPlayed: 680 },
  { id: "5", name: "Roberto Silva", number: 2, position: "DEF", goals: 0, assists: 3, yellowCards: 0, redCards: 0, minutesPlayed: 750 },
  { id: "6", name: "Fernando López", number: 8, position: "MID", goals: 3, assists: 4, yellowCards: 2, redCards: 0, minutesPlayed: 800 },
  { id: "7", name: "Andrés Herrera", number: 10, position: "MID", goals: 5, assists: 6, yellowCards: 1, redCards: 0, minutesPlayed: 810 },
  { id: "8", name: "José Martínez", number: 14, position: "MID", goals: 2, assists: 2, yellowCards: 3, redCards: 1, minutesPlayed: 650 },
  { id: "9", name: "Luis García", number: 7, position: "FWD", goals: 8, assists: 3, yellowCards: 1, redCards: 0, minutesPlayed: 780 },
  { id: "10", name: "Sebastián Vega", number: 9, position: "FWD", goals: 10, assists: 2, yellowCards: 2, redCards: 0, minutesPlayed: 800 },
  { id: "11", name: "Ricardo Fuentes", number: 11, position: "FWD", goals: 4, assists: 5, yellowCards: 0, redCards: 0, minutesPlayed: 700 },
];

// ── Formation positions on the pitch (4-3-3) – percentages ──
export const formationPositions: Record<string, { x: number; y: number }> = {
  "1": { x: 50, y: 90 },   // GK
  "2": { x: 80, y: 70 },   // RB
  "3": { x: 60, y: 72 },   // CB
  "4": { x: 40, y: 72 },   // CB
  "5": { x: 20, y: 70 },   // LB
  "6": { x: 65, y: 50 },   // CM
  "7": { x: 50, y: 45 },   // CAM
  "8": { x: 35, y: 50 },   // CM
  "9": { x: 50, y: 20 },   // ST
  "10": { x: 75, y: 28 },  // RW
  "11": { x: 25, y: 28 },  // LW
};

// ── LCU Matches ──
export const lcuMatches: Match[] = [
  {
    id: "lcu-1", homeTeam: "Los Cabos United", awayTeam: "Delfines FC", homeScore: 3, awayScore: 1,
    date: "2026-03-15", time: "19:00", venue: "Estadio Los Cabos", jornada: 1, grupo: 1, status: "finished",
    events: [
      { minute: 12, type: "goal", team: "home", player: "Sebastián Vega" },
      { minute: 35, type: "goal", team: "away", player: "J. Rodríguez" },
      { minute: 58, type: "goal", team: "home", player: "Luis García" },
      { minute: 78, type: "yellow", team: "away", player: "M. Salazar" },
      { minute: 89, type: "goal", team: "home", player: "Andrés Herrera" },
    ],
  },
  {
    id: "lcu-2", homeTeam: "Tiburones Rojos", awayTeam: "Los Cabos United", homeScore: 1, awayScore: 2,
    date: "2026-03-22", time: "17:00", venue: "Estadio Tiburón", jornada: 2, grupo: 1, status: "finished",
    events: [
      { minute: 20, type: "goal", team: "away", player: "Sebastián Vega" },
      { minute: 45, type: "half", team: "home", player: "" },
      { minute: 62, type: "goal", team: "home", player: "R. Hernández" },
      { minute: 74, type: "goal", team: "away", player: "Luis García" },
    ],
  },
  {
    id: "lcu-3", homeTeam: "Los Cabos United", awayTeam: "Halcones FC", homeScore: null, awayScore: null,
    date: "2026-04-05", time: "19:00", venue: "Estadio Los Cabos", jornada: 3, grupo: 1, status: "upcoming",
  },
  {
    id: "lcu-4", homeTeam: "Guerreros BCS", awayTeam: "Los Cabos United", homeScore: null, awayScore: null,
    date: "2026-04-12", time: "18:00", venue: "Estadio Guerrero", jornada: 4, grupo: 1, status: "upcoming",
  },
];

// Mock "live" match for demo
export const liveMatch: Match = {
  id: "lcu-live", homeTeam: "Los Cabos United", awayTeam: "Halcones FC", homeScore: 2, awayScore: 1,
  date: "2026-04-01", time: "19:00", venue: "Estadio Los Cabos", jornada: 3, grupo: 1, status: "live", minute: 67,
  events: [
    { minute: 8, type: "goal", team: "home", player: "Sebastián Vega", detail: "Asistencia: Andrés Herrera" },
    { minute: 23, type: "yellow", team: "away", player: "C. Morales" },
    { minute: 31, type: "goal", team: "away", player: "P. Jiménez", detail: "Tiro libre" },
    { minute: 45, type: "half", team: "home", player: "", detail: "Medio Tiempo" },
    { minute: 52, type: "substitution", team: "home", player: "José Martínez", detail: "Sale: Miguel Ángel Cruz" },
    { minute: 61, type: "goal", team: "home", player: "Luis García", detail: "Cabezazo" },
    { minute: 65, type: "yellow", team: "home", player: "Fernando López" },
  ],
};

// ── Standings ──
const makeStandings = (grupo: number, teams: Omit<TeamStanding, "grupo" | "goalDifference">[]): TeamStanding[] =>
  teams.map(t => ({ ...t, grupo, goalDifference: t.goalsFor - t.goalsAgainst }));

export const standings: TeamStanding[] = [
  ...makeStandings(1, [
    { position: 1, team: "Los Cabos United", played: 9, won: 7, drawn: 1, lost: 1, goalsFor: 22, goalsAgainst: 8, points: 22 },
    { position: 2, team: "Halcones FC", played: 9, won: 6, drawn: 2, lost: 1, goalsFor: 18, goalsAgainst: 7, points: 20 },
    { position: 3, team: "Tiburones Rojos", played: 9, won: 5, drawn: 1, lost: 3, goalsFor: 15, goalsAgainst: 12, points: 16 },
    { position: 4, team: "Delfines FC", played: 9, won: 4, drawn: 2, lost: 3, goalsFor: 14, goalsAgainst: 11, points: 14 },
    { position: 5, team: "Guerreros BCS", played: 9, won: 3, drawn: 2, lost: 4, goalsFor: 10, goalsAgainst: 14, points: 11 },
    { position: 6, team: "Lobos del Pacífico", played: 9, won: 1, drawn: 0, lost: 8, goalsFor: 5, goalsAgainst: 22, points: 3 },
  ]),
  ...makeStandings(2, [
    { position: 1, team: "Águilas de Sonora", played: 9, won: 7, drawn: 2, lost: 0, goalsFor: 20, goalsAgainst: 5, points: 23 },
    { position: 2, team: "Coyotes FC", played: 9, won: 6, drawn: 1, lost: 2, goalsFor: 17, goalsAgainst: 9, points: 19 },
    { position: 3, team: "Toros de Sinaloa", played: 9, won: 5, drawn: 2, lost: 2, goalsFor: 16, goalsAgainst: 10, points: 17 },
    { position: 4, team: "Rayos FC", played: 9, won: 4, drawn: 1, lost: 4, goalsFor: 12, goalsAgainst: 13, points: 13 },
    { position: 5, team: "Jaguares del Norte", played: 9, won: 2, drawn: 2, lost: 5, goalsFor: 9, goalsAgainst: 16, points: 8 },
    { position: 6, team: "Mapaches FC", played: 9, won: 0, drawn: 2, lost: 7, goalsFor: 4, goalsAgainst: 20, points: 2 },
  ]),
  ...makeStandings(3, [
    { position: 1, team: "Leones de Jalisco", played: 9, won: 8, drawn: 0, lost: 1, goalsFor: 24, goalsAgainst: 6, points: 24 },
    { position: 2, team: "Pumas del Bajío", played: 9, won: 5, drawn: 3, lost: 1, goalsFor: 16, goalsAgainst: 8, points: 18 },
    { position: 3, team: "Tigres Blancos", played: 9, won: 4, drawn: 3, lost: 2, goalsFor: 13, goalsAgainst: 10, points: 15 },
    { position: 4, team: "Venados FC", played: 9, won: 3, drawn: 3, lost: 3, goalsFor: 11, goalsAgainst: 11, points: 12 },
    { position: 5, team: "Búhos FC", played: 9, won: 2, drawn: 1, lost: 6, goalsFor: 8, goalsAgainst: 17, points: 7 },
    { position: 6, team: "Alacranes SC", played: 9, won: 1, drawn: 0, lost: 8, goalsFor: 5, goalsAgainst: 25, points: 3 },
  ]),
];

// ── Top Scorers ──
export const topScorers: TopScorer[] = [
  { position: 1, player: "Sebastián Vega", team: "Los Cabos United", goals: 10, assists: 2 },
  { position: 2, player: "R. Castillo", team: "Leones de Jalisco", goals: 9, assists: 4 },
  { position: 3, player: "Luis García", team: "Los Cabos United", goals: 8, assists: 3 },
  { position: 4, player: "M. Delgado", team: "Águilas de Sonora", goals: 8, assists: 1 },
  { position: 5, player: "P. Jiménez", team: "Halcones FC", goals: 7, assists: 5 },
  { position: 6, player: "J. Rodríguez", team: "Delfines FC", goals: 7, assists: 2 },
  { position: 7, player: "A. Navarro", team: "Coyotes FC", goals: 6, assists: 3 },
  { position: 8, player: "Andrés Herrera", team: "Los Cabos United", goals: 5, assists: 6 },
  { position: 9, player: "D. Flores", team: "Toros de Sinaloa", goals: 5, assists: 2 },
  { position: 10, player: "R. Hernández", team: "Tiburones Rojos", goals: 5, assists: 1 },
];

// ── All league matches ──
export const leagueMatches: Match[] = [
  // Grupo 1 – Jornada 1
  { id: "g1j1-1", homeTeam: "Los Cabos United", awayTeam: "Delfines FC", homeScore: 3, awayScore: 1, date: "2026-03-15", time: "19:00", venue: "Estadio Los Cabos", jornada: 1, grupo: 1, status: "finished" },
  { id: "g1j1-2", homeTeam: "Halcones FC", awayTeam: "Tiburones Rojos", homeScore: 2, awayScore: 0, date: "2026-03-15", time: "17:00", venue: "Estadio Halcón", jornada: 1, grupo: 1, status: "finished" },
  { id: "g1j1-3", homeTeam: "Guerreros BCS", awayTeam: "Lobos del Pacífico", homeScore: 1, awayScore: 1, date: "2026-03-16", time: "18:00", venue: "Estadio Guerrero", jornada: 1, grupo: 1, status: "finished" },
  // Grupo 1 – Jornada 2
  { id: "g1j2-1", homeTeam: "Tiburones Rojos", awayTeam: "Los Cabos United", homeScore: 1, awayScore: 2, date: "2026-03-22", time: "17:00", venue: "Estadio Tiburón", jornada: 2, grupo: 1, status: "finished" },
  { id: "g1j2-2", homeTeam: "Delfines FC", awayTeam: "Guerreros BCS", homeScore: 2, awayScore: 2, date: "2026-03-22", time: "19:00", venue: "Estadio Delfín", jornada: 2, grupo: 1, status: "finished" },
  { id: "g1j2-3", homeTeam: "Lobos del Pacífico", awayTeam: "Halcones FC", homeScore: 0, awayScore: 3, date: "2026-03-23", time: "17:00", venue: "Estadio Lobo", jornada: 2, grupo: 1, status: "finished" },
  // Grupo 1 – Jornada 3
  { id: "g1j3-1", homeTeam: "Los Cabos United", awayTeam: "Halcones FC", homeScore: null, awayScore: null, date: "2026-04-05", time: "19:00", venue: "Estadio Los Cabos", jornada: 3, grupo: 1, status: "upcoming" },
  { id: "g1j3-2", homeTeam: "Guerreros BCS", awayTeam: "Tiburones Rojos", homeScore: null, awayScore: null, date: "2026-04-05", time: "17:00", venue: "Estadio Guerrero", jornada: 3, grupo: 1, status: "upcoming" },
  { id: "g1j3-3", homeTeam: "Delfines FC", awayTeam: "Lobos del Pacífico", homeScore: null, awayScore: null, date: "2026-04-06", time: "18:00", venue: "Estadio Delfín", jornada: 3, grupo: 1, status: "upcoming" },
  // Grupo 2 – Jornada 1
  { id: "g2j1-1", homeTeam: "Águilas de Sonora", awayTeam: "Mapaches FC", homeScore: 4, awayScore: 0, date: "2026-03-15", time: "18:00", venue: "Estadio Águila", jornada: 1, grupo: 2, status: "finished" },
  { id: "g2j1-2", homeTeam: "Coyotes FC", awayTeam: "Rayos FC", homeScore: 2, awayScore: 1, date: "2026-03-15", time: "20:00", venue: "Estadio Coyote", jornada: 1, grupo: 2, status: "finished" },
  { id: "g2j1-3", homeTeam: "Toros de Sinaloa", awayTeam: "Jaguares del Norte", homeScore: 3, awayScore: 1, date: "2026-03-16", time: "17:00", venue: "Estadio Toro", jornada: 1, grupo: 2, status: "finished" },
  // Grupo 3 – Jornada 1
  { id: "g3j1-1", homeTeam: "Leones de Jalisco", awayTeam: "Alacranes SC", homeScore: 5, awayScore: 0, date: "2026-03-15", time: "19:00", venue: "Estadio León", jornada: 1, grupo: 3, status: "finished" },
  { id: "g3j1-2", homeTeam: "Pumas del Bajío", awayTeam: "Búhos FC", homeScore: 2, awayScore: 1, date: "2026-03-16", time: "18:00", venue: "Estadio Puma", jornada: 1, grupo: 3, status: "finished" },
  { id: "g3j1-3", homeTeam: "Tigres Blancos", awayTeam: "Venados FC", homeScore: 1, awayScore: 1, date: "2026-03-16", time: "20:00", venue: "Estadio Tigre", jornada: 1, grupo: 3, status: "finished" },
];

export interface Level {
  level: number;
  name: string;
  threshold: number;
}

export const LEVELS: Level[] = [
  { level: 0, name: "Visitante", threshold: 0 },
  { level: 1, name: "Local", threshold: 500 },
  { level: 2, name: "Cabeño", threshold: 2000 },
  { level: 3, name: "Amo", threshold: 5000 },
  { level: 4, name: "Amo del Paraíso", threshold: 12000 },
  { level: 5, name: "Leyenda del Paraíso", threshold: 25000 },
];

export function levelFromXp(xp: number): Level {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.threshold) current = l;
  return current;
}

export function nextLevel(current: Level): Level | null {
  return LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function progressToNext(xp: number) {
  const cur = levelFromXp(xp);
  const next = nextLevel(cur);
  if (!next) return { current: cur, next: null, earned: 0, span: 0, pct: 100, remaining: 0 };
  const span = next.threshold - cur.threshold;
  const earned = Math.max(0, xp - cur.threshold);
  const pct = Math.max(0, Math.min(100, (earned / span) * 100));
  return { current: cur, next, earned, span, pct, remaining: Math.max(0, next.threshold - xp) };
}
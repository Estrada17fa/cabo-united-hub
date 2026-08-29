import type { Match } from "@/components/match-zone/types";

/**
 * Reloj del partido derivado de la fase y las marcas de inicio de cada mitad.
 * Nunca avanza de fase solo: el admin manda.
 */
export function getMatchClock(match: Pick<
  Match,
  "phase" | "first_half_started_at" | "second_half_started_at" | "stoppage_minutes"
> | null, now: number = Date.now()): string | null {
  if (!match) return null;

  const elapsed = (from: string | null) => {
    if (!from) return 1;
    const mins = Math.floor((now - new Date(from).getTime()) / 60000) + 1;
    return Math.max(1, mins);
  };

  switch (match.phase) {
    case "first_half": {
      const m = elapsed(match.first_half_started_at);
      if (m <= 45) return `${m}'`;
      const extra = Math.min(m - 45, Math.max(match.stoppage_minutes || 0, m - 45));
      return `45+${extra}'`;
    }
    case "halftime":
      return "MT";
    case "second_half": {
      const m = 45 + elapsed(match.second_half_started_at);
      if (m <= 90) return `${m}'`;
      const extra = m - 90;
      return `90+${extra}'`;
    }
    case "finished":
      return "FINAL";
    default:
      return null;
  }
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function getCountdown(iso: string, now: number = Date.now()): Countdown {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  };
}

/** Archivo .ics para "Avísame" — sin backend. */
export function buildIcs(opts: { title: string; start: string; venue?: string | null; url?: string }) {
  const dt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = new Date(opts.start);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Los Cabos United//Match Zone//ES",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}@loscabosunited`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${opts.title}`,
    opts.venue ? `LOCATION:${opts.venue}` : "",
    opts.url ? `URL:${opts.url}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatKickoff(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
  };
}

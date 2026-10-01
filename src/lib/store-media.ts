/**
 * Dónde se suben las imágenes de la tienda (carrusel y portadas).
 * Ideal: bucket propio "tienda". Mientras el espacio de trabajo bloquee
 * almacenamientos públicos nuevos, se usa avatars/tienda (solo admins escriben ahí).
 * Para cambiar: STORE_MEDIA_BUCKET = "tienda" y STORE_MEDIA_FOLDER = "".
 */
export const STORE_MEDIA_BUCKET = "avatars";
export const STORE_MEDIA_FOLDER = "tienda";

/** Rutas internas que el admin puede elegir como destino del botón. */
export const SITE_PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Inicio" },
  { path: "/boletos", label: "Boletos" },
  { path: "/abonos", label: "Abonos" },
  { path: "/zona-partido", label: "Match Zone" },
  { path: "/club", label: "Tu Club" },
  { path: "/fan-zone", label: "Fan Zone" },
  { path: "/conoce-los-cabos", label: "Visita Los Cabos" },
  { path: "/patrocinios", label: "Patrocinios" },
  { path: "/contacto", label: "Contacto" },
  { path: "/mi-pase", label: "Mi pase" },
  { path: "/tienda", label: "Tienda" },
];

const TZ = "America/Mazatlan";

/** timestamptz (ISO) → valor para <input type="datetime-local"> en hora de Los Cabos. */
export function isoToCabosInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

/** Offset (min) de Los Cabos en una fecha dada. */
function cabosOffsetMinutes(date: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT-07:00";
  const m = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return -420;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

/** Valor de datetime-local (hora de Los Cabos) → ISO UTC. */
export function cabosInputToIso(value: string): string | null {
  if (!value) return null;
  const [d, t] = value.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = (t ?? "00:00").split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, da, h, mi);
  const offset = cabosOffsetMinutes(new Date(guess));
  return new Date(guess - offset * 60000).toISOString();
}

export function formatCabos(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

import { getCountdown } from "@/lib/matchClock";
import { useTicker } from "@/hooks/useMatchZone";
import { StatTile } from "./StatTile";

/** Cuatro tiles Días/Hrs/Min/Seg; los segundos van en cyan. */
export function CountdownTimer({ kickoffAt }: { kickoffAt: string }) {
  const now = useTicker(true, 1000);
  const c = getCountdown(kickoffAt, now);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="grid grid-cols-4 gap-2">
      <StatTile value={pad(c.days)} label="Días" />
      <StatTile value={pad(c.hours)} label="Hrs" />
      <StatTile value={pad(c.minutes)} label="Min" />
      <StatTile value={pad(c.seconds)} label="Seg" accent />
    </div>
  );
}

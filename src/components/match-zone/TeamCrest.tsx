import { cn } from "@/lib/utils";
import type { Team } from "./types";

interface Props {
  team?: Team | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-9 w-9 text-[11px]",
  lg: "h-14 w-14 text-sm",
  xl: "h-20 w-20 text-base",
};

export function TeamCrest({ team, size = "md", className }: Props) {
  const initials = (team?.short_name || team?.name || "?")
    .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline bg-surface-3 font-semibold text-muted-foreground",
        SIZES[size],
        team?.is_ours && "border-primary/40",
        className
      )}
      aria-hidden={!team}
    >
      {team?.logo_url ? (
        <img
          src={team.logo_url}
          alt={`Escudo de ${team.name}`}
          loading="lazy"
          className="h-full w-full object-contain p-1"
        />
      ) : (
        initials
      )}
    </div>
  );
}

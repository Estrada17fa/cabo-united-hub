import { cn } from "@/lib/utils";

interface CrestTeam {
  name?: string;
  short_name?: string | null;
  logo_url?: string | null;
  is_ours?: boolean;
}

interface Props {
  team?: CrestTeam | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: "h-5 w-5 text-[8px]",
  sm: "h-6 w-6 text-[9px]",
  md: "h-9 w-9 text-[11px]",
  lg: "h-12 w-12 text-sm",
};

/** Escudo con forma real de escudo. Usa el PNG del equipo; iniciales solo como fallback. */
export function Crest({ team, size = "md", className }: Props) {
  const initials = (team?.short_name || team?.name || "?")
    .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden font-semibold text-muted-foreground",
        team?.is_ours ? "bg-primary/15 text-primary" : "bg-surface-3",
        SIZES[size],
        className
      )}
      style={{
        clipPath:
          "polygon(50% 0%, 100% 14%, 100% 62%, 50% 100%, 0% 62%, 0% 14%)",
      }}
    >
      {team?.logo_url ? (
        <img
          src={team.logo_url}
          alt={`Escudo de ${team.name ?? "equipo"}`}
          loading="lazy"
          className="h-full w-full object-contain p-[1px]"
        />
      ) : (
        initials
      )}
    </span>
  );
}

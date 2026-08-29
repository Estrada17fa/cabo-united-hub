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

/** Logo PNG tal cual, sin fondo ni recorte. Iniciales solo como fallback cuando no hay logo. */
export function Crest({ team, size = "md", className }: Props) {
  if (team?.logo_url) {
    return (
      <img
        src={team.logo_url}
        alt={`Escudo de ${team.name ?? "equipo"}`}
        loading="lazy"
        className={cn("shrink-0 object-contain", SIZES[size], className)}
      />
    );
  }

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
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-muted-foreground",
        team?.is_ours ? "bg-primary/15 text-primary" : "bg-surface-3",
        SIZES[size],
        className
      )}
    >
      {initials}
    </span>
  );
}

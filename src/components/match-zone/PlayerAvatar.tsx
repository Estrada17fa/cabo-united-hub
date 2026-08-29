import { cn } from "@/lib/utils";

interface Props {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md";
  highlight?: boolean;
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
};

/** Foto del jugador; si no existe, iniciales sobre superficie elevada (nunca un círculo vacío). */
export function PlayerAvatar({ name, photoUrl, size = "sm", highlight, className }: Props) {
  const initials = name
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
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-surface-3 font-semibold",
        highlight ? "border-primary/40 text-primary" : "border-hairline text-muted-foreground",
        SIZES[size],
        className
      )}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`Foto de ${name}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        initials || "?"
      )}
    </span>
  );
}

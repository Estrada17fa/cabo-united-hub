interface CrestProps {
  teamName: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
  /** Resalta el escudo (equipo propio / foco) */
  highlight?: boolean;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** Escudo real del equipo; sin logo cae en iniciales sobre superficie elevada. */
export function Crest({ teamName, logoUrl, size = 40, className = "", highlight }: CrestProps) {
  const box = {
    width: size,
    height: size,
  };

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Escudo de ${teamName}`}
        loading="lazy"
        style={box}
        className={`shrink-0 rounded-md object-contain ${className}`}
      />
    );
  }

  return (
    <span
      style={{ ...box, fontSize: Math.max(10, size * 0.34) }}
      className={`grid shrink-0 place-items-center rounded-full font-display font-bold ${
        highlight
          ? "bg-primary/15 text-primary ring-1 ring-primary/40"
          : "bg-surface-3 text-secondary-fg ring-1 ring-white/10"
      } ${className}`}
      aria-label={`Escudo de ${teamName}`}
    >
      {initials(teamName)}
    </span>
  );
}

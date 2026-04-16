import { Shield } from "lucide-react";

interface TeamCrestProps {
  teamName: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}

export function TeamCrest({ teamName, logoUrl, size = 18, className = "" }: TeamCrestProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${teamName} escudo`}
        className={`object-contain shrink-0 rounded-sm ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return (
    <Shield
      className={`shrink-0 text-muted-foreground ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

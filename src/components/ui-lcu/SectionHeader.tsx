import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/** Encabezado de sección del sistema LCU: eyebrow → título display → subtítulo. */
export function SectionHeader({
  title,
  eyebrow,
  subtitle,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-display-md text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-secondary-fg">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

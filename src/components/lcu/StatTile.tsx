import { cn } from "@/lib/utils";

interface Props {
  value: string | number;
  label: string;
  /** Acentúa el número en cyan (usar con máxima disciplina). */
  accent?: boolean;
  className?: string;
}

/** Tile de dato: número display tabular + label en mayúsculas. */
export function StatTile({ value, label, accent, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline bg-surface-3 px-2 py-3 text-center",
        className
      )}
    >
      <div
        className={cn(
          "num-display text-[28px] leading-none",
          accent ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </div>
      <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

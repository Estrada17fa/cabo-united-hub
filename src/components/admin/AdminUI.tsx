import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const adminCard = "rounded-2xl border border-hairline bg-surface-1 p-4";
export const adminInput =
  "w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary";
export const adminLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <span className={adminLabel}>{label}</span>
      {children}
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}

export function Hint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[11px] leading-relaxed text-muted-foreground", className)}>{children}</p>;
}

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "pop";
type Size = "sm" | "md";

interface LcuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChildClassName?: string;
}

export const lcuButtonClasses = (variant: Variant = "primary", size: Size = "md") =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    size === "sm" ? "h-9 px-4 text-xs" : "h-11 px-5 text-sm",
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "outline" &&
      "border border-white/15 bg-white/[0.04] text-foreground hover:bg-white/[0.09]",
    variant === "ghost" && "text-secondary-fg hover:text-foreground hover:bg-white/[0.06]",
    variant === "pop" && "bg-pop text-pop-foreground hover:bg-pop/90",
  );

export const LcuButton = forwardRef<HTMLButtonElement, LcuButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button ref={ref} className={cn(lcuButtonClasses(variant, size), className)} {...props} />
  ),
);
LcuButton.displayName = "LcuButton";

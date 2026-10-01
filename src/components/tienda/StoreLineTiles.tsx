import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STORE_LINE_LABELS, type StoreLine, type StoreProduct } from "@/lib/store-types";

interface StoreLineTilesProps {
  lines: StoreLine[];
  products: StoreProduct[];
  /** Portadas del admin por línea; sin portada se usa la primera foto del catálogo completo. */
  covers?: Record<string, string>;
  value: StoreLine;
  onChange: (line: StoreLine) => void;
}

export function StoreLineTile({
  label,
  cover,
  active,
  onClick,
}: {
  label: string;
  cover?: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative h-[88px] w-full overflow-hidden rounded-2xl border p-0 text-left transition-colors md:h-[104px]",
        active ? "border-primary" : "border-hairline hover:border-foreground/30",
      )}
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.02]",
            active ? "opacity-100" : "opacity-45",
          )}
        />
      ) : (
        <span className="absolute inset-0 bg-surface-2" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <span className="absolute inset-x-0 bottom-0 block p-2.5 md:p-3.5">
        <span className="block font-display text-[15px] font-bold leading-none text-foreground md:text-[20px]">
          {label}
        </span>
      </span>
    </Button>
  );
}

export function StoreLineTiles({ lines, products, covers, value, onChange }: StoreLineTilesProps) {
  return (
    <div
      className={cn(
        "grid gap-2 md:gap-3",
        lines.length >= 3 ? "grid-cols-3" : lines.length === 2 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {lines.map((line) => {
        const cover =
          covers?.[line] ??
          products.find((product) => product.line === line && product.images[0])?.images[0];
        return (
          <StoreLineTile
            key={line}
            label={STORE_LINE_LABELS[line]}
            cover={cover}
            active={line === value}
            onClick={() => onChange(line)}
          />
        );
      })}
    </div>
  );
}

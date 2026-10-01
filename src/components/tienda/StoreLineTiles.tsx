import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STORE_LINE_LABELS, type StoreLine, type StoreProduct } from "@/lib/store-types";

const uploadedCovers = import.meta.glob<{ default: string }>(
  "/src/assets/tienda/linea-*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

/** Add or replace a line cover by changing this single map. Missing files use catalog fallback. */
const LINE_COVER_PATHS: Partial<Record<StoreLine, string>> = {
  oficial: "/src/assets/tienda/linea-jerseys.jpg",
  streetwear: "/src/assets/tienda/linea-streetwear.jpg",
};

interface StoreLineTilesProps {
  lines: StoreLine[];
  products: StoreProduct[];
  value: StoreLine;
  onChange: (line: StoreLine) => void;
}

export function StoreLineTiles({ lines, products, value, onChange }: StoreLineTilesProps) {
  return (
    <div
      className={cn(
        "grid gap-2 md:gap-3",
        lines.length >= 3 ? "grid-cols-3" : lines.length === 2 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {lines.map((line) => {
        const lineProducts = products.filter((product) => product.line === line);
        const configuredPath = LINE_COVER_PATHS[line];
        const cover =
          (configuredPath ? uploadedCovers[configuredPath]?.default : undefined) ??
          lineProducts.find((product) => product.images[0])?.images[0];
        const active = line === value;

        return (
          <Button
            key={line}
            type="button"
            variant="ghost"
            onClick={() => onChange(line)}
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
                {STORE_LINE_LABELS[line]}
              </span>
              <span className="mt-1 block font-display text-[10px] font-medium tabular-nums text-foreground/65">
                {lineProducts.length} {lineProducts.length === 1 ? "pieza" : "piezas"}
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
import { Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface ShopSortOption {
  key: string;
  label: string;
}

interface ShopSortSheetProps {
  value: string;
  options: ShopSortOption[];
  onChange: (value: string) => void;
}

export function ShopSortSheet({ value, options, onChange }: ShopSortSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Ordenar productos"
          title="Ordenar productos"
          className="h-11 w-11 shrink-0 rounded-xl border border-hairline bg-surface-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl border-hairline bg-surface-1 px-4 pb-7 pt-5">
        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="font-display text-xl font-bold text-foreground">Ordenar productos</SheetTitle>
          <SheetDescription>Elige cómo quieres ver las piezas.</SheetDescription>
        </SheetHeader>
        <div className="mx-auto grid w-full max-w-xl gap-1.5">
          {options.map((option) => (
            <SheetClose asChild key={option.key}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange(option.key)}
                className={cn(
                  "h-12 justify-between rounded-xl border px-4 text-sm",
                  option.key === value
                    ? "border-foreground/35 bg-surface-2 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {option.label}
                {option.key === value && <Check className="h-4 w-4" />}
              </Button>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
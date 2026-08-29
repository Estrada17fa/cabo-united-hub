import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Hoja lateral estándar del panel: formulario a la derecha, lista al fondo. */
export function AdminSheet({ open, onOpenChange, title, children, footer }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-hairline bg-surface-1 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-hairline px-4 py-3.5 text-left">
          <SheetTitle className="text-sm font-bold text-foreground">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">{children}</div>
        {footer && <div className="border-t border-hairline p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

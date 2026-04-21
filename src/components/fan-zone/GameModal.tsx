import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface GameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function GameModal({ open, onOpenChange, title, description, children }: GameModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[92vh] rounded-t-3xl border-t p-0 flex flex-col"
          style={{
            backgroundColor: "hsl(0 0% 4%)",
            borderColor: "hsl(180 100% 50% / 0.2)",
          }}
        >
          <SheetHeader className="p-5 pb-3 border-b text-left" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
            <SheetTitle className="text-lg font-extrabold">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-xs text-muted-foreground">{description}</SheetDescription>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border"
        style={{
          backgroundColor: "hsl(0 0% 4%)",
          borderColor: "hsl(180 100% 50% / 0.2)",
        }}
      >
        <DialogHeader className="p-6 pb-3 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
          <DialogTitle className="text-xl font-extrabold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="p-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthModal } from "./AuthModal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

/** Modal de acceso reutilizable para acciones que requieren sesión (ej. comprar). */
export function AuthGateDialog({
  open,
  onOpenChange,
  title = "Inicia sesión para comprar",
  description = "Necesitas una cuenta para completar tu compra en la tienda oficial.",
  onSuccess,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-hairline bg-surface-1">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
          <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p>
        </DialogHeader>
        <AuthModal
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

import { Suspense, lazy } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** El formulario de acceso baja solo al abrir el modal. */
const AuthModal = lazy(() => import("./AuthModal").then((m) => ({ default: m.AuthModal })));

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
        <Suspense fallback={null}>
          <AuthModal
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

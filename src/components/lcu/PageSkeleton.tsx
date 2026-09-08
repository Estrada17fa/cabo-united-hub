import { cn } from "@/lib/utils";

/** Bloque gris con pulso, alineado al look dark del sitio. */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-hairline bg-surface-2/60",
        className,
      )}
    />
  );
}

/**
 * Estructura genérica de página: se pinta de inmediato mientras llega el chunk
 * de la ruta, para que la navegación nunca se sienta en blanco.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6">
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
      <SkeletonBlock className="h-5 w-32" />
      <div className="space-y-2.5">
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-16 w-full" />
      </div>
    </div>
  );
}

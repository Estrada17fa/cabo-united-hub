import { GraduationCap } from "lucide-react";
import { useYouthTeam } from "@/hooks/useClub";

/** Bloque informativo del equipo juvenil (editable desde el panel). */
export function YouthTeamCard({ className = "" }: { className?: string }) {
  const { data: youth, isLoading } = useYouthTeam();

  if (isLoading || !youth) return null;

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-hairline bg-surface-1 ${className}`}
    >
      {youth.image_url && (
        <img
          src={youth.image_url}
          alt={youth.name}
          loading="lazy"
          className="h-36 w-full object-cover md:h-44"
        />
      )}
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Fuerzas juveniles
          </p>
        </div>
        <h2 className="text-display-md mt-1.5 text-foreground">{youth.name}</h2>
        {youth.tournament && (
          <span className="mt-2 inline-block rounded-lg border border-hairline bg-surface-3 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-fg">
            {youth.tournament}
          </span>
        )}
        {youth.description && (
          <p className="mt-3 text-sm leading-relaxed text-secondary-fg">{youth.description}</p>
        )}
      </div>
    </section>
  );
}

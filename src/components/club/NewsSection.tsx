import { useState } from "react";
import { Newspaper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClubNews, type ClubNews } from "@/hooks/useClub";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Noticias del panel; al tocar una se despliega en una hoja, sin cambiar de página. */
export function NewsSection({ className = "" }: { className?: string }) {
  const { data: news = [], isLoading } = useClubNews();
  const [open, setOpen] = useState<ClubNews | null>(null);

  return (
    <section className={`rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Desde el vestuario
        </p>
      </div>

      {isLoading ? (
        <div className="h-32 rounded-xl border border-hairline bg-surface-3" />
      ) : news.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Pronto habrá noticias del club.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {news.slice(0, 6).map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setOpen(n)}
              className="overflow-hidden rounded-xl border border-hairline bg-surface-3 text-left transition-colors hover:border-primary/40"
            >
              <div className="h-28 w-full bg-surface-2">
                {n.image_url && (
                  <img
                    src={n.image_url}
                    alt={n.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                {n.category && (
                  <span className="mb-1.5 inline-block rounded-md border border-hairline px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                    {n.category}
                  </span>
                )}
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                  {n.title}
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {formatDate(n.published_at ?? n.created_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-hairline bg-surface-1">
          {open && (
            <>
              <DialogHeader className="text-left">
                {open.category && (
                  <span className="mb-1 inline-block w-fit rounded-md border border-hairline px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                    {open.category}
                  </span>
                )}
                <DialogTitle className="text-base font-bold text-foreground">
                  {open.title}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  {formatDate(open.published_at ?? open.created_at)}
                  {open.author ? ` · ${open.author}` : ""}
                </DialogDescription>
              </DialogHeader>

              {open.image_url && (
                <img
                  src={open.image_url}
                  alt={open.title}
                  className="w-full rounded-xl border border-hairline object-cover"
                />
              )}

              {open.excerpt && (
                <p className="text-sm font-semibold text-secondary-fg">{open.excerpt}</p>
              )}
              {open.content && (
                <div className="space-y-3 text-sm leading-relaxed text-secondary-fg">
                  {open.content.split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

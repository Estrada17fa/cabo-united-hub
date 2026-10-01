import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { SizeGuide } from "@/data/size-guides";

export function SizeGuideSheet({ guide }: { guide: SizeGuide }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="text-[11px] font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Guía de tallas
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl border-hairline bg-background">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display">Guía de tallas · {guide.title}</SheetTitle>
          <SheetDescription>
            {guide.pendiente ? "Medidas pendientes de confirmar." : "Medidas de la prenda en centímetros."}
          </SheetDescription>
        </SheetHeader>
        <div className="mx-auto mt-4 max-w-xl overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full font-display text-[13px] tabular-nums">
            <thead className="bg-surface-1 text-[11px] text-muted-foreground">
              <tr>
                {guide.columns.map((c) => (
                  <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((r) => (
                <tr key={r[0]} className="border-t border-hairline">
                  {r.map((cell, i) => (
                    <td key={i} className={`px-3 py-2 ${i === 0 ? "font-bold text-foreground" : "text-foreground/80"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SheetContent>
    </Sheet>
  );
}

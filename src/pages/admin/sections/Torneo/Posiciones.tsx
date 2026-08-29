import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeasonKey, useStandings } from "@/hooks/useLeague";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

export default function Posiciones() {
  const season = useSeasonKey();
  const qc = useQueryClient();
  const { data: standings, isLoading } = useStandings();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<{
    id: string;
    team: string;
    manual_adjustment: number;
    adjustment_note: string;
  } | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["lcu-standings"] });

  const recalc = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("admin_recalculate_standings", { _season: season });
    setBusy(false);
    if (error) return toast.error("No se pudo recalcular", { description: error.message });
    toast.success("Tabla recalculada");
    refresh();
  };

  const saveAdjustment = async () => {
    if (!edit) return;
    const { error } = await supabase
      .from("league_standings")
      .update({
        manual_adjustment: edit.manual_adjustment,
        adjustment_note: edit.adjustment_note.trim() || null,
      } as never)
      .eq("id", edit.id);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    await supabase.rpc("admin_recalculate_standings", { _season: season });
    toast.success("Ajuste aplicado");
    setEdit(null);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Tabla de posiciones"
          action={
            <button
              onClick={recalc}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline px-3 py-1.5 text-xs font-bold text-foreground disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} /> Recalcular
            </button>
          }
        />
        <Hint className="mb-3">
          La tabla se calcula sola con los resultados de los partidos y las reglas de puntos. El ajuste
          manual es la excepción (por ejemplo, una sanción de la liga) y se suma al total.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !standings?.length ? (
          <EmptyRow text="Sin datos todavía. Captura equipos y partidos." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 text-left font-semibold">Equipo</th>
                  {["PJ", "G", "E", "P", "DIF", "AJ", "PTS"].map((h) => (
                    <th key={h} className="px-1.5 py-2 text-center font-semibold">
                      {h}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {standings.map((s) => (
                  <tr key={s.id} className="border-t border-hairline">
                    <td className="py-2 pr-2 font-sans text-[13px] font-semibold text-foreground">
                      {s.team?.name ?? "—"}
                    </td>
                    <td className="px-1.5 text-center text-muted-foreground">{s.played}</td>
                    <td className="px-1.5 text-center text-muted-foreground">{s.won}</td>
                    <td className="px-1.5 text-center text-muted-foreground">{s.drawn}</td>
                    <td className="px-1.5 text-center text-muted-foreground">{s.lost}</td>
                    <td className="px-1.5 text-center text-muted-foreground">{s.goal_diff}</td>
                    <td className="px-1.5 text-center text-primary">{s.manual_adjustment ?? 0}</td>
                    <td className="px-1.5 text-center font-bold text-foreground">{s.points}</td>
                    <td className="pl-2 text-right">
                      <button
                        onClick={() =>
                          setEdit({
                            id: s.id,
                            team: s.team?.name ?? "Equipo",
                            manual_adjustment: s.manual_adjustment ?? 0,
                            adjustment_note: s.adjustment_note ?? "",
                          })
                        }
                        className="font-sans text-[11px] font-semibold text-primary"
                      >
                        Ajustar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminSheet
        open={!!edit}
        onOpenChange={(v) => !v && setEdit(null)}
        title={`Ajuste manual · ${edit?.team ?? ""}`}
        footer={
          <button
            onClick={saveAdjustment}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
          >
            Aplicar ajuste
          </button>
        }
      >
        <Field label="Puntos a sumar o restar">
          <input
            type="number"
            className={adminInput}
            value={edit?.manual_adjustment ?? 0}
            onChange={(e) => edit && setEdit({ ...edit, manual_adjustment: Number(e.target.value) })}
          />
        </Field>
        <Field label="Motivo">
          <textarea
            rows={3}
            className={adminInput}
            placeholder="Sanción de la liga por alineación indebida"
            value={edit?.adjustment_note ?? ""}
            onChange={(e) => edit && setEdit({ ...edit, adjustment_note: e.target.value })}
          />
        </Field>
        <Hint>Usa números negativos para restar puntos.</Hint>
      </AdminSheet>
    </div>
  );
}

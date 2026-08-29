import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminSheet } from "@/components/admin/AdminSheet";
import {
  EmptyRow,
  Field,
  Hint,
  SectionTitle,
  adminCard,
  adminInput,
} from "@/components/admin/AdminUI";
import { CATEGORY_META, PlaceCategory, ROUTE_ICONS } from "@/lib/visita-los-cabos-data";

interface Form {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  published: boolean;
  sort_order: string;
  stops: string[]; // place ids, ordered
}

const EMPTY: Form = {
  name: "",
  description: "",
  icon: "flag",
  color: "",
  duration: "",
  published: true,
  sort_order: "0",
  stops: [],
};

export default function Rutas() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: places } = useQuery({
    queryKey: ["admin-places-min"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("id, name, category, area")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ["admin-fan-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fan_routes")
        .select("*, fan_route_stops(place_id, position)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-fan-routes"] });
    qc.invalidateQueries({ queryKey: ["fan_routes", "public"] });
  };

  const placeById = (id: string) => places?.find((p: any) => p.id === id);

  const edit = (row: any) =>
    setForm({
      id: row.id,
      name: row.name ?? "",
      description: row.description ?? "",
      icon: row.icon ?? "flag",
      color: row.color ?? "",
      duration: row.duration ?? "",
      published: !!row.published,
      sort_order: (row.sort_order ?? 0).toString(),
      stops: (row.fan_route_stops ?? [])
        .slice()
        .sort((a: any, b: any) => a.position - b.position)
        .map((s: any) => s.place_id),
    });

  const move = (i: number, dir: -1 | 1) => {
    if (!form) return;
    const next = [...form.stops];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setForm({ ...form, stops: next });
  };

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon,
      color: form.color.trim() || null,
      duration: form.duration.trim() || null,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
    };

    let routeId = form.id;
    if (routeId) {
      const { error } = await supabase
        .from("fan_routes")
        .update(payload as never)
        .eq("id", routeId);
      if (error) {
        setSaving(false);
        return toast.error("No se pudo guardar", { description: error.message });
      }
    } else {
      const { data, error } = await supabase
        .from("fan_routes")
        .insert(payload as never)
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        return toast.error("No se pudo guardar", { description: error?.message });
      }
      routeId = (data as any).id;
    }

    await supabase.from("fan_route_stops").delete().eq("route_id", routeId!);
    if (form.stops.length) {
      const { error } = await supabase.from("fan_route_stops").insert(
        form.stops.map((place_id, i) => ({
          route_id: routeId!,
          place_id,
          position: i + 1,
        })) as never
      );
      if (error) {
        setSaving(false);
        return toast.error("No se pudieron guardar las paradas", {
          description: error.message,
        });
      }
    }

    setSaving(false);
    toast.success("Ruta guardada");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("fan_routes").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Ruta eliminada");
    setForm(null);
    refresh();
  };

  const available = (places ?? []).filter((p: any) => !form?.stops.includes(p.id));

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Rutas del Amo"
          action={
            <button
              onClick={() => setForm({ ...EMPTY })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva ruta
            </button>
          }
        />
        <Hint className="mb-3">
          Cada ruta agrupa lugares ya capturados, en orden. El número de paradas se
          calcula solo.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !routes?.length ? (
          <EmptyRow text="Aún no hay rutas. Captura lugares y luego ármalas aquí." />
        ) : (
          <ul className="divide-y divide-hairline">
            {routes.map((r: any) => (
              <li key={r.id}>
                <button
                  onClick={() => edit(r)}
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-foreground">
                      {r.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {(r.fan_route_stops ?? []).length} paradas
                      {r.duration ? ` · ${r.duration}` : ""}
                    </span>
                  </span>
                  {!r.published && (
                    <span className="rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Borrador
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Editar ruta" : "Nueva ruta"}
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            {form?.id && (
              <button
                onClick={remove}
                className="inline-flex items-center gap-1.5 rounded-xl border border-hairline px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            )}
          </div>
        }
      >
        {form && (
          <>
            <Field label="Nombre">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ruta Pre-Partido"
                className={adminInput}
              />
            </Field>

            <Field label="Descripción">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={adminInput}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Ícono">
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className={adminInput}
                >
                  {ROUTE_ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Duración estimada">
                <input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="~3 horas"
                  className={adminInput}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Color (hex, opcional)">
                <input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#00ABC4"
                  className={adminInput}
                />
              </Field>
              <Field label="Orden">
                <input
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  inputMode="numeric"
                  className={adminInput}
                />
              </Field>
            </div>

            <div>
              <Field label="Paradas (en orden)">
                {form.stops.length === 0 ? (
                  <p className="py-2 text-[11px] text-muted-foreground">
                    Agrega lugares abajo para armar el itinerario.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {form.stops.map((id, i) => {
                      const p: any = placeById(id);
                      const meta = p
                        ? metaFor(p.category as PlaceCategory)
                        : undefined;

                      return (
                        <li
                          key={id}
                          className="flex items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-2.5 py-2"
                        >
                          <span className="w-4 text-[11px] font-bold tabular-nums text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-semibold text-foreground">
                              {p?.name ?? "Lugar eliminado"}
                            </span>
                            {meta && (
                              <span
                                className="block text-[10px]"
                                style={{ color: meta.color }}
                              >
                                {meta.label}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => move(i, -1)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(i, 1)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                stops: form.stops.filter((s) => s !== id),
                              })
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Field>

              <div className="mt-2">
                <select
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    setForm({ ...form, stops: [...form.stops, e.target.value] });
                  }}
                  className={adminInput}
                >
                  <option value="">+ Agregar parada…</option>
                  {available.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.area ? ` — ${p.area}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Publicada
            </label>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

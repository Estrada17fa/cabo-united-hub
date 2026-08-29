import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminSheet } from "@/components/admin/AdminSheet";
import {
  EmptyRow,
  Field,
  Hint,
  SectionTitle,
  adminCard,
  adminInput,
} from "@/components/admin/AdminUI";

interface SponsorRow {
  id: string;
  name: string;
  logo_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface SponsorForm {
  id?: string;
  name: string;
  logo_url: string | null;
  link_url: string;
  sort_order: string;
  is_active: boolean;
}

const EMPTY: SponsorForm = {
  name: "",
  logo_url: null,
  link_url: "",
  sort_order: "0",
  is_active: true,
};

export default function Patrocinadores() {
  const qc = useQueryClient();
  const [form, setForm] = useState<SponsorForm | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SponsorRow[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    qc.invalidateQueries({ queryKey: ["lcu-sponsors"] });
  };

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    if (!form.logo_url) return toast.error("Sube el logo (PNG con fondo transparente)");

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      logo_url: form.logo_url,
      link_url: form.link_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    const { error } = form.id
      ? await supabase.from("sponsors").update(payload).eq("id", form.id)
      : await supabase.from("sponsors").insert(payload);
    setSaving(false);

    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success(form.id ? "Patrocinador actualizado" : "Patrocinador agregado");
    setForm(null);
    refresh();
  };

  const remove = async (row: SponsorRow) => {
    if (!confirm(`¿Borrar a ${row.name} de la banda de patrocinadores?`)) return;
    const { error } = await supabase.from("sponsors").delete().eq("id", row.id);
    if (error) return toast.error("No se pudo borrar", { description: error.message });
    toast.success("Patrocinador borrado");
    refresh();
  };

  const toggleActive = async (row: SponsorRow) => {
    const { error } = await supabase
      .from("sponsors")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) return toast.error("No se pudo actualizar", { description: error.message });
    refresh();
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!sponsors) return;
    const target = index + dir;
    if (target < 0 || target >= sponsors.length) return;
    const a = sponsors[index];
    const b = sponsors[target];
    const [oa, ob] = [a.sort_order, b.sort_order];
    const newA = oa === ob ? target : ob;
    const newB = oa === ob ? index : oa;
    const { error } = await supabase.from("sponsors").upsert([
      { ...a, sort_order: newA },
      { ...b, sort_order: newB },
    ]);
    if (error) return toast.error("No se pudo reordenar", { description: error.message });
    refresh();
  };

  const activeCount = (sponsors ?? []).filter((s) => s.is_active).length;

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Banda de patrocinadores"
          action={
            <button
              type="button"
              onClick={() => setForm({ ...EMPTY, sort_order: String(sponsors?.length ?? 0) })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </button>
          }
        />
        <Hint>
          Los logos se muestran en la banda fija de abajo, todos a la misma altura y en loop
          continuo. Sube PNG con fondo transparente (sin marcos ni círculos), de menos de 2 MB.
          Recomendación: hasta ~20 logos activos para que la banda siga corriendo fluida sin
          cortes; si necesitas quitar uno temporalmente, desactívalo en lugar de borrarlo.
          Activos ahora: {activeCount}.
        </Hint>

        <div className="mt-3 space-y-2">
          {isLoading && <EmptyRow text="Cargando…" />}
          {!isLoading && (sponsors?.length ?? 0) === 0 && (
            <EmptyRow text="Todavía no hay patrocinadores. Mientras no agregues ninguno, se muestran los logos por defecto." />
          )}
          {sponsors?.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-2.5"
            >
              <div className="flex h-10 w-16 shrink-0 items-center justify-center">
                <img src={s.logo_url} alt={s.name} className="h-8 w-auto object-contain" />
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: s.id,
                    name: s.name,
                    logo_url: s.logo_url,
                    link_url: s.link_url ?? "",
                    sort_order: String(s.sort_order),
                    is_active: s.is_active,
                  })
                }
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {s.is_active ? "Visible" : "Oculto"} · orden {s.sort_order}
                  {s.link_url ? ` · ${s.link_url}` : ""}
                </p>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="rounded-lg border border-hairline p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Subir"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="rounded-lg border border-hairline p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Bajar"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(s)}
                  className="rounded-lg border border-hairline p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label={s.is_active ? "Ocultar" : "Mostrar"}
                >
                  {s.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => remove(s)}
                  className="rounded-lg border border-hairline p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label="Borrar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminSheet
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Editar patrocinador" : "Nuevo patrocinador"}
        onSave={save}
        saving={saving}
      >
        {form && (
          <div className="space-y-3">
            <Field label="Nombre">
              <input
                className={adminInput}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del patrocinador"
              />
            </Field>

            <ImageUploadField
              label="Logo (PNG transparente)"
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              folder="sponsors"
              hint="PNG sin fondo, máx 2 MB. Se ajusta automáticamente a la altura de la banda."
            />

            <Field label="Enlace (opcional)">
              <input
                className={adminInput}
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                placeholder="https://…"
              />
            </Field>

            <Field label="Orden">
              <input
                className={adminInput}
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Visible en la banda
            </label>
          </div>
        )}
      </AdminSheet>
    </div>
  );
}

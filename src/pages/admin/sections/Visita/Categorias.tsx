import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
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
import {
  GRADIENT_PRESETS,
  PLACE_ICON_CHOICES,
} from "@/lib/visita-los-cabos-data";
import { CategoryIcon } from "@/components/visita-los-cabos/CategoryIcon";

const COLOR_PRESETS = [
  "#00ABC4",
  "#22D3EE",
  "#2DD4A7",
  "#F59E0B",
  "#D97706",
  "#FF6B6B",
  "#E879F9",
  "#8B5CF6",
  "#3B82F6",
  "#A3A3A3",
];

interface Form {
  slug: string;
  originalSlug?: string;
  label: string;
  icon: string;
  color: string;
  gradient: string | null;
  sort_order: string;
  active: boolean;
}

const EMPTY: Form = {
  slug: "",
  label: "",
  icon: "map-pin",
  color: "#00ABC4",
  gradient: null,
  sort_order: "0",
  active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Categorias() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-place-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("label", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-place-categories"] });
    qc.invalidateQueries({ queryKey: ["place_categories", "all"] });
    qc.invalidateQueries({ queryKey: ["admin-places"] });
    qc.invalidateQueries({ queryKey: ["places", "public"] });
  };

  const edit = (row: any) =>
    setForm({
      slug: row.slug,
      originalSlug: row.slug,
      label: row.label ?? "",
      icon: row.icon ?? "map-pin",
      color: row.color ?? "#00ABC4",
      gradient: row.gradient ?? null,
      sort_order: (row.sort_order ?? 0).toString(),
      active: !!row.active,
    });

  const save = async () => {
    if (!form) return;
    const label = form.label.trim();
    if (!label) return toast.error("El nombre es obligatorio");
    const slug = (form.slug.trim() || slugify(label)) as string;
    if (!slug) return toast.error("El identificador no es válido");

    setSaving(true);
    const payload = {
      slug,
      label,
      icon: form.icon,
      color: form.color,
      gradient: form.gradient,
      sort_order: Number(form.sort_order) || 0,
      active: form.active,
    };

    const { error } = form.originalSlug
      ? await supabase
          .from("place_categories")
          .update(payload as never)
          .eq("slug", form.originalSlug)
      : await supabase.from("place_categories").insert(payload as never);
    setSaving(false);

    if (error)
      return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Tipo de lugar guardado");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.originalSlug) return;
    const { error } = await supabase
      .from("place_categories")
      .delete()
      .eq("slug", form.originalSlug);
    if (error)
      return toast.error("No se pudo eliminar", {
        description:
          "Probablemente hay lugares usando este tipo. Reasígnalos o desactívalo.",
      });
    toast.success("Tipo eliminado");
    setForm(null);
    refresh();
  };

  const move = async (row: any, dir: -1 | 1) => {
    const list = rows ?? [];
    const i = list.findIndex((r: any) => r.slug === row.slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const other: any = list[j];
    const a = supabase
      .from("place_categories")
      .update({ sort_order: other.sort_order ?? j } as never)
      .eq("slug", row.slug);
    const b = supabase
      .from("place_categories")
      .update({ sort_order: row.sort_order ?? i } as never)
      .eq("slug", other.slug);
    const [r1, r2] = await Promise.all([a, b]);
    if (r1.error || r2.error) return toast.error("No se pudo reordenar");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Tipos de lugar"
          action={
            <button
              onClick={() => setForm({ ...EMPTY })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo tipo
            </button>
          }
        />
        <Hint className="mb-3">
          Cada tipo define el ícono y el color del pin en el mapa, del filtro y
          de las tarjetas. Si un tipo ya tiene lugares no se puede borrar:
          desactívalo o reasigna los lugares.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !rows?.length ? (
          <EmptyRow text="Aún no hay tipos de lugar." />
        ) : (
          <ul className="divide-y divide-hairline">
            {rows.map((c: any, i: number) => (
              <li key={c.slug} className="flex items-center gap-2 py-2.5">
                <button
                  onClick={() => edit(c)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                    style={{ borderColor: `${c.color}66`, color: c.color }}
                  >
                    <CategoryIcon name={c.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-foreground">
                      {c.label}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {c.slug} · {c.icon}
                    </span>
                  </span>
                  {!c.active && (
                    <span className="rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Inactivo
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => move(c, -1)}
                    disabled={i === 0}
                    className="rounded-lg border border-hairline p-1.5 text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => move(c, 1)}
                    disabled={i === rows.length - 1}
                    className="rounded-lg border border-hairline p-1.5 text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.originalSlug ? "Editar tipo de lugar" : "Nuevo tipo de lugar"}
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            {form?.originalSlug && (
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
            <Field label="Nombre visible">
              <input
                value={form.label}
                onChange={(e) =>
                  setForm({
                    ...form,
                    label: e.target.value,
                    slug: form.originalSlug
                      ? form.slug
                      : slugify(e.target.value),
                  })
                }
                placeholder="Playas"
                className={adminInput}
              />
            </Field>

            <Field label="Identificador (no se muestra)">
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: slugify(e.target.value) })
                }
                placeholder="playas"
                className={adminInput}
              />
            </Field>

            <Field label="Ícono">
              <div className="grid grid-cols-8 gap-1.5 rounded-xl border border-hairline bg-surface-2 p-2">
                {PLACE_ICON_CHOICES.map((name) => {
                  const isActive = form.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: name })}
                      title={name}
                      className="flex aspect-square items-center justify-center rounded-lg border transition-colors"
                      style={
                        isActive
                          ? {
                              borderColor: form.color,
                              color: form.color,
                              backgroundColor: `${form.color}1A`,
                            }
                          : { borderColor: "transparent" }
                      }
                    >
                      <CategoryIcon name={name} className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Color del pin">
              <div className="flex flex-wrap items-center gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className="h-7 w-7 rounded-lg border-2"
                    style={{
                      backgroundColor: c,
                      borderColor: form.color === c ? "#FFFFFF" : "transparent",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-7 w-9 rounded-lg border border-hairline bg-transparent"
                />
              </div>
            </Field>

            <Field label="Degradado de respaldo (sin foto)">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, gradient: null })}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                    form.gradient
                      ? "border-hairline text-muted-foreground"
                      : "border-primary text-primary"
                  }`}
                >
                  Ninguno
                </button>
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setForm({ ...form, gradient: g.value })}
                    className="h-8 w-16 rounded-lg border-2"
                    style={{
                      background: g.value,
                      borderColor:
                        form.gradient === g.value ? "#FFFFFF" : "transparent",
                    }}
                    title={g.label}
                  />
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Orden">
                <input
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: e.target.value })
                  }
                  inputMode="numeric"
                  className={adminInput}
                />
              </Field>
              <Field label="Estado">
                <label className="flex items-center gap-2 py-2 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.checked })
                    }
                  />
                  Activo en el sitio
                </label>
              </Field>
            </div>

            <div className="rounded-xl border border-hairline bg-surface-2 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vista previa
              </p>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{ backgroundColor: form.color, color: "hsl(0 0% 8%)" }}
              >
                <CategoryIcon name={form.icon} className="h-3.5 w-3.5" />
                {form.label || "Nombre del tipo"}
              </span>
            </div>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

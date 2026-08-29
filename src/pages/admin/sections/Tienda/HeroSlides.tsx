import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface Form {
  id?: string;
  image_url: string | null;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_url: string;
  sort_order: string;
  published: boolean;
}

const EMPTY: Form = {
  image_url: null,
  eyebrow: "",
  title: "",
  subtitle: "",
  cta_label: "Ver colección",
  cta_url: "/tienda",
  sort_order: "0",
  published: true,
};

export default function HeroSlides() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-shop-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-shop-hero-slides"] });
    qc.invalidateQueries({ queryKey: ["shop_hero_slides", "public"] });
  };

  const edit = (row: any) =>
    setForm({
      id: row.id,
      image_url: row.image_url ?? null,
      eyebrow: row.eyebrow ?? "",
      title: row.title ?? "",
      subtitle: row.subtitle ?? "",
      cta_label: row.cta_label ?? "",
      cta_url: row.cta_url ?? "",
      sort_order: (row.sort_order ?? 0).toString(),
      published: !!row.published,
    });

  const save = async () => {
    if (!form) return;
    if (!form.title.trim()) return toast.error("El título es obligatorio");
    if (!form.image_url) return toast.error("Sube la imagen del hero");

    setSaving(true);
    const payload = {
      image_url: form.image_url,
      eyebrow: form.eyebrow.trim() || null,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      cta_label: form.cta_label.trim() || null,
      cta_url: form.cta_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };

    const { error } = form.id
      ? await supabase.from("shop_hero_slides").update(payload as never).eq("id", form.id)
      : await supabase.from("shop_hero_slides").insert(payload as never);
    setSaving(false);

    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Slide guardado");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("shop_hero_slides").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Slide eliminado");
    setForm(null);
    refresh();
  };

  const move = async (row: any, dir: -1 | 1) => {
    const list = rows ?? [];
    const i = list.findIndex((r: any) => r.id === row.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const other: any = list[j];
    const [r1, r2] = await Promise.all([
      supabase.from("shop_hero_slides").update({ sort_order: other.sort_order ?? j } as never).eq("id", row.id),
      supabase.from("shop_hero_slides").update({ sort_order: row.sort_order ?? i } as never).eq("id", other.id),
    ]);
    if (r1.error || r2.error) return toast.error("No se pudo reordenar");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Hero de la tienda"
          action={
            <button
              onClick={() => setForm({ ...EMPTY, sort_order: String(rows?.length ?? 0) })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo slide
            </button>
          }
        />
        <Hint className="mb-3">
          De 1 a 3 slides funcionan mejor. Usa fotos horizontales (mínimo 1600 px de ancho) con
          espacio libre en la parte baja: ahí va el texto.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !rows?.length ? (
          <EmptyRow text="Aún no hay slides. Mientras tanto la tienda muestra un hero por defecto." />
        ) : (
          <ul className="divide-y divide-hairline">
            {rows.map((s: any, i: number) => (
              <li key={s.id} className="flex items-center gap-2 py-2.5">
                <button onClick={() => edit(s)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-surface-2">
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-foreground">{s.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {s.eyebrow ? `${s.eyebrow} · ` : ""}
                      {s.cta_label || "Sin botón"}
                    </span>
                  </span>
                  {!s.published && (
                    <span className="rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Oculto
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => move(s, -1)}
                    disabled={i === 0}
                    className="rounded-lg border border-hairline p-1.5 text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => move(s, 1)}
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
        title={form?.id ? "Editar slide" : "Nuevo slide"}
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
            <ImageUploadField
              label="Imagen del hero"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="tienda"
              hint="Horizontal, máx 2 MB"
            />

            <Field label="Etiqueta corta (opcional)">
              <input
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                placeholder="Temporada 25/26"
                className={adminInput}
              />
            </Field>

            <Field label="Título">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Jersey Oficial"
                className={adminInput}
              />
            </Field>

            <Field label="Texto de apoyo (opcional)">
              <textarea
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                rows={2}
                placeholder="Hecho para los Amos del Paraíso"
                className={adminInput}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Texto del botón">
                <input
                  value={form.cta_label}
                  onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                  placeholder="Ver jerseys"
                  className={adminInput}
                />
              </Field>
              <Field label="Destino">
                <input
                  value={form.cta_url}
                  onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                  placeholder="/tienda"
                  className={adminInput}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Orden">
                <input
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  inputMode="numeric"
                  className={adminInput}
                />
              </Field>
              <Field label="Visible en la tienda">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                    form.published
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-hairline bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {form.published ? "Publicado" : "Oculto"}
                </button>
              </Field>
            </div>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

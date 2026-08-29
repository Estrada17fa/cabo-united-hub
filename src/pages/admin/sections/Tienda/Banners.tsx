import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

const BG_PRESETS = ["#0D0F13", "#12181C", "#00ABC4", "#1B1B1F", "#0B2A30"];

interface Form {
  id?: string;
  image_url: string | null;
  bg_color: string;
  title: string;
  body: string;
  cta_label: string;
  cta_url: string;
  sort_order: string;
  published: boolean;
}

const EMPTY: Form = {
  image_url: null,
  bg_color: "#0D0F13",
  title: "",
  body: "",
  cta_label: "",
  cta_url: "",
  sort_order: "0",
  published: true,
};

export default function Banners() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-shop-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_banners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-shop-banners"] });
    qc.invalidateQueries({ queryKey: ["shop_banners", "public"] });
  };

  const edit = (row: any) =>
    setForm({
      id: row.id,
      image_url: row.image_url ?? null,
      bg_color: row.bg_color ?? "#0D0F13",
      title: row.title ?? "",
      body: row.body ?? "",
      cta_label: row.cta_label ?? "",
      cta_url: row.cta_url ?? "",
      sort_order: (row.sort_order ?? 0).toString(),
      published: !!row.published,
    });

  const save = async () => {
    if (!form) return;
    if (!form.title.trim()) return toast.error("El título es obligatorio");

    setSaving(true);
    const payload = {
      image_url: form.image_url,
      bg_color: form.bg_color || null,
      title: form.title.trim(),
      body: form.body.trim() || null,
      cta_label: form.cta_label.trim() || null,
      cta_url: form.cta_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };

    const { error } = form.id
      ? await supabase.from("shop_banners").update(payload as never).eq("id", form.id)
      : await supabase.from("shop_banners").insert(payload as never);
    setSaving(false);

    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Banner guardado");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("shop_banners").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Banner eliminado");
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
      supabase.from("shop_banners").update({ sort_order: other.sort_order ?? j } as never).eq("id", row.id),
      supabase.from("shop_banners").update({ sort_order: row.sort_order ?? i } as never).eq("id", other.id),
    ]);
    if (r1.error || r2.error) return toast.error("No se pudo reordenar");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Banners promocionales"
          action={
            <button
              onClick={() => setForm({ ...EMPTY, sort_order: String(rows?.length ?? 0) })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo banner
            </button>
          }
        />
        <Hint className="mb-3">
          Franjas para campañas: envío gratis, preventa, descuento para socios. Si no subes imagen
          se usa el color de fondo.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !rows?.length ? (
          <EmptyRow text="Aún no hay banners." />
        ) : (
          <ul className="divide-y divide-hairline">
            {rows.map((b: any, i: number) => (
              <li key={b.id} className="flex items-center gap-2 py-2.5">
                <button onClick={() => edit(b)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span
                    className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline"
                    style={{ background: b.image_url ? undefined : b.bg_color ?? "#0D0F13" }}
                  >
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.title} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-foreground">{b.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {b.body || "Sin texto"}
                    </span>
                  </span>
                  {!b.published && (
                    <span className="rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Oculto
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => move(b, -1)}
                    disabled={i === 0}
                    className="rounded-lg border border-hairline p-1.5 text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => move(b, 1)}
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
        title={form?.id ? "Editar banner" : "Nuevo banner"}
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
              label="Imagen de fondo (opcional)"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="tienda"
              hint="Horizontal, máx 2 MB"
            />

            <Field label="Color de fondo (si no hay imagen)">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bg_color}
                  onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-hairline bg-surface-2"
                />
                <div className="flex gap-1.5">
                  {BG_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, bg_color: c })}
                      style={{ background: c }}
                      className={`h-7 w-7 rounded-lg border ${
                        form.bg_color === c ? "border-primary" : "border-hairline"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Field>

            <Field label="Título">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Envío gratis en Los Cabos"
                className={adminInput}
              />
            </Field>

            <Field label="Texto (opcional)">
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={2}
                placeholder="En compras mayores a $1,200"
                className={adminInput}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Texto del botón">
                <input
                  value={form.cta_label}
                  onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                  placeholder="Comprar"
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

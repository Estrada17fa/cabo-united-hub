import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Newspaper, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface FormState {
  id?: string;
  title: string;
  category: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  image_url: string | null;
  published: boolean;
}

const EMPTY: FormState = {
  title: "",
  category: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  image_url: null,
  published: false,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function Noticias() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: news, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-news"] });
    qc.invalidateQueries({ queryKey: ["lcu-news"] });
  };

  const save = async () => {
    if (!form) return;
    if (!form.title.trim()) return toast.error("El título es obligatorio");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || null,
      slug: (form.slug.trim() || slugify(form.title)) || null,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      author: form.author.trim() || null,
      image_url: form.image_url,
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
    };
    const { error } = form.id
      ? await supabase.from("news").update(payload as never).eq("id", form.id)
      : await supabase.from("news").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Noticia guardada");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("news").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Noticia eliminada");
    setForm(null);
    refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-base font-bold text-foreground">Noticias</h1>

      <div className={adminCard}>
        <SectionTitle
          title={`Publicaciones (${news?.length ?? 0})`}
          action={
            <button
              onClick={() => setForm(EMPTY)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva noticia
            </button>
          }
        />
        <Hint className="mb-3">Solo las noticias publicadas se ven en el sitio.</Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !news?.length ? (
          <EmptyRow text="Sin noticias." />
        ) : (
          <div className="space-y-2">
            {news.map((n) => (
              <button
                key={n.id}
                onClick={() =>
                  setForm({
                    id: n.id,
                    title: n.title,
                    category: n.category ?? "",
                    slug: n.slug ?? "",
                    excerpt: n.excerpt ?? "",
                    content: n.content ?? "",
                    author: n.author ?? "",
                    image_url: n.image_url,
                    published: n.published,
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-surface-1">
                  {n.image_url ? (
                    <img src={n.image_url} alt={n.title} className="h-full w-full object-cover" />
                  ) : (
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {n.author ? `${n.author} · ` : ""}
                    {new Date(n.created_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    n.published ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {n.published ? "Publicada" : "Borrador"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Editar noticia" : "Nueva noticia"}
        footer={
          <div className="space-y-2">
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar noticia"}
            </button>
            {form?.id && (
              <button
                onClick={remove}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar noticia
              </button>
            )}
          </div>
        }
      >
        {form && (
          <>
            <Field label="Título">
              <input
                className={adminInput}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="Categoría">
              <input
                className={adminInput}
                placeholder="Noticias · Entrevista · Detrás de cámaras"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <Field label="Slug (opcional)">
              <input
                className={adminInput}
                value={form.slug}
                placeholder={slugify(form.title)}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>
            <Field label="Resumen">
              <textarea
                rows={2}
                className={adminInput}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </Field>
            <Field label="Contenido">
              <textarea
                rows={8}
                className={adminInput}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Field>
            <Field label="Autor">
              <input
                className={adminInput}
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </Field>
            <ImageUploadField
              label="Imagen principal"
              folder="tournaments"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              hint="JPG o PNG · máx 2 MB"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              Publicada
            </label>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

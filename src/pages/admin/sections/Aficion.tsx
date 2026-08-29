import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users } from "lucide-react";
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

const NETWORKS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "x", label: "X" },
  { id: "otro", label: "Otro" },
];

interface PostForm {
  id?: string;
  author: string;
  handle: string;
  network: string;
  text: string;
  image_url: string | null;
  link_url: string;
  published: boolean;
  sort_order: string;
}

const EMPTY_POST: PostForm = {
  author: "",
  handle: "",
  network: "instagram",
  text: "",
  image_url: null,
  link_url: "",
  published: true,
  sort_order: "0",
};

export default function Aficion() {
  const qc = useQueryClient();
  const [form, setForm] = useState<PostForm | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-fan-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fan_posts")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-fan-posts"] });
    qc.invalidateQueries({ queryKey: ["lcu-fan-posts"] });
  };

  const save = async () => {
    if (!form) return;
    if (!form.author.trim()) return toast.error("El autor es obligatorio");
    if (!form.text.trim()) return toast.error("El texto es obligatorio");
    setSaving(true);
    const payload = {
      author: form.author.trim(),
      handle: form.handle.trim() || null,
      network: form.network,
      text: form.text.trim(),
      image_url: form.image_url,
      link_url: form.link_url.trim() || null,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = form.id
      ? await supabase.from("fan_posts").update(payload as never).eq("id", form.id)
      : await supabase.from("fan_posts").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Post guardado");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("fan_posts").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Post eliminado");
    setForm(null);
    refresh();
  };

  return (
    <div className="space-y-4">
      <YouthEditor />

      <div className={adminCard}>
        <SectionTitle
          title="Posts de la afición"
          action={
            <button
              onClick={() => setForm({ ...EMPTY_POST })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo post
            </button>
          }
        />
        <Hint className="mb-3">
          Se capturan a mano (no hay conexión con redes sociales). La red de origen es solo
          una etiqueta visual.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !posts?.length ? (
          <EmptyRow text="Aún no hay posts de afición." />
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  setForm({
                    id: p.id,
                    author: p.author,
                    handle: p.handle ?? "",
                    network: p.network,
                    text: p.text,
                    image_url: p.image_url,
                    link_url: p.link_url ?? "",
                    published: p.published,
                    sort_order: String(p.sort_order),
                  })
                }
                className="flex w-full items-start gap-3 rounded-xl border border-hairline bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
              >
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {p.author}
                    {p.handle ? ` · ${p.handle}` : ""}
                  </p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{p.text}</p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    p.published ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {p.published ? "Visible" : "Oculto"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Editar post" : "Nuevo post"}
        footer={
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            {form?.id && (
              <button
                onClick={remove}
                className="rounded-xl border border-hairline px-3 text-destructive"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      >
        {form && (
          <>
            <Field label="Autor / usuario">
              <input
                className={adminInput}
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </Field>
            <Field label="Handle (opcional)">
              <input
                className={adminInput}
                placeholder="@usuario"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
              />
            </Field>
            <Field label="Red de origen">
              <select
                className={adminInput}
                value={form.network}
                onChange={(e) => setForm({ ...form, network: e.target.value })}
              >
                {NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Texto">
              <textarea
                rows={4}
                className={adminInput}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </Field>
            <ImageUploadField
              label="Imagen (opcional)"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="tournaments"
            />
            <Field label="Link (opcional)">
              <input
                className={adminInput}
                placeholder="https://…"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              />
            </Field>
            <Field label="Orden">
              <input
                className={adminInput}
                inputMode="numeric"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Visible en el sitio
            </label>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

/* ------------------------------- Equipo juvenil ------------------------------- */

function YouthEditor() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState({
    id: "",
    name: "",
    tournament: "",
    description: "",
    image_url: null as string | null,
    visible: true,
  });

  const { data } = useQuery({
    queryKey: ["admin-youth-team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youth_team")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  useEffect(() => {
    if (!data) return;
    setState({
      id: data.id,
      name: data.name,
      tournament: data.tournament,
      description: data.description ?? "",
      image_url: data.image_url,
      visible: data.visible,
    });
  }, [data]);

  const save = async () => {
    setSaving(true);
    const payload = {
      name: state.name.trim(),
      tournament: state.tournament.trim(),
      description: state.description.trim() || null,
      image_url: state.image_url,
      visible: state.visible,
    };
    const { error } = state.id
      ? await supabase.from("youth_team").update(payload as never).eq("id", state.id)
      : await supabase.from("youth_team").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Equipo juvenil actualizado");
    qc.invalidateQueries({ queryKey: ["admin-youth-team"] });
    qc.invalidateQueries({ queryKey: ["lcu-youth-team"] });
  };

  return (
    <div className={adminCard}>
      <SectionTitle title="Equipo juvenil (informativo)" />
      <Hint className="mb-3">
        Bloque informativo que se muestra en Tu Club. Las academias se agregarán después.
      </Hint>

      <div className="space-y-3">
        <Field label="Nombre del equipo">
          <input
            className={adminInput}
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
          />
        </Field>
        <Field label="Torneo">
          <input
            className={adminInput}
            placeholder="Copa Telmex"
            value={state.tournament}
            onChange={(e) => setState({ ...state, tournament: e.target.value })}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            rows={4}
            className={adminInput}
            value={state.description}
            onChange={(e) => setState({ ...state, description: e.target.value })}
          />
        </Field>
        <ImageUploadField
          label="Imagen (opcional)"
          value={state.image_url}
          onChange={(url) => setState({ ...state, image_url: url })}
          folder="tournaments"
        />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={state.visible}
            onChange={(e) => setState({ ...state, visible: e.target.checked })}
          />
          Visible en el sitio
        </label>
        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowDown, ArrowUp, GripVertical, ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";
import { HeroSlideFrame, resolveCta, type SlideView } from "@/components/tienda/HeroCarousel";
import { useProducts } from "@/hooks/useProducts";
import type { CtaType } from "@/hooks/useShopContent";
import {
  STORE_LINE_LABELS,
  equipacionLabel,
  sectionLabel,
  storeTypeLabel,
  type StoreLine,
  type StoreProduct,
} from "@/lib/store-types";
import {
  SITE_PAGES,
  STORE_MEDIA_BUCKET,
  STORE_MEDIA_FOLDER,
  cabosInputToIso,
  formatCabos,
  isoToCabosInput,
} from "@/lib/store-media";

interface Form {
  id?: string;
  image_url: string | null;
  image_mobile_url: string | null;
  eyebrow: string;
  title: string;
  subtitle: string;
  show_cta: boolean;
  cta_type: CtaType;
  cta_label: string;
  cta_ref: string;
  cta_url: string;
  store_linea: string;
  store_seccion: string;
  store_equipacion: string;
  store_tipo: string;
  starts_at: string;
  ends_at: string;
  sort_order: number;
  published: boolean;
}

const EMPTY: Form = {
  image_url: null,
  image_mobile_url: null,
  eyebrow: "",
  title: "",
  subtitle: "",
  show_cta: true,
  cta_type: "store",
  cta_label: "Ver colección",
  cta_ref: "",
  cta_url: "/tienda",
  store_linea: "",
  store_seccion: "",
  store_equipacion: "",
  store_tipo: "",
  starts_at: "",
  ends_at: "",
  sort_order: 0,
  published: true,
};

const CTA_TYPES: { id: CtaType; label: string }[] = [
  { id: "store", label: "Tienda" },
  { id: "product", label: "Producto" },
  { id: "page", label: "Página" },
  { id: "external", label: "URL externa" },
];

const uniq = (a: string[]) => [...new Set(a)];

function storeUrl(f: Form) {
  const p = new URLSearchParams();
  if (f.store_linea) p.set("linea", f.store_linea);
  if (f.store_equipacion) p.set("equipacion", f.store_equipacion);
  if (f.store_seccion) p.set("seccion", f.store_seccion);
  if (f.store_tipo) p.set("tipo", f.store_tipo);
  const q = p.toString();
  return q ? `/tienda?${q}` : "/tienda";
}

function storeMatches(products: StoreProduct[], url: string) {
  const q = new URLSearchParams(url.split("?")[1] ?? "");
  return products.filter(
    (p) =>
      (!q.get("linea") || p.line === q.get("linea")) &&
      (!q.get("seccion") || p.sections.includes(q.get("seccion")!)) &&
      (!q.get("equipacion") || p.equipacion === q.get("equipacion")) &&
      (!q.get("tipo") || p.garmentType === q.get("tipo")),
  );
}

/** Motivo de destino roto o null. */
function brokenReason(row: any, products: StoreProduct[] | undefined): string | null {
  if (!products || !row.show_cta || !row.cta_label) return null;
  if (row.cta_type === "product") {
    if (!row.cta_ref) return "Sin producto elegido";
    return products.some((p) => p.handle === row.cta_ref) ? null : "El producto ya no existe o no está publicado";
  }
  if (row.cta_type === "store" && row.cta_url?.startsWith("/tienda?")) {
    return storeMatches(products, row.cta_url).length ? null : "Esa vista de la tienda ya no tiene productos";
  }
  if (!row.cta_url) return "Sin destino";
  return null;
}

export default function HeroSlides() {
  const qc = useQueryClient();
  const { data: products } = useProducts();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState("");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-shop-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-shop-hero-slides"] });
    qc.invalidateQueries({ queryKey: ["shop_hero_slides", "public"] });
  };

  const edit = (row: any) => {
    const q = new URLSearchParams((row.cta_url ?? "").split("?")[1] ?? "");
    setProductQuery("");
    setForm({
      id: row.id,
      image_url: row.image_url ?? null,
      image_mobile_url: row.image_mobile_url ?? null,
      eyebrow: row.eyebrow ?? "",
      title: row.title ?? "",
      subtitle: row.subtitle ?? "",
      show_cta: row.show_cta ?? true,
      cta_type: (row.cta_type as CtaType) ?? "page",
      cta_label: row.cta_label ?? "",
      cta_ref: row.cta_ref ?? "",
      cta_url: row.cta_url ?? "",
      store_linea: q.get("linea") ?? "",
      store_seccion: q.get("seccion") ?? "",
      store_equipacion: q.get("equipacion") ?? "",
      store_tipo: q.get("tipo") ?? "",
      starts_at: isoToCabosInput(row.starts_at),
      ends_at: isoToCabosInput(row.ends_at),
      sort_order: row.sort_order ?? 0,
      published: !!row.published,
    });
  };

  // Opciones de destino tienda a partir del catálogo real
  const all = products ?? [];
  const lines = uniq(all.map((p) => p.line)) as StoreLine[];
  const inLine = form?.store_linea ? all.filter((p) => p.line === form.store_linea) : all;
  const sections = uniq(inLine.flatMap((p) => p.sections));
  const equips = uniq(inLine.map((p) => p.equipacion).filter(Boolean) as string[]);
  const inL2 = inLine.filter(
    (p) =>
      (!form?.store_seccion || p.sections.includes(form.store_seccion)) &&
      (!form?.store_equipacion || p.equipacion === form.store_equipacion),
  );
  const types = uniq(inL2.map((p) => p.garmentType));
  const productResults = useMemo(() => {
    const t = productQuery.trim().toLowerCase();
    return (products ?? []).filter((p) => !t || p.title.toLowerCase().includes(t)).slice(0, 8);
  }, [products, productQuery]);

  const finalUrl = (f: Form) =>
    f.cta_type === "store" ? storeUrl(f) : f.cta_type === "product" ? null : f.cta_url.trim() || null;

  const save = async () => {
    if (!form) return;
    if (!form.image_url) return toast.error("Sube la imagen de escritorio");
    if (form.show_cta && !form.cta_label.trim()) return toast.error("Escribe el texto del botón");
    if (form.show_cta && form.cta_type === "product" && !form.cta_ref) return toast.error("Elige un producto");
    if (form.show_cta && form.cta_type === "external" && !/^https?:\/\//i.test(form.cta_url))
      return toast.error("La URL externa debe empezar con https://");
    const starts = cabosInputToIso(form.starts_at);
    const ends = cabosInputToIso(form.ends_at);
    if (starts && ends && ends <= starts) return toast.error("La fecha de fin debe ser después del inicio");

    setSaving(true);
    const payload = {
      image_url: form.image_url,
      image_mobile_url: form.image_mobile_url,
      eyebrow: form.eyebrow.trim() || null,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      show_cta: form.show_cta,
      cta_type: form.cta_type,
      cta_label: form.cta_label.trim() || null,
      cta_ref: form.cta_type === "product" ? form.cta_ref : null,
      cta_url: finalUrl(form),
      starts_at: starts,
      ends_at: ends,
      sort_order: form.sort_order,
      published: form.published,
    };
    const { error } = form.id
      ? await supabase.from("shop_hero_slides").update(payload as never).eq("id", form.id)
      : await supabase.from("shop_hero_slides").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Diapositiva guardada");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("shop_hero_slides").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Diapositiva eliminada");
    setForm(null);
    refresh();
  };

  const persistOrder = async (list: any[]) => {
    qc.setQueryData(["admin-shop-hero-slides"], list.map((r, i) => ({ ...r, sort_order: i })));
    const res = await Promise.all(
      list.map((r, i) => supabase.from("shop_hero_slides").update({ sort_order: i } as never).eq("id", r.id)),
    );
    if (res.some((r) => r.error)) toast.error("No se pudo reordenar");
    refresh();
  };

  const move = (i: number, dir: -1 | 1) => {
    const list = [...(rows ?? [])];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    persistOrder(list);
  };

  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const list = [...(rows ?? [])];
    const from = list.findIndex((r) => r.id === dragId);
    const to = list.findIndex((r) => r.id === targetId);
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    setDragId(null);
    persistOrder(list);
  };

  const preview: SlideView | null = form
    ? {
        id: "preview",
        image_url: form.image_url,
        image_mobile_url: form.image_mobile_url,
        eyebrow: form.eyebrow || null,
        title: form.title,
        subtitle: form.subtitle || null,
        cta: resolveCta(
          {
            show_cta: form.show_cta,
            cta_type: form.cta_type,
            cta_ref: form.cta_ref,
            cta_label: form.cta_label,
            cta_url: finalUrl(form),
          },
          products ? new Set(products.map((p) => p.handle)) : null,
        ),
      }
    : null;

  const set = (patch: Partial<Form>) => form && setForm({ ...form, ...patch });

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Carrusel de la tienda"
          action={
            <button
              onClick={() => {
                setProductQuery("");
                setForm({ ...EMPTY, sort_order: rows?.length ?? 0 });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva diapositiva
            </button>
          }
        />
        <Hint className="mb-3">
          Arrastra para ordenar (o usa las flechas). Las fechas se manejan en hora de Los Cabos.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !rows?.length ? (
          <EmptyRow text="Aún no hay diapositivas." />
        ) : (
          <ul className="divide-y divide-hairline">
            {rows.map((s, i) => {
              const broken = brokenReason(s, products);
              return (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => setDragId(s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropOn(s.id)}
                  className={`flex items-center gap-2 py-2.5 ${dragId === s.id ? "opacity-50" : ""}`}
                >
                  <GripVertical className="hidden h-4 w-4 shrink-0 cursor-grab text-muted-foreground md:block" />
                  <button onClick={() => edit(s)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-surface-2">
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-foreground">
                        {s.title || "Sin título"}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {s.show_cta && s.cta_label ? s.cta_label : "Sin botón"}
                        {(s.starts_at || s.ends_at) &&
                          ` · ${s.starts_at ? formatCabos(s.starts_at) : "…"} → ${s.ends_at ? formatCabos(s.ends_at) : "…"}`}
                      </span>
                      {broken && (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-destructive">
                          <AlertTriangle className="h-3 w-3" /> {broken}
                        </span>
                      )}
                    </span>
                    {!s.published && (
                      <span className="rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Oculta
                      </span>
                    )}
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Subir"
                      className="rounded-lg border border-hairline p-1.5 text-muted-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === rows.length - 1}
                      aria-label="Bajar"
                      className="rounded-lg border border-hairline p-1.5 text-muted-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Editar diapositiva" : "Nueva diapositiva"}
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
        {form && preview && (
          <>
            {form.image_url && (
              <div className="space-y-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vista previa
                </span>
                <div className="relative aspect-[7/2] w-full overflow-hidden rounded-xl border border-hairline">
                  <HeroSlideFrame slide={preview} />
                </div>
                <div className="relative mx-auto aspect-[20/9] w-[220px] overflow-hidden rounded-xl border border-hairline">
                  <HeroSlideFrame slide={preview} forceMobile />
                </div>
                <p className="text-center text-[10px] text-muted-foreground">Escritorio · Celular</p>
              </div>
            )}

            <ImageUploadField
              label="Imagen escritorio"
              value={form.image_url}
              onChange={(url) => set({ image_url: url })}
              folder={STORE_MEDIA_FOLDER as "tienda"}
              bucket={STORE_MEDIA_BUCKET}
              hint="Obligatoria · 16:9, mínimo 1600 px de ancho, máx 2 MB"
            />
            <ImageUploadField
              label="Imagen celular (opcional)"
              value={form.image_mobile_url}
              onChange={(url) => set({ image_mobile_url: url })}
              folder={STORE_MEDIA_FOLDER as "tienda"}
              bucket={STORE_MEDIA_BUCKET}
              hint="4:5, mínimo 1080 px de ancho. Si no hay, se usa la de escritorio"
            />

            <Field label="Etiqueta corta (opcional)">
              <input value={form.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} placeholder="Temporada 25/26" className={adminInput} />
            </Field>
            <Field label="Título (opcional)">
              <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Jersey Oficial" className={adminInput} />
            </Field>
            <Field label="Texto de apoyo (opcional)">
              <textarea value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} rows={2} className={adminInput} />
            </Field>

            <button
              type="button"
              onClick={() => set({ show_cta: !form.show_cta })}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                form.show_cta ? "border-primary/50 bg-primary/10 text-primary" : "border-hairline bg-surface-2 text-muted-foreground"
              }`}
            >
              {form.show_cta ? "Mostrar botón: sí" : "Mostrar botón: no"}
            </button>

            {form.show_cta && (
              <>
                <Field label="Texto del botón">
                  <input value={form.cta_label} onChange={(e) => set({ cta_label: e.target.value })} placeholder="Ver jerseys" className={adminInput} />
                </Field>
                <Field label="Destino">
                  <div className="grid grid-cols-4 gap-1">
                    {CTA_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => set({ cta_type: t.id })}
                        className={`rounded-lg border px-1 py-1.5 text-[11px] font-bold ${
                          form.cta_type === t.id ? "border-primary/50 bg-primary/10 text-primary" : "border-hairline text-muted-foreground"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>

                {form.cta_type === "store" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Línea">
                      <select
                        value={form.store_linea}
                        onChange={(e) => set({ store_linea: e.target.value, store_seccion: "", store_equipacion: "", store_tipo: "" })}
                        className={adminInput}
                      >
                        <option value="">Todas</option>
                        {lines.map((l) => <option key={l} value={l}>{STORE_LINE_LABELS[l]}</option>)}
                      </select>
                    </Field>
                    {sections.length > 0 && (
                      <Field label="Sección">
                        <select value={form.store_seccion} onChange={(e) => set({ store_seccion: e.target.value, store_tipo: "" })} className={adminInput}>
                          <option value="">Todas</option>
                          {sections.map((s) => <option key={s} value={s}>{sectionLabel(s)}</option>)}
                        </select>
                      </Field>
                    )}
                    {equips.length > 0 && (
                      <Field label="Equipación">
                        <select value={form.store_equipacion} onChange={(e) => set({ store_equipacion: e.target.value, store_tipo: "" })} className={adminInput}>
                          <option value="">Todas</option>
                          {equips.map((s) => <option key={s} value={s}>{equipacionLabel(s)}</option>)}
                        </select>
                      </Field>
                    )}
                    <Field label="Tipo">
                      <select value={form.store_tipo} onChange={(e) => set({ store_tipo: e.target.value })} className={adminInput}>
                        <option value="">Todos</option>
                        {types.map((t) => <option key={t} value={t}>{storeTypeLabel(t)}</option>)}
                      </select>
                    </Field>
                    <p className="col-span-2 truncate text-[11px] text-muted-foreground">{storeUrl(form)}</p>
                  </div>
                )}

                {form.cta_type === "product" && (
                  <Field label="Producto">
                    <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Buscar producto…" className={adminInput} />
                    {form.cta_ref && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Elegido: {products?.find((p) => p.handle === form.cta_ref)?.title ?? `${form.cta_ref} (no disponible)`}
                      </p>
                    )}
                    <ul className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-hairline">
                      {productResults.map((p) => (
                        <li key={p.handle}>
                          <button
                            type="button"
                            onClick={() => set({ cta_ref: p.handle })}
                            className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs ${
                              form.cta_ref === p.handle ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-2"
                            }`}
                          >
                            {p.images[0] && <img src={p.images[0]} alt="" className="h-7 w-7 rounded-md object-cover" />}
                            <span className="truncate">{p.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Field>
                )}

                {form.cta_type === "page" && (
                  <Field label="Página del sitio">
                    <select value={form.cta_url} onChange={(e) => set({ cta_url: e.target.value })} className={adminInput}>
                      <option value="">Elige una página</option>
                      {SITE_PAGES.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
                    </select>
                  </Field>
                )}

                {form.cta_type === "external" && (
                  <Field label="URL externa (se abre en otra pestaña)">
                    <input value={form.cta_url} onChange={(e) => set({ cta_url: e.target.value })} placeholder="https://…" className={adminInput} />
                  </Field>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Inicio (hora Los Cabos)">
                <input type="datetime-local" value={form.starts_at} onChange={(e) => set({ starts_at: e.target.value })} className={adminInput} />
              </Field>
              <Field label="Fin (hora Los Cabos)">
                <input type="datetime-local" value={form.ends_at} onChange={(e) => set({ ends_at: e.target.value })} className={adminInput} />
              </Field>
            </div>
            <Hint>Deja las fechas vacías para mostrarla siempre.</Hint>

            <button
              type="button"
              onClick={() => set({ published: !form.published })}
              className={`w-full rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                form.published ? "border-primary/50 bg-primary/10 text-primary" : "border-hairline bg-surface-2 text-muted-foreground"
              }`}
            >
              {form.published ? "Activa" : "Inactiva"}
            </button>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

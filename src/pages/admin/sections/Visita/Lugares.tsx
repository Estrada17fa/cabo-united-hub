import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { PlacePickerMap } from "@/components/admin/PlacePickerMap";
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
  PlaceCategory,
  SPONSOR_GOLD,
} from "@/lib/visita-los-cabos-data";
import { useCategoryMeta } from "@/hooks/usePlaceCategories";


const TIERS = [
  { id: "basico", label: "Normal" },
  { id: "destacado", label: "Destacado" },
  { id: "patrocinador", label: "Patrocinador Oficial" },
];

interface Form {
  id?: string;
  name: string;
  category: PlaceCategory;
  tier: string;
  description: string;
  area: string;
  hours: string;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  logo_url: string | null;
  photo_gradient: string | null;
  whatsapp: string;
  visited_by: string;
  going_today: string;
  rating: string;
  featured: boolean;
  published: boolean;
  sort_order: string;
}

const EMPTY: Form = {
  name: "",
  category: "restaurantes",
  tier: "basico",
  description: "",
  area: "",
  hours: "",
  lat: null,
  lng: null,
  photo_url: null,
  logo_url: null,
  photo_gradient: null,
  whatsapp: "",
  visited_by: "",
  going_today: "",
  rating: "",
  featured: false,
  published: true,
  sort_order: "0",
};

const num = (v: string) => (v.trim() === "" ? null : Number(v));

export default function Lugares() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const { categories, metaFor } = useCategoryMeta();


  const { data: places, isLoading } = useQuery({
    queryKey: ["admin-places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-places"] });
    qc.invalidateQueries({ queryKey: ["places", "public"] });
    qc.invalidateQueries({ queryKey: ["fan_routes", "public"] });
  };

  const edit = (row: any) =>
    setForm({
      id: row.id,
      name: row.name ?? "",
      category: row.category,
      tier: row.tier,
      description: row.description ?? "",
      area: row.area ?? "",
      hours: row.hours ?? "",
      lat: row.lat != null ? Number(row.lat) : null,
      lng: row.lng != null ? Number(row.lng) : null,
      photo_url: row.photo_url,
      logo_url: row.logo_url ?? null,
      photo_gradient: row.photo_gradient,
      whatsapp: row.whatsapp ?? "",
      visited_by: row.visited_by?.toString() ?? "",
      going_today: row.going_today?.toString() ?? "",
      rating: row.rating?.toString() ?? "",
      featured: !!row.featured,
      published: !!row.published,
      sort_order: (row.sort_order ?? 0).toString(),
    });

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    if (form.lat == null || form.lng == null)
      return toast.error("Fija la ubicación en el mapa");

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      tier: form.tier,
      description: form.description.trim() || null,
      area: form.area.trim() || null,
      hours: form.hours.trim() || null,
      lat: form.lat,
      lng: form.lng,
      photo_url: form.photo_url,
      logo_url: form.logo_url,
      photo_gradient: form.photo_gradient,
      whatsapp: form.whatsapp.trim() || null,
      visited_by: num(form.visited_by),
      going_today: num(form.going_today),
      rating: num(form.rating),
      featured: form.featured,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
    };

    const { error } = form.id
      ? await supabase.from("places").update(payload as never).eq("id", form.id)
      : await supabase.from("places").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Lugar guardado");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("places").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Lugar eliminado");
    setForm(null);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Lugares"
          action={
            <button
              onClick={() => setForm({ ...EMPTY })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo lugar
            </button>
          }
        />
        <Hint className="mb-3">
          Restaurantes, bares, tours, tiendas y hoteles. Los borradores no se ven
          en el sitio. Las estadísticas son manuales por ahora: si las dejas
          vacías, no se muestran.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !places?.length ? (
          <EmptyRow text="Aún no hay lugares capturados." />
        ) : (
          <ul className="divide-y divide-hairline">
            {places.map((p: any) => {
              const meta = metaFor(p.category as PlaceCategory);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => edit(p)}
                    className="flex w-full items-center gap-3 py-2.5 text-left"
                  >
                    <span
                      className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-hairline"
                      style={{ background: p.photo_gradient || "transparent" }}
                    >
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="h-full w-full object-contain p-1" />
                      ) : p.photo_url ? (
                        <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-bold text-foreground">
                          {p.name}
                        </span>
                        {p.tier === "patrocinador" && (
                          <Star
                            className="h-3 w-3 shrink-0"
                            style={{ color: SPONSOR_GOLD, fill: SPONSOR_GOLD }}
                          />
                        )}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        <span style={{ color: meta?.color }}>{meta?.label}</span>
                        {p.area ? ` · ${p.area}` : ""}
                      </span>
                    </span>
                    {!p.published && (
                      <span className="rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Borrador
                      </span>
                    )}
                    {(p.lat == null || p.lng == null) && (
                      <MapPin className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Editar lugar" : "Nuevo lugar"}
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
                className={adminInput}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Tipo">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as PlaceCategory })
                  }
                  className={adminInput}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}

                </select>
              </Field>
              <Field label="Nivel">
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  className={adminInput}
                >
                  {TIERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Descripción">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={adminInput}
              />
            </Field>

            <PlacePickerMap
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm({ ...form, lat, lng })}
            />

            <div className="grid grid-cols-2 gap-2">
              <Field label="Zona / corredor">
                <input
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="Corredor Turístico"
                  className={adminInput}
                />
              </Field>
              <Field label="Horario (texto)">
                <input
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="Abre a las 5:00 PM"
                  className={adminInput}
                />
              </Field>
            </div>

            <Field label="WhatsApp (teléfono)">
              <input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+52 624 000 0000"
                className={adminInput}
              />
            </Field>
            <Hint>El botón “Cómo llegar” se genera solo con las coordenadas.</Hint>

            <ImageUploadField
              label="Foto del lugar"
              value={form.photo_url}
              onChange={(url) => setForm({ ...form, photo_url: url })}
              folder="places"
              hint="Si no subes foto, se usa el color del lugar."
            />

            <ImageUploadField
              label="Logo del lugar"
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              folder="place-logos"
              hint="Se muestra dentro del pin del mapa. PNG sin fondo."
            />

            <Field label="Color / degradado">
              <select
                value={form.photo_gradient ?? ""}
                onChange={(e) =>
                  setForm({ ...form, photo_gradient: e.target.value || null })
                }
                className={adminInput}
              >
                <option value="">Automático por tipo</option>
                {GRADIENT_PRESETS.map((g) => (
                  <option key={g.label} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            {form.photo_gradient && (
              <div
                className="h-8 rounded-xl border border-hairline"
                style={{ background: form.photo_gradient }}
              />
            )}

            <div className="grid grid-cols-3 gap-2">
              <Field label="Fans visitaron">
                <input
                  value={form.visited_by}
                  onChange={(e) => setForm({ ...form, visited_by: e.target.value })}
                  inputMode="numeric"
                  className={adminInput}
                />
              </Field>
              <Field label="Van hoy">
                <input
                  value={form.going_today}
                  onChange={(e) => setForm({ ...form, going_today: e.target.value })}
                  inputMode="numeric"
                  className={adminInput}
                />
              </Field>
              <Field label="Rating">
                <input
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  inputMode="decimal"
                  placeholder="4.8"
                  className={adminInput}
                />
              </Field>
            </div>

            <Field label="Orden">
              <input
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                inputMode="numeric"
                className={adminInput}
              />
            </Field>

            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Destacado esta semana
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Publicado
            </label>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

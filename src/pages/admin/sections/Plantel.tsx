import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface FormState {
  id?: string;
  name: string;
  jersey_number: string;
  position: string;
  short_bio: string;
  photo_url: string | null;
  active: boolean;
}

const EMPTY: FormState = {
  name: "",
  jersey_number: "",
  position: "",
  short_bio: "",
  photo_url: null,
  active: true,
};

export default function Plantel() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: players, isLoading } = useQuery({
    queryKey: ["admin-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("jersey_number", { nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-players"] });
    qc.invalidateQueries({ queryKey: ["admin-players-min"] });
    qc.invalidateQueries({ queryKey: ["lcu-players"] });
  };

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      jersey_number: form.jersey_number === "" ? null : Number(form.jersey_number),
      position: form.position.trim() || null,
      short_bio: form.short_bio.trim() || null,
      photo_url: form.photo_url,
      active: form.active,
    };
    const { error } = form.id
      ? await supabase.from("players").update(payload as never).eq("id", form.id)
      : await supabase.from("players").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Jugador guardado");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("players").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Jugador eliminado");
    setForm(null);
    refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-base font-bold text-foreground">Plantel</h1>

      <div className={adminCard}>
        <SectionTitle
          title={`Jugadores (${players?.length ?? 0})`}
          action={
            <button
              onClick={() => setForm(EMPTY)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar jugador
            </button>
          }
        />

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !players?.length ? (
          <EmptyRow text="Sin jugadores registrados." />
        ) : (
          <div className="space-y-2">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  setForm({
                    id: p.id,
                    name: p.name,
                    jersey_number: p.jersey_number != null ? String(p.jersey_number) : "",
                    position: p.position ?? "",
                    short_bio: p.short_bio ?? "",
                    photo_url: p.photo_url,
                    active: p.active,
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
              >
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[p.position, p.active ? "Activo" : "Inactivo"].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums text-primary">
                  {p.jersey_number != null ? `#${p.jersey_number}` : "—"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Editar jugador" : "Nuevo jugador"}
        footer={
          <div className="space-y-2">
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar jugador"}
            </button>
            {form?.id && (
              <button
                onClick={remove}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar jugador
              </button>
            )}
          </div>
        }
      >
        {form && (
          <>
            <Field label="Nombre">
              <input
                className={adminInput}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dorsal">
                <input
                  type="number"
                  className={adminInput}
                  value={form.jersey_number}
                  onChange={(e) => setForm({ ...form, jersey_number: e.target.value })}
                />
              </Field>
              <Field label="Posición">
                <input
                  className={adminInput}
                  value={form.position}
                  placeholder="Delantero"
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Bio corta">
              <textarea
                rows={3}
                className={adminInput}
                value={form.short_bio}
                onChange={(e) => setForm({ ...form, short_bio: e.target.value })}
              />
            </Field>
            <ImageUploadField
              label="Foto"
              folder="players"
              value={form.photo_url}
              onChange={(url) => setForm({ ...form, photo_url: url })}
              hint="PNG o JPG · máx 2 MB"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              Activo en el plantel
            </label>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

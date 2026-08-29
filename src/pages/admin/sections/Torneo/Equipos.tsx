import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeasonGroups, useSeasonKey, useTeams } from "@/hooks/useLeague";
import type { Team } from "@/components/match-zone/types";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface FormState {
  id?: string;
  name: string;
  short_name: string;
  city: string;
  group_name: string;
  venue: string;
  logo_url: string | null;
  is_ours: boolean;
  active: boolean;
}

const EMPTY: FormState = {
  name: "",
  short_name: "",
  city: "",
  group_name: "",
  venue: "",
  logo_url: null,
  is_ours: false,
  active: true,
};

export default function Equipos() {
  const season = useSeasonKey();
  const groups = useSeasonGroups();
  const qc = useQueryClient();
  const { data: teams, isLoading } = useTeams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["lcu-teams"] });

  const openEdit = (t: Team) => {
    setForm({
      id: t.id,
      name: t.name,
      short_name: t.short_name ?? "",
      city: t.city ?? "",
      group_name: t.group_name ?? "",
      venue: t.venue ?? "",
      logo_url: t.logo_url,
      is_ours: t.is_ours,
      active: t.active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("El nombre del equipo es obligatorio");
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      short_name: form.short_name.trim() || null,
      city: form.city.trim() || null,
      group_name: form.group_name.trim() || null,
      venue: form.venue.trim() || null,
      logo_url: form.logo_url,
      is_ours: form.is_ours,
      active: form.active,
      season,
    };

    if (form.is_ours) {
      await supabase.from("teams").update({ is_ours: false } as never).eq("season", season);
    }

    const { error } = form.id
      ? await supabase.from("teams").update(payload as never).eq("id", form.id)
      : await supabase.from("teams").insert(payload as never);

    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Equipo guardado");
    setOpen(false);
    refresh();
  };

  const remove = async () => {
    if (!form.id) return;
    const { error } = await supabase.from("teams").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Equipo eliminado");
    setOpen(false);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title={`Equipos participantes (${teams?.length ?? 0})`}
          action={
            <button
              onClick={() => {
                setForm(EMPTY);
                setOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar equipo
            </button>
          }
        />
        <Hint className="mb-3">
          La sede de cada equipo se usa para autollenar la sede del partido cuando ese equipo es local.
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !teams?.length ? (
          <EmptyRow text="Sin equipos en este torneo." />
        ) : (
          <div className="space-y-2">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => openEdit(t)}
                className="flex w-full items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-surface-1">
                  {t.logo_url ? (
                    <img src={t.logo_url} alt={t.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {t.name}
                    {t.is_ours && (
                      <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                        Nuestro
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[t.short_name, t.city, t.venue, t.group_name && `Grupo ${t.group_name}`]
                      .filter(Boolean)
                      .join(" · ") || "Sin datos adicionales"}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-primary">Editar</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AdminSheet
        open={open}
        onOpenChange={setOpen}
        title={form.id ? "Editar equipo" : "Nuevo equipo"}
        footer={
          <div className="space-y-2">
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar equipo"}
            </button>
            {form.id && (
              <button
                onClick={remove}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar equipo
              </button>
            )}
          </div>
        }
      >
        <Field label="Nombre">
          <input
            className={adminInput}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre corto">
            <input
              className={adminInput}
              value={form.short_name}
              placeholder="LCU"
              onChange={(e) => setForm({ ...form, short_name: e.target.value })}
            />
          </Field>
          <Field label="Ciudad">
            <input
              className={adminInput}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Grupo">
            {groups.length ? (
              <select
                className={adminInput}
                value={form.group_name}
                onChange={(e) => setForm({ ...form, group_name: e.target.value })}
              >
                <option value="">Sin grupo</option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    Grupo {g}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={adminInput}
                value={form.group_name}
                placeholder="Define los grupos en Configuración"
                onChange={(e) => setForm({ ...form, group_name: e.target.value })}
              />
            )}
          </Field>
          <Field label="Sede habitual">
            <input
              className={adminInput}
              value={form.venue}
              placeholder="Estadio Don Koll"
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </Field>
        </div>

        <ImageUploadField
          label="Escudo"
          folder="teams"
          value={form.logo_url}
          onChange={(url) => setForm({ ...form, logo_url: url })}
          hint="PNG con fondo transparente · máx 2 MB"
        />

        <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <input
            type="checkbox"
            checked={form.is_ours}
            onChange={(e) => setForm({ ...form, is_ours: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          Este es nuestro equipo (Los Cabos United)
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          Activo en el torneo
        </label>
      </AdminSheet>
    </div>
  );
}

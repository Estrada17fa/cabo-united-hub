import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeasons } from "@/hooks/useLeague";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface Rules {
  win_home: number;
  win_away: number;
  win_away_by2: number;
  draw: number;
  draw_shootout_winner: number;
  loss: number;
}

const DEFAULT_RULES: Rules = {
  win_home: 3,
  win_away: 3,
  win_away_by2: 4,
  draw: 1,
  draw_shootout_winner: 2,
  loss: 0,
};

interface FormState {
  id?: string;
  name: string;
  season_key: string;
  start_date: string;
  end_date: string;
  cc_reset_date: string;
  status: string;
  qualifiers_count: number;
  logo_url: string | null;
  rules: Rules;
  groups: string[];
}

const EMPTY: FormState = {
  name: "",
  season_key: "",
  start_date: "",
  end_date: "",
  cc_reset_date: "",
  status: "active",
  qualifiers_count: 4,
  logo_url: null,
  rules: DEFAULT_RULES,
  groups: [],
};

const LETTERS = "ABCDEFGH".split("");

/** Ajusta la lista de nombres al número de grupos elegido. */
const resizeGroups = (current: string[], count: number) =>
  Array.from({ length: count }, (_, i) => current[i] ?? LETTERS[i] ?? String(i + 1));

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Próximo",
  active: "En curso",
  reset_warning: "Aviso de reinicio",
  closed: "Terminado",
};

const RULE_FIELDS: { key: keyof Rules; label: string }[] = [
  { key: "win_home", label: "Ganar de local" },
  { key: "win_away", label: "Ganar de visita" },
  { key: "win_away_by2", label: "Ganar de visita por 2+" },
  { key: "draw", label: "Empate" },
  { key: "draw_shootout_winner", label: "Empate 2+ y gana penales" },
  { key: "loss", label: "Derrota" },
];

export default function Config() {
  const qc = useQueryClient();
  const { data: seasons, isLoading } = useSeasons();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["lcu-seasons"] });
    qc.invalidateQueries({ queryKey: ["lcu-active-season"] });
  };

  const openNew = () => {
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (s: (typeof seasons)[number]) => {
    const r = (s.points_rules ?? {}) as Partial<Rules>;
    setForm({
      id: s.id,
      name: s.name,
      season_key: s.season_key ?? "",
      start_date: s.start_date ?? "",
      end_date: s.end_date ?? "",
      cc_reset_date: (s as { cc_reset_date?: string }).cc_reset_date ?? s.end_date ?? "",
      status: s.status ?? "active",
      qualifiers_count: s.qualifiers_count ?? 4,
      logo_url: s.logo_url ?? null,
      rules: { ...DEFAULT_RULES, ...r },
      groups: (s.groups ?? []).filter(Boolean),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.season_key.trim()) return toast.error("Nombre y clave son obligatorios");
    if (!form.start_date || !form.end_date) return toast.error("Faltan las fechas del torneo");

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      season_key: form.season_key.trim(),
      start_date: form.start_date,
      end_date: form.end_date,
      cc_reset_date: form.cc_reset_date || form.end_date,
      status: form.status,
      qualifiers_count: form.qualifiers_count,
      logo_url: form.logo_url,
      points_rules: form.rules,
      groups: form.groups.map((g) => g.trim()).filter(Boolean),
    };

    const { error } = form.id
      ? await supabase.from("seasons").update(payload as never).eq("id", form.id)
      : await supabase.from("seasons").insert(payload as never);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Torneo guardado");
    setOpen(false);
    refresh();
  };

  const markActive = async (id: string) => {
    await supabase.from("seasons").update({ is_active: false } as never).neq("id", id);
    const { error } = await supabase.from("seasons").update({ is_active: true } as never).eq("id", id);
    if (error) return toast.error("No se pudo activar", { description: error.message });
    toast.success("Torneo activo actualizado");
    refresh();
    qc.invalidateQueries({ queryKey: ["lcu-matches"] });
    qc.invalidateQueries({ queryKey: ["lcu-teams"] });
    qc.invalidateQueries({ queryKey: ["lcu-standings"] });
    qc.invalidateQueries({ queryKey: ["lcu-scorers"] });
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Torneos"
          action={
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo torneo
            </button>
          }
        />
        <Hint className="mb-3">
          El torneo marcado como activo es el que lee Match Zone e Inicio (nombre, clave de temporada,
          reglas de puntos y clasificados).
        </Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !seasons?.length ? (
          <EmptyRow text="Aún no hay torneos. Crea el primero." />
        ) : (
          <div className="space-y-2">
            {seasons.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-surface-1">
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    <Star className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {s.season_key} · {STATUS_LABEL[s.status] ?? s.status} · {s.qualifiers_count ?? 4}{" "}
                    clasifican
                    {s.groups?.length ? ` · ${s.groups.length} grupos` : " · tabla única"}
                  </p>
                </div>
                {s.is_active ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                    <CheckCircle2 className="h-3 w-3" /> Activo
                  </span>
                ) : (
                  <button
                    onClick={() => markActive(s.id)}
                    className="rounded-lg border border-hairline px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  >
                    Marcar activo
                  </button>
                )}
                <button
                  onClick={() => openEdit(s)}
                  className="rounded-lg border border-hairline px-2.5 py-1 text-[11px] font-semibold text-foreground"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminSheet
        open={open}
        onOpenChange={setOpen}
        title={form.id ? "Editar torneo" : "Nuevo torneo"}
        footer={
          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar torneo"}
          </button>
        }
      >
        <Field label="Nombre real del torneo">
          <input
            className={adminInput}
            value={form.name}
            placeholder="Primera Premier"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Clave de temporada">
          <input
            className={adminInput}
            value={form.season_key}
            placeholder="2026"
            onChange={(e) => setForm({ ...form, season_key: e.target.value })}
          />
        </Field>
        <Hint>Equipos, partidos, posiciones y goleo se guardan con esta clave.</Hint>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio">
            <input
              type="date"
              className={adminInput}
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </Field>
          <Field label="Fin">
            <input
              type="date"
              className={adminInput}
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estado">
            <select
              className={adminInput}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="upcoming">Próximo</option>
              <option value="active">En curso</option>
              <option value="closed">Terminado</option>
            </select>
          </Field>
          <Field label="Clasificados">
            <input
              type="number"
              min={0}
              className={adminInput}
              value={form.qualifiers_count}
              onChange={(e) => setForm({ ...form, qualifiers_count: Number(e.target.value) })}
            />
          </Field>
        </div>

        <ImageUploadField
          label="Logo del torneo"
          folder="tournaments"
          value={form.logo_url}
          onChange={(url) => setForm({ ...form, logo_url: url })}
          hint="PNG, JPG, WEBP o SVG · máx 2 MB"
        />

        <div className="rounded-xl border border-hairline bg-surface-2 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Grupos
          </p>
          <Field label="¿Cuántos grupos son?">
            <select
              className={adminInput}
              value={form.groups.length}
              onChange={(e) =>
                setForm({ ...form, groups: resizeGroups(form.groups, Number(e.target.value)) })
              }
            >
              <option value={0}>Sin grupos (tabla única)</option>
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} grupos
                </option>
              ))}
            </select>
          </Field>

          {form.groups.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {form.groups.map((g, i) => (
                <Field key={i} label={`Nombre del grupo ${i + 1}`}>
                  <input
                    className={adminInput}
                    value={g}
                    placeholder={LETTERS[i] ?? String(i + 1)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        groups: form.groups.map((x, idx) => (idx === i ? e.target.value : x)),
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          )}
          <Hint className="mt-2">
            Estos nombres son los que se eligen en Equipos y en los partidos, y el orden en que aparecen
            las pestañas de posiciones en Match Zone. Los partidos entre grupos suman a la tabla del grupo
            de cada equipo.
          </Hint>
        </div>

        <div className="rounded-xl border border-hairline bg-surface-2 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Reglas de puntos
          </p>
          <div className="grid grid-cols-2 gap-2">
            {RULE_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <input
                  type="number"
                  className={adminInput}
                  value={form.rules[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, rules: { ...form.rules, [f.key]: Number(e.target.value) } })
                  }
                />
              </Field>
            ))}
          </div>
          <Hint className="mt-2">
            El cálculo automático de la tabla usa estas reglas ya implementadas en el sistema
            (victoria, bonus de visita por 2+, empate con penales y desempate por diferencia y goles a
            favor).
          </Hint>
        </div>
      </AdminSheet>
    </div>
  );
}

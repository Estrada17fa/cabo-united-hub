import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useScorers, useSeasonKey, useTeams } from "@/hooks/useLeague";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, Hint, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface FormState {
  id?: string;
  player_id: string;
  player_name: string;
  team_id: string;
  goals: number;
  assists: number;
  matches_played: number;
}

const EMPTY: FormState = {
  player_id: "",
  player_name: "",
  team_id: "",
  goals: 0,
  assists: 0,
  matches_played: 0,
};

function usePlayers() {
  return useQuery({
    queryKey: ["admin-players-min"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, jersey_number, photo_url")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function Goleo() {
  const season = useSeasonKey();
  const qc = useQueryClient();
  const { data: scorers, isLoading } = useScorers();
  const { data: teams } = useTeams();
  const { data: players } = usePlayers();
  const [form, setForm] = useState<FormState | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["lcu-scorers"] });

  const save = async () => {
    if (!form) return;
    const name = form.player_id
      ? players?.find((p) => p.id === form.player_id)?.name ?? form.player_name
      : form.player_name;
    if (!name?.trim()) return toast.error("Elige un jugador o escribe su nombre");

    const payload = {
      season,
      player_id: form.player_id || null,
      player_name: name.trim(),
      team_id: form.team_id || null,
      goals: form.goals,
      assists: form.assists,
      matches_played: form.matches_played,
    };

    const { error } = form.id
      ? await supabase.from("top_scorers").update(payload as never).eq("id", form.id)
      : await supabase.from("top_scorers").insert(payload as never);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success("Goleo actualizado");
    setForm(null);
    refresh();
  };

  const remove = async () => {
    if (!form?.id) return;
    const { error } = await supabase.from("top_scorers").delete().eq("id", form.id);
    if (error) return toast.error("No se pudo eliminar", { description: error.message });
    toast.success("Registro eliminado");
    setForm(null);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title="Tabla de goleo"
          action={
            <button
              onClick={() => setForm(EMPTY)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar goleador
            </button>
          }
        />
        <Hint className="mb-3">Captura manual: jugador, club y goles. No se acumula de los partidos.</Hint>

        {isLoading ? (
          <EmptyRow text="Cargando…" />
        ) : !scorers?.length ? (
          <EmptyRow text="Sin goleadores capturados." />
        ) : (
          <div className="space-y-2">
            {scorers.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  setForm({
                    id: s.id,
                    player_id: s.player_id ?? "",
                    player_name: s.player_name,
                    team_id: s.team_id ?? "",
                    goals: s.goals,
                    assists: s.assists,
                    matches_played: s.matches_played,
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
              >
                {s.player?.photo_url ? (
                  <img
                    src={s.player.photo_url}
                    alt={s.player_name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-1 text-[11px] font-bold text-muted-foreground">
                    {s.player_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{s.player_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {s.team?.name ?? "Sin club"} · {s.matches_played} PJ
                  </p>
                </div>
                <span className="font-mono text-lg font-bold tabular-nums text-primary">{s.goals}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AdminSheet
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Editar goleador" : "Nuevo goleador"}
        footer={
          <div className="space-y-2">
            <button
              onClick={save}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
            >
              Guardar
            </button>
            {form?.id && (
              <button
                onClick={remove}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            )}
          </div>
        }
      >
        {form && (
          <>
            <Field label="Jugador del plantel (opcional)">
              <select
                className={adminInput}
                value={form.player_id}
                onChange={(e) => setForm({ ...form, player_id: e.target.value })}
              >
                <option value="">— Escribir nombre manualmente —</option>
                {players?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.jersey_number ? `#${p.jersey_number} ` : ""}
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            {!form.player_id && (
              <Field label="Nombre del jugador">
                <input
                  className={adminInput}
                  value={form.player_name}
                  onChange={(e) => setForm({ ...form, player_name: e.target.value })}
                />
              </Field>
            )}
            <Field label="Club">
              <select
                className={adminInput}
                value={form.team_id}
                onChange={(e) => setForm({ ...form, team_id: e.target.value })}
              >
                <option value="">— Sin club —</option>
                {teams?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Goles">
                <input
                  type="number"
                  min={0}
                  className={adminInput}
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: Number(e.target.value) })}
                />
              </Field>
              <Field label="Asist.">
                <input
                  type="number"
                  min={0}
                  className={adminInput}
                  value={form.assists}
                  onChange={(e) => setForm({ ...form, assists: Number(e.target.value) })}
                />
              </Field>
              <Field label="PJ">
                <input
                  type="number"
                  min={0}
                  className={adminInput}
                  value={form.matches_played}
                  onChange={(e) => setForm({ ...form, matches_played: Number(e.target.value) })}
                />
              </Field>
            </div>
          </>
        )}
      </AdminSheet>
    </div>
  );
}

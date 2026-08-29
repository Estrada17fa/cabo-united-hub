import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface Lead {
  id: string;
  interest: string;
  business_name: string;
  business_type: string | null;
  contact_name: string;
  contact_role: string | null;
  email: string;
  phone: string;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  city: string | null;
  address: string | null;
  description: string | null;
  goals: string | null;
  budget_range: string | null;
  referral_source: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Nueva", cls: "border-primary/40 bg-primary/10 text-primary" },
  contacted: { label: "En contacto", cls: "border-hairline bg-surface-2 text-secondary-fg" },
  approved: { label: "Aprobada", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  rejected: { label: "Descartada", cls: "border-hairline bg-surface-2 text-muted-foreground" },
};

const INTEREST: Record<string, string> = {
  patrocinio: "Patrocinio",
  mapa: "Visita Los Cabos",
  ambos: "Patrocinio + Mapa",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SolicitudesMarca() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-brand-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  const pending = (leads ?? []).filter((l) => l.status === "new").length;

  const updateStatus = async (id: string, status: string, admin_notes?: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("brand_leads")
      .update({ status, ...(admin_notes !== undefined ? { admin_notes } : {}) })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar");
      return;
    }
    toast.success("Solicitud actualizada");
    qc.invalidateQueries({ queryKey: ["admin-brand-leads"] });
    setOpen(null);
  };

  const remove = async (id: string) => {
    if (!confirm("¿Borrar esta solicitud?")) return;
    const { error } = await supabase.from("brand_leads").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo borrar");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-brand-leads"] });
    setOpen(null);
  };

  const exportCsv = () => {
    const rows = leads ?? [];
    if (rows.length === 0) return;
    const cols = Object.keys(rows[0]) as (keyof Lead)[];
    const csv = [
      cols.join(","),
      ...rows.map((r) =>
        cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `solicitudes-marca-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title={`Solicitudes de marca${pending > 0 ? ` · ${pending} nuevas` : ""}`}
          action={
            <button
              onClick={exportCsv}
              disabled={!leads || leads.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline px-3 py-2 text-[12px] font-semibold text-secondary-fg disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !leads || leads.length === 0 ? (
          <EmptyRow text="Aún no hay solicitudes." />
        ) : (
          <ul className="divide-y divide-hairline">
            {leads.map((l) => {
              const st = STATUS[l.status] ?? STATUS.new;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => {
                      setOpen(l);
                      setNotes(l.admin_notes ?? "");
                    }}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{l.business_name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {INTEREST[l.interest] ?? l.interest} · {l.contact_name} · {fmt(l.created_at)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>
                      {st.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AdminSheet
        open={!!open}
        onOpenChange={(v) => !v && setOpen(null)}
        title={open?.business_name ?? ""}
        footer={
          open ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS).map(([key, s]) => (
                  <button
                    key={key}
                    disabled={saving}
                    onClick={() => updateStatus(open.id, key, notes)}
                    className={`rounded-xl border px-3 py-2 text-[12px] font-semibold ${
                      open.status === key ? s.cls : "border-hairline text-secondary-fg"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => remove(open.id)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Borrar solicitud
              </button>
            </div>
          ) : undefined
        }
      >
        {open && (
          <div className="space-y-3 text-sm">
            <Row label="Interés" value={INTEREST[open.interest] ?? open.interest} />
            <Row label="Giro" value={open.business_type} />
            <Row label="Contacto" value={`${open.contact_name}${open.contact_role ? ` · ${open.contact_role}` : ""}`} />
            <Row label="Correo" value={open.email} />
            <Row label="Teléfono" value={open.phone} />
            <Row label="Sitio web" value={open.website} />
            <Row label="Instagram" value={open.instagram} />
            <Row label="Facebook" value={open.facebook} />
            <Row label="Ciudad" value={open.city} />
            <Row label="Dirección" value={open.address} />
            <Row label="Descripción" value={open.description} />
            <Row label="Qué busca" value={open.goals} />
            <Row label="Presupuesto" value={open.budget_range} />
            <Row label="Nos conoció por" value={open.referral_source} />
            <Row label="Recibida" value={fmt(open.created_at)} />
            <Field label="Notas internas">
              <textarea
                rows={4}
                className={adminInput}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
              />
            </Field>
          </div>
        )}
      </AdminSheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <p className="whitespace-pre-wrap break-words text-[13px] text-foreground">{value}</p>
    </div>
  );
}

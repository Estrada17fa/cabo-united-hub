import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { EmptyRow, Field, SectionTitle, adminCard, adminInput } from "@/components/admin/AdminUI";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Nuevo", cls: "border-primary/40 bg-primary/10 text-primary" },
  read: { label: "Leído", cls: "border-hairline bg-surface-2 text-secondary-fg" },
  answered: { label: "Atendido", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
};

const SUBJECTS: Record<string, string> = {
  general: "Información general",
  prensa: "Prensa y medios",
  juvenil: "Fuerzas juveniles",
  tienda: "Tienda y pedidos",
  otro: "Otro",
};

function fmt(d: string) {
  return new Date(d).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MensajesContacto() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<Message | null>(null);
  const [notes, setNotes] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  const pending = (messages ?? []).filter((m) => m.status === "new").length;

  const update = async (id: string, status: string, admin_notes?: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status, ...(admin_notes !== undefined ? { admin_notes } : {}) })
      .eq("id", id);
    if (error) {
      toast.error("No se pudo guardar");
      return;
    }
    toast.success("Mensaje actualizado");
    qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    setOpen(null);
  };

  const remove = async (id: string) => {
    if (!confirm("¿Borrar este mensaje?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo borrar");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    setOpen(null);
  };

  const exportCsv = () => {
    const rows = messages ?? [];
    if (rows.length === 0) return;
    const cols = Object.keys(rows[0]) as (keyof Message)[];
    const csv = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mensajes-contacto-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className={adminCard}>
        <SectionTitle
          title={`Mensajes de contacto${pending > 0 ? ` · ${pending} nuevos` : ""}`}
          action={
            <button
              onClick={exportCsv}
              disabled={!messages || messages.length === 0}
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
        ) : !messages || messages.length === 0 ? (
          <EmptyRow text="Aún no hay mensajes." />
        ) : (
          <ul className="divide-y divide-hairline">
            {messages.map((m) => {
              const st = STATUS[m.status] ?? STATUS.new;
              return (
                <li key={m.id}>
                  <button
                    onClick={() => {
                      setOpen(m);
                      setNotes(m.admin_notes ?? "");
                      if (m.status === "new") update(m.id, "read");
                    }}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{m.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {SUBJECTS[m.subject] ?? m.subject} · {fmt(m.created_at)}
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
        title={open?.name ?? ""}
        footer={
          open ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(STATUS).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => update(open.id, key, notes)}
                    className={`rounded-xl border px-2 py-2 text-[12px] font-semibold ${
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
                <Trash2 className="h-3.5 w-3.5" /> Borrar mensaje
              </button>
            </div>
          ) : undefined
        }
      >
        {open && (
          <div className="space-y-3">
            <Row label="Asunto" value={SUBJECTS[open.subject] ?? open.subject} />
            <Row label="Correo" value={open.email} />
            <Row label="Teléfono" value={open.phone} />
            <Row label="Recibido" value={fmt(open.created_at)} />
            <Row label="Mensaje" value={open.message} />
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

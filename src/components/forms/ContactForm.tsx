import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SUBJECTS = [
  { value: "general", label: "Información general" },
  { value: "prensa", label: "Prensa y medios" },
  { value: "juvenil", label: "Fuerzas juveniles" },
  { value: "tienda", label: "Tienda y pedidos" },
  { value: "otro", label: "Otro" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(120),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(1).max(40),
  message: z.string().trim().min(5, "Cuéntanos un poco más").max(2000),
});

const inputCls =
  "w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", phone: "", subject: "general", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    const parsed = schema.safeParse(v);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("contact_messages").insert({
      ...parsed.data,
      phone: parsed.data.phone || null,
    } as never);
    setSaving(false);
    if (error) {
      toast.error("No pudimos enviar tu mensaje", { description: "Intenta de nuevo en un momento." });
      return;
    }
    setDone(true);
    toast.success("¡Mensaje enviado!");
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-1 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">Mensaje enviado</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
          Gracias por escribirnos. Te responderemos al correo que nos dejaste.
        </p>
        <button
          type="button"
          onClick={() => {
            setV({ name: "", email: "", phone: "", subject: "general", message: "" });
            setDone(false);
          }}
          className="mt-5 text-[12px] font-bold text-primary"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5">
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="c-name">Nombre *</label>
          <input id="c-name" className={inputCls} value={v.name} onChange={set("name")} maxLength={120} required />
        </div>
        <div>
          <label className={labelCls} htmlFor="c-email">Correo *</label>
          <input id="c-email" type="email" className={inputCls} value={v.email} onChange={set("email")} maxLength={255} required />
        </div>
        <div>
          <label className={labelCls} htmlFor="c-phone">Teléfono (opcional)</label>
          <input id="c-phone" type="tel" className={inputCls} value={v.phone} onChange={set("phone")} maxLength={30} />
        </div>
        <div>
          <label className={labelCls} htmlFor="c-subject">Asunto</label>
          <select id="c-subject" className={inputCls} value={v.subject} onChange={set("subject")}>
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="c-msg">Mensaje *</label>
        <textarea id="c-msg" rows={5} className={inputCls} value={v.message} onChange={set("message")} maxLength={2000} required />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar mensaje"}
      </button>
    </form>
  );
}

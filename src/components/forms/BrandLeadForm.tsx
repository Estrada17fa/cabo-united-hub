import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const INTERESTS = [
  { value: "patrocinio", label: "Patrocinio" },
  { value: "mapa", label: "Aparecer en Visita Los Cabos" },
  { value: "ambos", label: "Ambos" },
] as const;

const BUDGETS = [
  "Menos de $10,000 MXN",
  "$10,000 – $50,000 MXN",
  "$50,000 – $150,000 MXN",
  "Más de $150,000 MXN",
  "Por definir",
];

const REFERRALS = ["Redes sociales", "En el estadio", "Un conocido", "Prensa", "Otro"];

const schema = z.object({
  interest: z.enum(["patrocinio", "mapa", "ambos"]),
  business_name: z.string().trim().min(2, "Escribe el nombre del negocio").max(120),
  business_type: z.string().trim().max(80).optional().or(z.literal("")),
  contact_name: z.string().trim().min(2, "Escribe tu nombre").max(120),
  contact_role: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().min(7, "Teléfono inválido").max(30),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  instagram: z.string().trim().max(120).optional().or(z.literal("")),
  facebook: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1500).optional().or(z.literal("")),
  goals: z.string().trim().max(1500).optional().or(z.literal("")),
  budget_range: z.string().trim().max(60).optional().or(z.literal("")),
  referral_source: z.string().trim().max(60).optional().or(z.literal("")),
  privacy_accepted: z.literal(true, { errorMap: () => ({ message: "Debes aceptar el aviso de privacidad" }) }),
});

const inputCls =
  "w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

type Values = Record<string, string | boolean>;

const EMPTY: Values = {
  interest: "patrocinio",
  business_name: "",
  business_type: "",
  contact_name: "",
  contact_role: "",
  email: "",
  phone: "",
  website: "",
  instagram: "",
  facebook: "",
  city: "",
  address: "",
  description: "",
  goals: "",
  budget_range: "",
  referral_source: "",
  privacy_accepted: false,
};

export function BrandLeadForm({ defaultInterest }: { defaultInterest?: "patrocinio" | "mapa" | "ambos" }) {
  const [v, setV] = useState<Values>({ ...EMPTY, interest: defaultInterest ?? "patrocinio" });
  const [honeypot, setHoneypot] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
    const payload = Object.fromEntries(
      Object.entries(parsed.data).map(([k, val]) => [k, val === "" ? null : val]),
    );
    const { error } = await supabase.from("brand_leads").insert(payload as never);
    setSaving(false);
    if (error) {
      toast.error("No pudimos enviar tu solicitud", { description: "Intenta de nuevo en un momento." });
      return;
    }
    setDone(true);
    toast.success("¡Solicitud enviada! Te contactamos pronto.");
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-1 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">Solicitud recibida</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
          Gracias por querer sumarte a Los Cabos United. Nuestro equipo comercial revisará tu información
          y te contactará por correo o WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => {
            setV({ ...EMPTY, interest: defaultInterest ?? "patrocinio" });
            setDone(false);
          }}
          className="mt-5 text-[12px] font-bold text-primary"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5">
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div>
        <span className={labelCls}>Me interesa</span>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((opt) => {
            const active = v.interest === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setV((p) => ({ ...p, interest: opt.value }))}
                className={`rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-hairline bg-surface-2 text-secondary-fg hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="bl-business">Nombre del negocio o marca *</label>
          <input id="bl-business" className={inputCls} value={v.business_name as string} onChange={set("business_name")} maxLength={120} required />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-type">Giro o categoría</label>
          <input id="bl-type" className={inputCls} placeholder="Restaurante, hotel, tour…" value={v.business_type as string} onChange={set("business_type")} maxLength={80} />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-contact">Persona de contacto *</label>
          <input id="bl-contact" className={inputCls} value={v.contact_name as string} onChange={set("contact_name")} maxLength={120} required />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-role">Puesto</label>
          <input id="bl-role" className={inputCls} value={v.contact_role as string} onChange={set("contact_role")} maxLength={80} />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-email">Correo *</label>
          <input id="bl-email" type="email" className={inputCls} value={v.email as string} onChange={set("email")} maxLength={255} required />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-phone">Teléfono / WhatsApp *</label>
          <input id="bl-phone" type="tel" className={inputCls} value={v.phone as string} onChange={set("phone")} maxLength={30} required />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-web">Sitio web</label>
          <input id="bl-web" className={inputCls} placeholder="https://" value={v.website as string} onChange={set("website")} maxLength={200} />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-ig">Instagram</label>
          <input id="bl-ig" className={inputCls} placeholder="@tumarca" value={v.instagram as string} onChange={set("instagram")} maxLength={120} />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-fb">Facebook</label>
          <input id="bl-fb" className={inputCls} value={v.facebook as string} onChange={set("facebook")} maxLength={120} />
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-city">Ciudad</label>
          <input id="bl-city" className={inputCls} placeholder="Cabo San Lucas" value={v.city as string} onChange={set("city")} maxLength={80} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="bl-address">Dirección</label>
          <input id="bl-address" className={inputCls} value={v.address as string} onChange={set("address")} maxLength={200} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="bl-desc">Cuéntanos de tu marca</label>
        <textarea id="bl-desc" rows={3} className={inputCls} value={v.description as string} onChange={set("description")} maxLength={1500} />
      </div>
      <div>
        <label className={labelCls} htmlFor="bl-goals">¿Qué buscas del club?</label>
        <textarea id="bl-goals" rows={3} className={inputCls} placeholder="Visibilidad, activaciones, presencia en el estadio…" value={v.goals as string} onChange={set("goals")} maxLength={1500} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="bl-budget">Presupuesto aproximado</label>
          <select id="bl-budget" className={inputCls} value={v.budget_range as string} onChange={set("budget_range")}>
            <option value="">Sin especificar</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="bl-ref">¿Cómo nos conociste?</label>
          <select id="bl-ref" className={inputCls} value={v.referral_source as string} onChange={set("referral_source")}>
            <option value="">Sin especificar</option>
            {REFERRALS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={v.privacy_accepted as boolean}
          onChange={(e) => setV((p) => ({ ...p, privacy_accepted: e.target.checked }))}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        Acepto que Los Cabos United use mis datos para contactarme sobre esta solicitud.
      </label>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar solicitud"}
      </button>
    </form>
  );
}

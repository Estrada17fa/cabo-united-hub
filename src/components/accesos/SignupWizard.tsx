import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, ShieldCheck, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export type WizardTier = {
  id: "fan" | "gold" | "premium" | "platino";
  badge: string;
  price: string;
  priceNote: string;
  tagline: string;
  accent: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  tiers: WizardTier[];
  initialTierId?: WizardTier["id"];
}

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72)
  .regex(/[A-Z]/, "Debe incluir una mayúscula")
  .regex(/[a-z]/, "Debe incluir una minúscula")
  .regex(/[0-9]/, "Debe incluir un número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir un símbolo");

const formSchema = z.object({
  fullName: z.string().trim().min(3, "Mínimo 3 caracteres").max(100),
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, "Solo letras, números, _ y ."),
  email: z.string().trim().email("Email inválido").max(255),
  password: passwordSchema,
  birthDate: z.string().min(1, "Requerida"),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  favoritePlayerId: z.string().nullable().optional(),
});

type FormState = z.infer<typeof formSchema>;

export function SignupWizard({ open, onClose, tiers, initialTierId = "fan" }: Props) {
  type StepId = 1 | 2 | 2.5 | 3;
  const [step, setStep] = useState<StepId>(1);
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tierId, setTierId] = useState<WizardTier["id"]>(initialTierId);
  const [tutorData, setTutorData] = useState({ name: "", email: "", phone: "", relationship: "" });
  const [tutorAdultConfirmed, setTutorAdultConfirmed] = useState(false);
  const [tutorTouched, setTutorTouched] = useState<Record<string, boolean>>({});
  const [players, setPlayers] = useState<
    Array<{ id: string; name: string; jersey_number: number | null; photo_url: string | null; position: string | null }>
  >([]);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    birthDate: "",
    phone: "",
    favoritePlayerId: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const navigate = useNavigate();

  const tier = tiers.find((t) => t.id === tierId)!;

  useEffect(() => {
    if (open) {
      setStep(1);
      setTierId(initialTierId);
      setErrors({});
    }
  }, [open, initialTierId]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("players")
      .select("id, name, jersey_number, photo_url, position")
      .eq("active", true)
      .order("jersey_number", { ascending: true, nullsFirst: false })
      .then(({ data }) => setPlayers(data ?? []));
  }, [open]);
  const pwdChecks = useMemo(() => {
    const p = form.password;
    return [
      { label: "8+ caracteres", ok: p.length >= 8 },
      { label: "Una mayúscula", ok: /[A-Z]/.test(p) },
      { label: "Una minúscula", ok: /[a-z]/.test(p) },
      { label: "Un número", ok: /[0-9]/.test(p) },
      { label: "Un símbolo", ok: /[^A-Za-z0-9]/.test(p) },
    ];
  }, [form.password]);
  const pwdValid = pwdChecks.every((c) => c.ok);


  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateStep1 = () => {
    const r = formSchema.safeParse(form);
    if (!r.success) {
      const fieldErrs: typeof errors = {};
      r.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FormState;
        if (!fieldErrs[k]) fieldErrs[k] = i.message;
      });
      setErrors(fieldErrs);
      return false;
    }
    // Age gate
    if (form.birthDate) {
      const bd = new Date(form.birthDate);
      const age = (Date.now() - bd.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 13) {
        setErrors({ birthDate: "El programa Fan Zone está disponible a partir de los 13 años." });
        return false;
      }
    }
    return true;
  };

  const isMinor = useMemo(() => {
    if (!form.birthDate) return false;
    const age = (Date.now() - new Date(form.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 13 && age < 18;
  }, [form.birthDate]);

  const tutorErrors = useMemo(() => {
    const e: Record<string, string | undefined> = {};
    if (tutorData.name.trim().length < 3) e.name = "Mínimo 3 caracteres";
    if (!/^\S+@\S+\.\S+$/.test(tutorData.email.trim())) e.email = "Email inválido";
    if (tutorData.phone.trim() && tutorData.phone.trim().length < 7) e.phone = "Teléfono inválido";
    if (!tutorData.relationship) e.relationship = "Selecciona el parentesco";
    if (!tutorAdultConfirmed) e.adult = "Debe confirmar mayoría de edad";
    return e;
  }, [tutorData, tutorAdultConfirmed]);
  const tutorValid = Object.values(tutorErrors).every((v) => !v);

  const goNextFromStep2 = () => setStep(isMinor ? 2.5 : 3);
  const goBackFromStep3 = () => setStep(isMinor ? 2.5 : 2);

  const handleSubmit = async () => {
    if (isMinor && !tutorValid) {
      toast.error("Faltan datos del tutor", { description: "Revisa los campos marcados." });
      setStep(2.5);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirmar-correo`,
        data: {
          display_name: form.fullName,
          full_name: form.fullName,
          username: form.username,
          phone: form.phone,
          birth_date: form.birthDate,
          favorite_player_id: form.favoritePlayerId,
          tier: tierId,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error("No pudimos crear tu cuenta", { description: error.message });
      return;
    }

    if (isMinor) {
      try {
        const { data: cRes } = await supabase.functions.invoke("parental-consent-request", {
          body: {
            tutorName: tutorData.name.trim(),
            tutorEmail: tutorData.email.trim().toLowerCase(),
            tutorPhone: tutorData.phone.trim() || null,
            tutorRelationship: tutorData.relationship.trim(),
          },
        });
        toast.info("Solicitud de autorización enviada a tu tutor", {
          description: cRes?.confirmUrl
            ? "Compárte­le este enlace si no le llega el correo."
            : "Te avisaremos cuando confirme.",
        });
      } catch (_) {
        toast.warning("Cuenta creada, pero no pudimos enviar el aviso al tutor. Inténtalo desde tu perfil.");
      }
    }

    toast.success("¡Bienvenido al paraíso!", {
      description:
        tierId === "fan"
          ? "Tu pase digital está listo. Revisa tu correo para verificar tu cuenta."
          : "Tu pase quedó en espera de pago. Te llevamos a Mi Perfil.",
    });
    onClose();
    navigate("/mi-perfil");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="text-foreground">Crear pase</span>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
              style={{ background: `${tier.accent}22`, color: tier.accent, border: `1px solid ${tier.accent}55` }}
            >
              {tier.badge}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 px-5 pb-3">
          {(isMinor ? [1, 2, 2.5, 3] : [1, 2, 3]).map((n) => (
            <div
              key={n}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{ background: n <= step ? tier.accent : "rgba(255,255,255,0.1)" }}
            />
          ))}
        </div>

        <div className="px-5 pb-5 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-3"
              >
                <Field label="Nombre completo" error={errors.fullName}>
                  <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} maxLength={100} />
                </Field>
                <Field label="Usuario" error={errors.username}>
                  <Input
                    value={form.username}
                    onChange={(e) => update("username", e.target.value.toLowerCase())}
                    maxLength={30}
                    placeholder="paraisofan_24"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fecha de nacimiento" error={errors.birthDate}>
                    <Input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
                  </Field>
                  <Field label="Teléfono" error={errors.phone}>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+52 ..."
                      maxLength={20}
                    />
                  </Field>
                </div>
                <Field label="Email" error={errors.email}>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} />
                </Field>
                <Field label="Contraseña" error={errors.password}>
                  <div className="relative">
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Mín. 8 — Aa, 0-9, símbolo"
                      maxLength={72}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                    {pwdChecks.map((c) => (
                      <div
                        key={c.label}
                        className={`flex items-center gap-1 text-[10.5px] ${c.ok ? "text-emerald-400" : "text-muted-foreground"}`}
                      >
                        {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
                        {c.label}
                      </div>
                    ))}
                  </div>
                </Field>
                <Field label="Jugador favorito (opcional)">
                  {players.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground">Cargando plantilla…</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                      {players.map((p) => {
                        const active = form.favoritePlayerId === p.id;
                        const initials = p.name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => update("favoritePlayerId", active ? null : p.id)}
                            className="relative flex flex-col items-center text-center rounded-xl p-2 transition-all"
                            style={{
                              background: active ? `${tier.accent}1a` : "rgba(255,255,255,0.03)",
                              border: active ? `1.5px solid ${tier.accent}` : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div
                              className="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                              {p.photo_url ? (
                                <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-foreground/80">{initials}</span>
                              )}
                              {p.jersey_number != null && (
                                <span
                                  className="absolute -bottom-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                                  style={{ background: tier.accent, color: "#0a0a0a" }}
                                >
                                  {p.jersey_number}
                                </span>
                              )}
                            </div>
                            <div className="text-[10.5px] font-semibold text-foreground mt-1.5 leading-tight line-clamp-2">
                              {p.name}
                            </div>
                            {p.position && (
                              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{p.position}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Field>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">Confirma el nivel de tu pase:</p>
                <div className="grid grid-cols-2 gap-2">
                  {tiers.map((t) => {
                    const active = t.id === tierId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTierId(t.id)}
                        className="text-left rounded-xl p-3 transition-all"
                        style={{
                          background: active ? `${t.accent}14` : "rgba(255,255,255,0.03)",
                          border: active ? `1.5px solid ${t.accent}` : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="text-[10px] font-bold tracking-[0.12em]" style={{ color: t.accent }}>
                          {t.badge}
                        </div>
                        <div className="text-base font-bold text-foreground mt-1">{t.price}</div>
                        <div className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">{t.priceNote}</div>
                      </button>
                    );
                  })}
                </div>
                <div
                  className="rounded-xl p-3 text-[13px] text-foreground/85"
                  style={{ background: `${tier.accent}10`, border: `1px solid ${tier.accent}33` }}
                >
                  {tier.tagline}
                </div>
              </motion.div>
            )}

            {step === 2.5 && isMinor && (
              <motion.div
                key="s2-tutor"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-3"
              >
                <div
                  className="rounded-xl p-3 flex gap-2 items-start"
                  style={{ background: `${tier.accent}10`, border: `1px solid ${tier.accent}33` }}
                >
                  <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: tier.accent }} />
                  <div className="text-[12.5px] text-foreground/85 leading-snug">
                    Como tienes menos de 18 años, necesitamos el consentimiento de tu madre, padre o tutor legal.
                    Le enviaremos un correo con un enlace seguro para que autorice tu pase. Tu cuenta queda creada al
                    instante, pero algunas funciones (pagos, premios físicos) se activan cuando tu tutor confirme.
                  </div>
                </div>

                <Field label="Nombre completo del tutor" error={tutorTouched.name ? tutorErrors.name : undefined}>
                  <Input
                    value={tutorData.name}
                    onChange={(e) => setTutorData((d) => ({ ...d, name: e.target.value }))}
                    onBlur={() => setTutorTouched((t) => ({ ...t, name: true }))}
                    maxLength={100}
                  />
                </Field>
                <Field label="Email del tutor" error={tutorTouched.email ? tutorErrors.email : undefined}>
                  <Input
                    type="email"
                    value={tutorData.email}
                    onChange={(e) => setTutorData((d) => ({ ...d, email: e.target.value }))}
                    onBlur={() => setTutorTouched((t) => ({ ...t, email: true }))}
                    maxLength={255}
                    placeholder="tutor@correo.com"
                  />
                </Field>
                <Field label="Teléfono del tutor (opcional)" error={tutorTouched.phone ? tutorErrors.phone : undefined}>
                  <Input
                    type="tel"
                    value={tutorData.phone}
                    onChange={(e) => setTutorData((d) => ({ ...d, phone: e.target.value }))}
                    onBlur={() => setTutorTouched((t) => ({ ...t, phone: true }))}
                    placeholder="+52 ..."
                    maxLength={20}
                  />
                </Field>
                <Field label="Parentesco" error={tutorTouched.relationship ? tutorErrors.relationship : undefined}>
                  <select
                    value={tutorData.relationship}
                    onChange={(e) => setTutorData((d) => ({ ...d, relationship: e.target.value }))}
                    onBlur={() => setTutorTouched((t) => ({ ...t, relationship: true }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Selecciona…</option>
                    <option value="madre">Madre</option>
                    <option value="padre">Padre</option>
                    <option value="tutor_legal">Tutor legal</option>
                  </select>
                </Field>

                <label className="flex items-start gap-2 text-[12px] text-foreground/85 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tutorAdultConfirmed}
                    onChange={(e) => setTutorAdultConfirmed(e.target.checked)}
                    className="mt-0.5 accent-current"
                    style={{ accentColor: tier.accent }}
                  />
                  <span>
                    Confirmo que mi tutor es <span className="font-semibold">mayor de 18 años</span> y que estos datos
                    son verdaderos.
                  </span>
                </label>
                {tutorErrors.adult && tutorTouched.adult && (
                  <p className="text-[11px] text-destructive">{tutorErrors.adult}</p>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-4"
              >
                <div
                  className="rounded-xl p-4"
                  style={{ background: `${tier.accent}10`, border: `1px solid ${tier.accent}33` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold tracking-[0.12em]" style={{ color: tier.accent }}>
                        TOTAL · NIVEL {tier.badge}
                      </div>
                      <div className="text-2xl font-bold text-foreground mt-1">{tier.price}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground text-right max-w-[140px]">{tier.priceNote}</div>
                  </div>
                </div>
                {tierId === "fan" ? (
                  <p className="text-sm text-muted-foreground">
                    Tu pase Fan es <span className="font-bold text-foreground">gratuito</span>. Al confirmar, creamos tu cuenta y tu pase digital queda activo de inmediato.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Vamos a crear tu cuenta y dejar tu pase como{" "}
                    <span className="font-bold text-foreground">pendiente de pago</span>. Recibirás instrucciones para
                    completar el pago en efectivo (puntos de venta) o en línea muy pronto.
                  </p>
                )}
                <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: tier.accent }} />
                  <span>Confirmas que los datos del titular son correctos. El pase es personal e intransferible.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border bg-background/40">
          {step > 1 ? (
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => {
                if (step === 3) setStep(isMinor ? 2.5 : 2);
                else if (step === 2.5) setStep(2);
                else if (step === 2) setStep(1);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
            </Button>
          ) : (
            <span />
          )}
          {step !== 3 ? (
            <Button
              onClick={() => {
                if (step === 1) {
                  if (!validateStep1()) return;
                  setStep(2);
                } else if (step === 2) {
                  goNextFromStep2();
                } else if (step === 2.5) {
                  setTutorTouched({ name: true, email: true, phone: true, relationship: true, adult: true });
                  if (!tutorValid) return;
                  setStep(3);
                }
              }}
              disabled={
                (step === 1 && !pwdValid && form.password.length > 0) ||
                (step === 2.5 && !tutorValid)
              }
              style={{ background: tier.accent, color: "#0a0a0a" }}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} style={{ background: tier.accent, color: "#0a0a0a" }}>
              {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              {tierId === "fan" ? "Crear mi pase Fan" : "Crear pase y continuar"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
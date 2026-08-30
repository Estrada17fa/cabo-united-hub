import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SIGNUP_TIERS, type TierId } from "@/lib/tiers";
import { COUNTRIES, PhoneCountryInput, toE164, type Country } from "./PhoneCountryInput";
import { TurnstileGate, turnstileEnabled } from "./TurnstileGate";
import { FanPassPreview } from "@/components/pass/FanPassPreview";

interface Props {
  open: boolean;
  onClose: () => void;
  initialTierId?: TierId;
}

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72)
  .regex(/[A-Z]/, "Debe incluir una mayúscula")
  .regex(/[a-z]/, "Debe incluir una minúscula")
  .regex(/[0-9]/, "Debe incluir un número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir un símbolo");

const step1Schema = z.object({
  firstName: z.string().trim().min(2, "Mínimo 2 caracteres").max(60),
  lastNameP: z.string().trim().min(2, "Mínimo 2 caracteres").max(60),
  lastNameM: z.string().trim().max(60).optional().or(z.literal("")),
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(30)
    .regex(/^[a-z0-9_.]+$/, "Solo minúsculas, números, _ y ."),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().min(8, "Teléfono inválido").max(20),
  birthDate: z.string().min(1, "Requerida"),
  password: passwordSchema,
});

type FormState = z.infer<typeof step1Schema> & { favoritePlayerId: string | null };

type StepId = 1 | 2 | 2.5 | 3;

export function AuthFlow({ open, onClose, initialTierId = "fan" }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>(1);
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [tierId, setTierId] = useState<TierId>(initialTierId);
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState<boolean | null>(null);
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const [players, setPlayers] = useState<
    Array<{ id: string; name: string; jersey_number: number | null; photo_url: string | null; position: string | null }>
  >([]);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastNameP: "",
    lastNameM: "",
    username: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    favoritePlayerId: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [tutorData, setTutorData] = useState({ name: "", email: "", phone: "", relationship: "" });
  const [tutorAdultConfirmed, setTutorAdultConfirmed] = useState(false);
  const [tutorTouched, setTutorTouched] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<number | null>(null);

  const tier = SIGNUP_TIERS.find((t) => t.id === tierId)!;
  const accent = tier.accent;
  const fullName = [form.firstName, form.lastNameP, form.lastNameM].map((s) => s.trim()).filter(Boolean).join(" ");

  useEffect(() => {
    if (open) {
      setStep(1);
      setTierId(initialTierId);
      setErrors({});
      setDone(false);
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

  // Disponibilidad de usuario en vivo (debounce 400ms)
  useEffect(() => {
    const u = form.username.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (u.length < 3 || !/^[a-z0-9_.]+$/.test(u)) {
      setUsernameState("idle");
      return;
    }
    setUsernameState("checking");
    debounceRef.current = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc("check_username_available", { _username: u });
      if (error) {
        setUsernameState("idle");
        return;
      }
      setUsernameState(data ? "free" : "taken");
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [form.username]);

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
  const pwdScore = pwdChecks.filter((c) => c.ok).length;
  const pwdValid = pwdScore === pwdChecks.length;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const isMinor = useMemo(() => {
    if (!form.birthDate) return false;
    const age = (Date.now() - new Date(form.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 13 && age < 18;
  }, [form.birthDate]);

  const validateStep1 = () => {
    const r = step1Schema.safeParse(form);
    if (!r.success) {
      const fieldErrs: typeof errors = {};
      r.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FormState;
        if (!fieldErrs[k]) fieldErrs[k] = i.message;
      });
      setErrors(fieldErrs);
      return false;
    }
    if (usernameState === "taken") {
      setErrors({ username: "Ese usuario ya está tomado" });
      return false;
    }
    const bd = new Date(form.birthDate);
    const age = (Date.now() - bd.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 13) {
      setErrors({ birthDate: "El programa Fan Zone está disponible a partir de los 13 años." });
      return false;
    }
    if (turnstileEnabled && !turnstileToken) {
      toast.error("Completa la verificación anti-bots para continuar");
      return false;
    }
    return true;
  };

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

  const steps: StepId[] = isMinor ? [1, 2, 2.5, 3] : [1, 2, 3];

  const handleSubmit = async () => {
    if (!terms) {
      toast.error("Debes aceptar los términos para crear tu pase");
      return;
    }
    if (marketing === null) {
      toast.error("Indícanos si quieres recibir promociones (sí o no)");
      return;
    }
    if (isMinor && !tutorValid) {
      toast.error("Faltan datos del tutor", { description: "Revisa los campos marcados." });
      setStep(2.5);
      return;
    }

    setSubmitting(true);
    const e164 = toE164(country.dial, form.phone);
    const { error } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirmar-correo`,
        data: {
          display_name: fullName,
          full_name: fullName,
          first_name: form.firstName.trim(),
          last_name_p: form.lastNameP.trim(),
          last_name_m: form.lastNameM?.trim() || null,
          username: form.username.trim(),
          phone: e164,
          birth_date: form.birthDate,
          favorite_player_id: form.favoritePlayerId,
          tier: tierId,
          marketing_consent: marketing,
          terms_accepted: true,
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
        await supabase.functions.invoke("parental-consent-request", {
          body: {
            tutorName: tutorData.name.trim(),
            tutorEmail: tutorData.email.trim().toLowerCase(),
            tutorPhone: tutorData.phone.trim() || null,
            tutorRelationship: tutorData.relationship.trim(),
          },
        });
        toast.info("Enviamos la solicitud de autorización a tu tutor");
      } catch (_) {
        toast.warning("Cuenta creada, pero no pudimos avisar a tu tutor. Inténtalo desde tu perfil.");
      }
    }

    setDone(true);
    toast.success(
      tierId === "fan" ? "¡Tu pase Fan está listo!" : `Estás en la lista de espera ${tier.badge}`,
      { description: "Revisa tu correo para verificar tu cuenta y activar tu QR." },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="text-foreground">{done ? "Tu pase" : "Crear mi pase"}</span>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
              style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}
            >
              {tier.badge}
            </span>
          </DialogTitle>
        </DialogHeader>

        {!done && (
          <div className="flex items-center gap-2 px-5 pb-3">
            {steps.map((n) => (
              <div
                key={n}
                className="flex-1 h-1 rounded-full transition-colors"
                style={{ background: n <= step ? accent : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
        )}

        <div className="px-5 pb-5 max-h-[68vh] overflow-y-auto">
          {done ? (
            <div className="space-y-4 py-2">
              <FanPassPreview
                preview={{ tier: tierId, name: fullName, status: tierId === "fan" ? "active" : "waitlist" }}
              />
              <p className="text-sm text-muted-foreground">
                {tierId === "fan"
                  ? "Tu pase digital ya está activo. Verifica tu correo para habilitar tu QR de acceso."
                  : `Ya estás en la lista de espera ${tier.badge}. Te avisaremos por correo o WhatsApp en cuanto se abran los pagos.`}
              </p>
              <Button
                className="w-full"
                style={{ background: accent, color: "#0a0a0a" }}
                onClick={() => {
                  onClose();
                  navigate("/mi-perfil");
                }}
              >
                Ver y compartir mi pase <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-3"
                >
                  <Field label="Nombre(s)" error={errors.firstName}>
                    <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} maxLength={60} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Apellido paterno" error={errors.lastNameP}>
                      <Input value={form.lastNameP} onChange={(e) => update("lastNameP", e.target.value)} maxLength={60} />
                    </Field>
                    <Field label="Apellido materno" error={errors.lastNameM}>
                      <Input value={form.lastNameM ?? ""} onChange={(e) => update("lastNameM", e.target.value)} maxLength={60} />
                    </Field>
                  </div>
                  <Field
                    label="Usuario"
                    error={errors.username}
                    hint={
                      usernameState === "checking"
                        ? "Verificando disponibilidad…"
                        : usernameState === "free"
                          ? "✓ Disponible"
                          : usernameState === "taken"
                            ? "Ya está tomado"
                            : undefined
                    }
                    hintTone={usernameState === "free" ? "ok" : usernameState === "taken" ? "bad" : "muted"}
                  >
                    <Input
                      value={form.username}
                      onChange={(e) => update("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
                      maxLength={30}
                      placeholder="paraisofan_24"
                    />
                  </Field>
                  <Field label="Correo electrónico" error={errors.email}>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} />
                  </Field>
                  <Field label="Teléfono" error={errors.phone}>
                    <PhoneCountryInput
                      country={country}
                      onCountryChange={setCountry}
                      value={form.phone}
                      onChange={(v) => update("phone", v)}
                      accent={accent}
                    />
                  </Field>
                  <Field label="Fecha de nacimiento" error={errors.birthDate}>
                    <Input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
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
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-colors"
                          style={{
                            background:
                              i < pwdScore
                                ? pwdScore <= 2
                                  ? "#ef4444"
                                  : pwdScore <= 4
                                    ? "#f59e0b"
                                    : "#10b981"
                                : "rgba(255,255,255,0.1)",
                          }}
                        />
                      ))}
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
                      <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
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
                                background: active ? `${accent}1a` : "rgba(255,255,255,0.03)",
                                border: active ? `1.5px solid ${accent}` : "1px solid rgba(255,255,255,0.08)",
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
                                    style={{ background: accent, color: "#0a0a0a" }}
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
                  <TurnstileGate onToken={setTurnstileToken} />
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
                  <p className="text-sm text-muted-foreground">Elige tu nivel de abono:</p>
                  <div className="space-y-2.5">
                    {SIGNUP_TIERS.map((t) => {
                      const active = t.id === tierId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTierId(t.id)}
                          className="relative w-full text-left rounded-2xl p-3.5 overflow-hidden transition-all"
                          style={{
                            background: active ? `${t.accent}14` : "rgba(255,255,255,0.03)",
                            border: active ? `1.5px solid ${t.accent}` : "1px solid rgba(255,255,255,0.08)",
                            boxShadow: active ? `0 16px 40px -22px ${t.accent}aa, inset 0 1px 0 ${t.accent}22` : "none",
                          }}
                        >
                          {t.comingSoon && (
                            <span
                              className="absolute top-0 right-0 text-[8.5px] font-bold uppercase tracking-[0.14em] px-6 py-1"
                              style={{
                                background: `${t.accent}`,
                                color: "#0a0a0a",
                                transform: "rotate(45deg) translate(22%, -60%)",
                                transformOrigin: "center",
                              }}
                            >
                              Próximamente
                            </span>
                          )}
                          <div className="flex items-start gap-3">
                            <img
                              src={t.image}
                              alt=""
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                              style={{ border: `1px solid ${t.accent}33` }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold tracking-[0.12em]" style={{ color: t.accent }}>
                                  {t.badge}
                                </span>
                                {active && <Check className="w-3.5 h-3.5" style={{ color: t.accent }} strokeWidth={3} />}
                              </div>
                              <div className="text-base font-bold text-foreground mt-0.5">
                                {t.price}{" "}
                                <span className="text-[10.5px] font-normal text-muted-foreground">{t.priceNote}</span>
                              </div>
                              <ul className="mt-1.5 space-y-0.5">
                                {t.highlights.map((h) => (
                                  <li key={h} className="flex items-start gap-1.5 text-[11px] text-foreground/75">
                                    <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: t.accent }} />
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {tier.comingSoon && (
                    <div
                      className="rounded-xl p-3 text-[12px] text-foreground/85"
                      style={{ background: `${accent}10`, border: `1px solid ${accent}33` }}
                    >
                      Los abonos de pago abren muy pronto. Al confirmar te apartamos tu lugar en la lista de espera{" "}
                      {tier.badge} y te avisamos en cuanto puedas completarlo.
                    </div>
                  )}
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
                    style={{ background: `${accent}10`, border: `1px solid ${accent}33` }}
                  >
                    <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                    <div className="text-[12.5px] text-foreground/85 leading-snug">
                      Como tienes menos de 18 años, necesitamos el consentimiento de tu madre, padre o tutor legal. Le
                      enviaremos un correo con un enlace seguro para que autorice tu pase. Tu cuenta queda creada al
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
                      className="mt-0.5"
                      style={{ accentColor: accent }}
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
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: accent }}>
                    <Sparkles className="w-3.5 h-3.5" /> Así se verá tu pase
                  </div>
                  <FanPassPreview
                    preview={{ tier: tierId, name: fullName || "Tu nombre", status: tierId === "fan" ? "active" : "waitlist" }}
                  />

                  <div className="rounded-2xl divide-y divide-border overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Row label="Nombre completo" value={fullName} onEdit={() => setStep(1)} />
                    <Row label="Usuario" value={`@${form.username}`} onEdit={() => setStep(1)} />
                    <Row label="Correo" value={form.email} onEdit={() => setStep(1)} />
                    <Row label="Teléfono" value={toE164(country.dial, form.phone)} onEdit={() => setStep(1)} />
                    <Row label="Nivel elegido" value={`${tier.badge} · ${tier.price}`} onEdit={() => setStep(2)} />
                  </div>

                  <label className="flex items-start gap-2 text-[12px] text-foreground/85 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                      className="mt-0.5"
                      style={{ accentColor: accent }}
                    />
                    <span>
                      Acepto los términos y el aviso de privacidad. El pase es personal e intransferible y los datos del
                      titular son correctos.
                    </span>
                  </label>

                  <div className="space-y-1.5">
                    <div className="text-[12px] text-foreground/85">
                      ¿Quieres recibir promociones y avisos por correo y WhatsApp?
                    </div>
                    <div className="flex gap-2">
                      {[
                        { v: true, label: "Sí, quiero" },
                        { v: false, label: "No, gracias" },
                      ].map((o) => (
                        <button
                          key={String(o.v)}
                          type="button"
                          onClick={() => setMarketing(o.v)}
                          className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all"
                          style={{
                            background: marketing === o.v ? `${accent}1f` : "rgba(255,255,255,0.03)",
                            border: marketing === o.v ? `1.5px solid ${accent}` : "1px solid rgba(255,255,255,0.08)",
                            color: marketing === o.v ? accent : undefined,
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {!done && (
          <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border bg-background/40">
            {step > 1 ? (
              <Button
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  if (step === 3) setStep(isMinor ? 2.5 : 2);
                  else if (step === 2.5) setStep(2);
                  else setStep(1);
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
                    setStep(isMinor ? 2.5 : 3);
                  } else {
                    setTutorTouched({ name: true, email: true, phone: true, relationship: true, adult: true });
                    if (!tutorValid) return;
                    setStep(3);
                  }
                }}
                disabled={step === 2.5 && !tutorValid}
                style={{ background: accent, color: "#0a0a0a" }}
              >
                Continuar <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} style={{ background: accent, color: "#0a0a0a" }}>
                {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                {tierId === "fan" ? "Crear mi pase" : `Unirme a la lista ${tier.badge}`}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
        <div className="text-[13px] text-foreground truncate">{value || "—"}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <Pencil className="w-3 h-3" /> Editar
      </button>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  hintTone = "muted",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  hintTone?: "muted" | "ok" | "bad";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : hint ? (
        <p
          className={`text-[11px] ${
            hintTone === "ok" ? "text-emerald-400" : hintTone === "bad" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

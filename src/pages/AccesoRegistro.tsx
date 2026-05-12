import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIER_META, TIER_IDS, type TierId } from "@/lib/tiers";

type Player = { id: string; name: string; jersey_number: number | null; position: string | null; photo_url: string | null };

const dataSchema = z.object({
  full_name: z.string().trim().min(3, "Nombre demasiado corto").max(120),
  birth_date: z.string().refine((v) => !!v && new Date(v) < new Date(), "Fecha inválida"),
  phone: z.string().trim().min(8, "Teléfono inválido").max(20),
});

export default function AccesoRegistro() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialTier = (params.get("tier") as TierId) || "fan";

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<TierId>(initialTier);
  const [form, setForm] = useState({ full_name: "", birth_date: "", phone: "" });
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Skip auth step if logged in
  useEffect(() => {
    if (!loading && user && step === 0) setStep(1);
  }, [loading, user]);

  useEffect(() => {
    supabase.from("players").select("id,name,jersey_number,position,photo_url").eq("active", true).order("jersey_number").then(({ data }) => {
      setPlayers(data ?? []);
    });
  }, []);

  const steps = ["Cuenta", "Datos", "Jugador", "Nivel"];

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data: sess } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("issue-pass", {
      body: { ...form, favorite_player_id: playerId, tier },
      headers: { Authorization: `Bearer ${sess.session?.access_token}` },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error("No se pudo crear el pase: " + ((data as any)?.error || error?.message));
      return;
    }
    toast.success("¡Pase creado!");
    navigate("/accesos/mi-pase");
  };

  const next = () => {
    if (step === 1) {
      const r = dataSchema.safeParse(form);
      if (!r.success) { toast.error(r.error.issues[0].message); return; }
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-5 pt-8">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className="h-1 rounded-full transition-all" style={{ background: i <= step ? "#00FFFF" : "rgba(255,255,255,0.12)" }} />
              <div className="text-[11px] mt-2 tracking-[0.18em] uppercase" style={{ color: i === step ? "#00FFFF" : "rgba(255,255,255,0.45)" }}>{s}</div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            {step === 0 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">Crea tu cuenta</h1>
                <p className="text-white/60 mb-6">Necesitamos tu correo para emitir tu pase oficial.</p>
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-5">
                  <AuthModal onSuccess={() => setStep(1)} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-1">Tus datos</h1>
                  <p className="text-white/60">Aparecerán en tu pase digital.</p>
                </div>
                <Field label="Nombre completo">
                  <Input value={form.full_name} maxLength={120} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Juan Pérez" className="bg-[#121212] border-white/10 h-12" />
                </Field>
                <Field label="Fecha de nacimiento">
                  <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="bg-[#121212] border-white/10 h-12" />
                </Field>
                <Field label="Teléfono">
                  <Input value={form.phone} maxLength={20} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+52 624 000 0000" className="bg-[#121212] border-white/10 h-12" />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-1">Tu jugador favorito</h1>
                <p className="text-white/60 mb-6">Lo verás en tu pase como marca de agua.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {players.map((p) => {
                    const sel = playerId === p.id;
                    return (
                      <button key={p.id} onClick={() => setPlayerId(p.id)} className="text-left bg-[#121212] border rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                        style={{ borderColor: sel ? "#00FFFF" : "rgba(255,255,255,0.08)", boxShadow: sel ? "0 10px 30px -10px rgba(0,255,255,0.5)" : "none" }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-3xl font-black" style={{ color: sel ? "#00FFFF" : "rgba(255,255,255,0.85)" }}>{p.jersey_number ?? "—"}</div>
                          {sel && <Check className="w-4 h-4" style={{ color: "#00FFFF" }} />}
                        </div>
                        <div className="font-bold text-sm leading-tight">{p.name}</div>
                        <div className="text-[11px] text-white/50 mt-1">{p.position}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-1">Elige tu nivel</h1>
                <p className="text-white/60 mb-6">Puedes empezar gratis o subir cuando quieras.</p>
                <div className="space-y-3">
                  {TIER_IDS.map((id) => {
                    const meta = TIER_META[id];
                    const sel = tier === id;
                    return (
                      <button key={id} onClick={() => setTier(id)} className="w-full text-left rounded-2xl p-5 border transition-all"
                        style={{ background: sel ? meta.gradient : "#121212", borderColor: sel ? meta.accent : "rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[11px] tracking-[0.2em] uppercase opacity-70">Nivel</div>
                            <div className="text-2xl font-black">{meta.label}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black">{meta.price}</div>
                            <div className="text-[11px] opacity-70">{id === "fan" ? "para siempre" : "por temporada"}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {tier !== "fan" && (
                  <div className="mt-6 bg-[#121212] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
                      <CreditCard className="w-4 h-4" /> Pago de prueba (mock)
                    </div>
                    <p className="text-white/55 text-xs mb-3">Esta es una simulación. Más adelante conectamos pago real.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        {step > 0 && (
          <div className="flex items-center justify-between mt-10">
            <button onClick={() => setStep((s) => Math.max(s - 1, 0))} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
            {step < steps.length - 1 ? (
              <button onClick={next} className="inline-flex items-center gap-2 font-bold rounded-full px-6 h-12 bg-[#00FFFF] text-black">
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="inline-flex items-center gap-2 font-bold rounded-full px-6 h-12 bg-[#00FFFF] text-black disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {tier === "fan" ? "Crear pase gratis" : "Confirmar pago de prueba"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] tracking-[0.18em] uppercase text-white/55">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
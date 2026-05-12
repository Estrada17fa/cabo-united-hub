import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ScanLine, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function StaffScan() {
  const { user, loading } = useAuth();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const [contextKind, setContextKind] = useState<"" | "master" | "match" | "benefit" | "experience">("");
  const [contextRef, setContextRef] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      setIsStaff(!!data?.some((r) => r.role === "staff" || r.role === "admin"));
    });
  }, [user, loading]);

  const start = async () => {
    setResult(null);
    if (!scannerRef.current) scannerRef.current = new Html5Qrcode("qr-reader");
    setScanning(true);
    await scannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 260 },
      async (text) => {
        await scannerRef.current!.stop();
        setScanning(false);
        const { data: sess } = await supabase.auth.getSession();
        const { data } = await supabase.functions.invoke("validate-qr", {
          body: { token: text, context_kind: contextKind || undefined, context_ref: contextRef || undefined },
          headers: { Authorization: `Bearer ${sess.session?.access_token}` },
        });
        setResult(data);
      },
      () => {},
    );
  };

  const stop = async () => {
    if (scannerRef.current && scanning) await scannerRef.current.stop();
    setScanning(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (isStaff === false) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center"><div><div className="text-2xl font-black mb-2">Sin acceso</div><p className="text-white/60">Necesitas rol de staff o admin.</p></div></div>;

  return (
    <div className="min-h-screen bg-black text-white pb-24" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-md mx-auto px-5 pt-8">
        <h1 className="text-3xl font-black mb-1">Escáner Staff</h1>
        <p className="text-white/60 text-sm mb-6">Escanea pases y QR de eventos.</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <select value={contextKind} onChange={(e) => setContextKind(e.target.value as any)} className="bg-[#121212] border border-white/10 rounded-xl h-11 px-3 text-sm">
            <option value="">Cualquier tipo</option>
            <option value="master">Pase fan</option>
            <option value="match">Partido</option>
            <option value="benefit">Beneficio</option>
            <option value="experience">Experiencia</option>
          </select>
          <input value={contextRef} onChange={(e) => setContextRef(e.target.value)} placeholder="Ref (opcional)" className="bg-[#121212] border border-white/10 rounded-xl h-11 px-3 text-sm" />
        </div>

        <div id="qr-reader" className="rounded-2xl overflow-hidden bg-black border border-white/10 aspect-square" />

        <div className="flex gap-3 mt-4">
          {!scanning ? (
            <button onClick={start} className="flex-1 h-12 rounded-full font-bold bg-[#00FFFF] text-black inline-flex items-center justify-center gap-2"><ScanLine className="w-4 h-4" /> Iniciar escáner</button>
          ) : (
            <button onClick={stop} className="flex-1 h-12 rounded-full font-bold bg-white/10 text-white">Detener</button>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl p-5 border" style={{ borderColor: result.ok ? "#00FFFF" : "#ef4444", background: result.ok ? "rgba(0,255,255,0.08)" : "rgba(239,68,68,0.08)" }}>
              <div className="flex items-center gap-3 mb-3">
                {result.ok ? <CheckCircle2 className="w-8 h-8 text-[#00FFFF]" /> : <XCircle className="w-8 h-8 text-red-500" />}
                <div>
                  <div className="text-lg font-black">{result.ok ? "Acceso válido" : "Rechazado"}</div>
                  {!result.ok && <div className="text-sm text-white/70">{result.reason}</div>}
                </div>
              </div>
              {result.ok && result.pass && (
                <div className="space-y-1 text-sm">
                  <div><span className="text-white/55">Nombre: </span><b>{result.pass.full_name}</b></div>
                  <div><span className="text-white/55">Nivel: </span><b className="uppercase">{result.pass.tier}</b></div>
                  <div><span className="text-white/55">Código: </span>{result.pass.pass_code}</div>
                  {result.player && <div><span className="text-white/55">Jugador fav: </span>#{result.player.jersey_number} {result.player.name}</div>}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
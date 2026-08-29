import { motion } from "framer-motion";
import { Handshake } from "lucide-react";
import { BrandLeadForm } from "@/components/forms/BrandLeadForm";

const Patrocinios = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 pb-8"
    >
      <header className="rounded-2xl border border-hairline bg-surface-1 p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-surface-2">
          <Handshake className="h-5 w-5 text-primary" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Patrocinios
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground">
          Sé parte de Los Cabos United
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
          Llega a la afición del paraíso: estadio, transmisiones, app y la guía Visita Los Cabos.
          Déjanos los datos de tu marca y armamos una propuesta a tu medida.
        </p>
      </header>

      <BrandLeadForm defaultInterest="patrocinio" />
    </motion.div>
  );
};

export default Patrocinios;

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";

const Contacto = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 pb-8"
    >
      <header className="rounded-2xl border border-hairline bg-surface-1 p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-surface-2">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Contáctanos
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground">
          Hablemos
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
          Dudas del club, prensa, fuerzas juveniles o tu pedido de la tienda. Escríbenos y te
          respondemos lo antes posible.
        </p>
      </header>

      <ContactForm />
    </motion.div>
  );
};

export default Contacto;

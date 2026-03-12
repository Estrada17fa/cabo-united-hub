import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";

const Noticias = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-6 mx-auto w-20 h-20 rounded-xl bg-card border border-border flex items-center justify-center">
          <Newspaper className="w-10 h-10 text-secondary" />
        </div>
        <h1 className="text-headline mb-2">Noticias</h1>
        <p className="text-body text-muted-foreground">
          Últimas noticias del equipo próximamente
        </p>
      </motion.div>
    </div>
  );
};

export default Noticias;

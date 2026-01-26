import { motion } from "framer-motion";
import { Medal } from "lucide-react";

const Liga = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-6 mx-auto w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center">
          <Medal className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-headline mb-2">Liga</h1>
        <p className="text-body text-muted-foreground">
          Tabla de posiciones próximamente
        </p>
      </motion.div>
    </div>
  );
};

export default Liga;

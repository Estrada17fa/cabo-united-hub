import { motion } from "framer-motion";
import { User } from "lucide-react";

const Perfil = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-6 mx-auto w-20 h-20 rounded-xl bg-card border border-border flex items-center justify-center">
          <User className="w-10 h-10 text-secondary" />
        </div>
        <h1 className="text-headline mb-2">Perfil</h1>
        <p className="text-body text-muted-foreground">
          Tu perfil de usuario próximamente
        </p>
      </motion.div>
    </div>
  );
};

export default Perfil;

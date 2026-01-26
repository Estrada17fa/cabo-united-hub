import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Logo placeholder */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 mx-auto w-32 h-32 md:w-40 md:h-40 rounded-full bg-card border-2 border-border flex items-center justify-center glow-primary"
        >
          <Shield className="w-16 h-16 md:w-20 md:h-20 text-primary" />
        </motion.div>

        <h1 className="text-display gradient-text mb-4">
          Los Cabos United
        </h1>
        
        <p className="text-body text-muted-foreground max-w-md mx-auto mb-8">
          Tu equipo, tu pasión. Bienvenido a la app oficial.
        </p>

        {/* Quick stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-3 gap-4 max-w-sm mx-auto"
        >
          <div className="bento-card-sm text-center">
            <p className="text-headline text-primary">0</p>
            <p className="text-caption">Partidos</p>
          </div>
          <div className="bento-card-sm text-center">
            <p className="text-headline text-secondary">0</p>
            <p className="text-caption">Goles</p>
          </div>
          <div className="bento-card-sm text-center">
            <p className="text-headline text-foreground">0</p>
            <p className="text-caption">Puntos</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center w-full"
      >
        {/* Logo placeholder */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 sm:mb-8 mx-auto w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl bg-card border-2 border-border flex items-center justify-center glow-primary"
        >
          <Shield className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary" />
        </motion.div>

        <h1 className="text-3xl sm:text-display gradient-text mb-3 sm:mb-4">
          Los Cabos United
        </h1>
        
        <p className="text-sm sm:text-body text-muted-foreground max-w-md mx-auto mb-6 sm:mb-8 px-2">
          Tu equipo, tu pasión. Bienvenido a la app oficial.
        </p>

        {/* Quick stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto"
        >
          <div className="bento-card-sm text-center">
            <p className="text-xl sm:text-headline text-primary">0</p>
            <p className="text-xs sm:text-caption">Partidos</p>
          </div>
          <div className="bento-card-sm text-center">
            <p className="text-xl sm:text-headline text-secondary">0</p>
            <p className="text-xs sm:text-caption">Goles</p>
          </div>
          <div className="bento-card-sm text-center">
            <p className="text-xl sm:text-headline text-foreground">0</p>
            <p className="text-xs sm:text-caption">Puntos</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;

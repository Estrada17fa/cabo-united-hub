import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function LiveStreamButton() {
  return (
    <motion.a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-xl glow-primary"
    >
      <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full gradient-primary opacity-40 animate-ping" />
    </motion.a>
  );
}

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { motion } from "framer-motion";

export default function MiPerfil() {
  const { profile, user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <Avatar className="w-20 h-20 mx-auto">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-muted">
            <User className="w-8 h-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">
          {profile?.display_name ?? user?.email}
        </p>
        <p className="text-sm text-muted-foreground">
          Esta página se desarrollará próximamente.
        </p>
      </div>
    </motion.div>
  );
}

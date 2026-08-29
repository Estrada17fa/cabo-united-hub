import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/** Verifica el rol admin del usuario en sesión (is_admin, con has_role como respaldo). */
export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let active = true;

    (async () => {
      const primary = await supabase.rpc("is_admin", { _user_id: user.id });
      if (!active) return;
      if (!primary.error) {
        setIsAdmin(primary.data === true);
        return;
      }
      const fallback = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!active) return;
      setIsAdmin(!fallback.error && fallback.data === true);
    })();

    return () => {
      active = false;
    };
  }, [user?.id, authLoading]);

  return { isAdmin, loading: authLoading || isAdmin === null };
}

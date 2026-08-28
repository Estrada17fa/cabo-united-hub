import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/** Verifica el rol admin vía RPC (has_role) del usuario en sesión. */
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
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data, error }) => {
        if (!active) return;
        setIsAdmin(!error && data === true);
      });
    return () => {
      active = false;
    };
  }, [user?.id, authLoading]);

  return { isAdmin, loading: authLoading || isAdmin === null };
}

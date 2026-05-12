import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Transaction {
  id: string;
  type: string;
  xp_delta: number;
  cc_delta: number;
  source: string | null;
  description: string | null;
  created_at: string;
}

export function useFanProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasDoubleActive, setHasDoubleActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setHasDoubleActive(false);
      return;
    }
    setLoading(true);
    Promise.all([
      supabase
        .from("transactions")
        .select("id,type,xp_delta,cc_delta,source,description,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("fan_passes")
        .select("tier,status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
    ]).then(([txRes, passRes]) => {
      setTransactions((txRes.data ?? []) as Transaction[]);
      const tier = passRes.data?.tier;
      setHasDoubleActive(tier === "premium" || tier === "platino");
      setLoading(false);
    });

    const channel = supabase
      .channel(`fan-profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setTransactions((prev) => [payload.new as Transaction, ...prev].slice(0, 20));
          refreshProfile();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { user, profile, transactions, hasDoubleActive, loading };
}
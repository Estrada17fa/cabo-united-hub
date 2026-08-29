import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Match } from "./types";

interface Player {
  id: string;
  name: string;
  jersey_number: number | null;
  photo_url: string | null;
}

interface Props {
  match: Match;
}

/** Jugador del partido: abre en el 2do tiempo y sigue abierto en post-partido. */
export function MotmVote({ match }: Props) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [voted, setVoted] = useState<string | null>(null);
  const open = match.phase === "second_half" || match.phase === "finished";

  useEffect(() => {
    if (!open) return;
    supabase
      .from("players")
      .select("id, name, jersey_number, photo_url")
      .eq("active", true)
      .order("jersey_number")
      .then(({ data }) => setPlayers((data ?? []) as Player[]));
  }, [open]);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from("motm_votes")
      .select("player_id")
      .eq("match_id", match.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => data && setVoted(data.player_id));
  }, [user?.id, match.id, open]);

  if (!open || !players.length) return null;

  const vote = async (playerId: string) => {
    if (!user) {
      toast.info("Inicia sesión para votar");
      return;
    }
    const { error } = await supabase
      .from("motm_votes")
      .upsert(
        { user_id: user.id, match_id: match.id, player_id: playerId },
        { onConflict: "user_id,match_id" }
      );
    if (error) {
      toast.error("No pudimos registrar tu voto");
      return;
    }
    setVoted(playerId);
    toast.success("¡Voto registrado!");
  };

  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Trophy className="h-4 w-4 text-brand-accent" />
        <h3 className="text-sm font-bold text-foreground">Jugador del partido</h3>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => vote(p.id)}
            className={cn(
              "w-[74px] shrink-0 rounded-2xl border p-2 text-center transition-colors",
              voted === p.id
                ? "border-primary/60 bg-primary/10"
                : "border-hairline bg-surface-3"
            )}
          >
            <div className="mx-auto mb-1.5 h-12 w-12 overflow-hidden rounded-full bg-surface-1">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                  {p.jersey_number ?? "?"}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] font-semibold text-foreground">{p.name.split(" ")[0]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

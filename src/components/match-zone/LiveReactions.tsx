import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users } from "lucide-react";

const REACTIONS = [
  { kind: "fire", emoji: "🔥" },
  { kind: "goal", emoji: "⚽" },
  { kind: "clap", emoji: "👏" },
  { kind: "heart", emoji: "💙" },
  { kind: "wow", emoji: "😱" },
];

interface Props {
  matchId: string;
}

/** Reacciones en vivo + fans conectados (presence). Sin chat: cero moderación. */
export function LiveReactions({ matchId }: Props) {
  const { user } = useAuth();
  const [online, setOnline] = useState(1);
  const [floats, setFloats] = useState<{ id: number; emoji: string }[]>([]);
  const seq = useRef(0);
  const lastSent = useRef(0);

  useEffect(() => {
    const channel = supabase.channel(`match-room-${matchId}`, {
      config: { presence: { key: user?.id ?? `guest-${Math.random().toString(36).slice(2)}` } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setOnline(Object.keys(channel.presenceState()).length || 1);
      })
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        push(payload.emoji as string);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") channel.track({ at: Date.now() });
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, user?.id]);

  const push = (emoji: string) => {
    const id = ++seq.current;
    setFloats((f) => [...f.slice(-14), { id, emoji }]);
    window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1800);
  };

  const send = async (kind: string, emoji: string) => {
    const now = Date.now();
    if (now - lastSent.current < 400) return;
    lastSent.current = now;
    push(emoji);
    supabase.channel(`match-room-${matchId}`).send({
      type: "broadcast",
      event: "reaction",
      payload: { emoji },
    });
    if (user) {
      await supabase.from("match_reactions").insert({ match_id: matchId, user_id: user.id, kind });
    }
  };

  return (
    <div className="relative flex items-center justify-between gap-2 rounded-2xl border border-hairline bg-surface-1 px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Users className="h-3.5 w-3.5 text-primary" />
        {online} viendo
      </div>

      <div className="pointer-events-none absolute inset-x-0 -top-16 h-16 overflow-hidden">
        <AnimatePresence>
          {floats.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 0, y: 40, x: Math.random() * 200 - 100 }}
              animate={{ opacity: 1, y: -10 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute left-1/2 text-2xl"
            >
              {f.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-1">
        {REACTIONS.map((r) => (
          <button
            key={r.kind}
            onClick={() => send(r.kind, r.emoji)}
            aria-label={`Reaccionar ${r.emoji}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-lg transition-transform active:scale-90"
          >
            {r.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

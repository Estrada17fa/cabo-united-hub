import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Carlos M.", points: 1240 },
  { rank: 2, name: "Ana V.", points: 1180 },
  { rank: 3, name: "Luis R.", points: 1095 },
  { rank: 4, name: "Sofía P.", points: 980 },
  { rank: 5, name: "Tú", points: 240, isUser: true },
];

export function MiniLeaderboard() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: "hsl(0 0% 7%)",
        borderColor: "hsl(0 0% 100% / 0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="text-base font-extrabold tracking-tight">Top Aficionados</h3>
        </div>
        <span className="text-xs text-muted-foreground">Esta temporada</span>
      </div>
      <ul className="space-y-2">
        {MOCK_LEADERBOARD.map((entry, i) => (
          <motion.li
            key={entry.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{
              backgroundColor: entry.isUser ? "hsl(180 100% 50% / 0.1)" : "hsl(0 0% 100% / 0.03)",
              border: entry.isUser ? "1px solid hsl(180 100% 50% / 0.3)" : "1px solid transparent",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: entry.rank === 1 ? "hsl(45 100% 50% / 0.2)" : "hsl(0 0% 100% / 0.05)",
                  color: entry.rank === 1 ? "hsl(45 100% 60%)" : "hsl(0 0% 70%)",
                }}
              >
                {entry.rank}
              </span>
              <span className={`text-sm ${entry.isUser ? "font-bold text-primary" : "font-medium"}`}>
                {entry.name}
              </span>
              {entry.rank <= 3 && <Medal className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
            <span className="text-sm font-bold tabular-nums">{entry.points}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
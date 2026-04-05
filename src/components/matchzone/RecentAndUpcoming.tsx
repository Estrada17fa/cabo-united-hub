import { motion } from "framer-motion";
import { RECENT_RESULTS, UPCOMING_MATCHES } from "./mockData";

const ResultBadge = ({ result }: { result: "W" | "D" | "L" }) => {
  const styles = {
    W: "bg-emerald-500/20 text-emerald-400",
    D: "bg-yellow-500/20 text-yellow-400",
    L: "bg-red-500/20 text-red-400",
  };
  const labels = { W: "G", D: "E", L: "P" };
  return (
    <span className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center ${styles[result]}`}>
      {labels[result]}
    </span>
  );
};

export default function RecentAndUpcoming() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 gap-3"
    >
      {/* Recent */}
      <div className="bento-card-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Últimos</h3>
        <div className="flex flex-col gap-2">
          {RECENT_RESULTS.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <ResultBadge result={r.result} />
              <div className="flex-1 truncate">
                <span className="font-semibold">LCU</span>
                <span className="text-muted-foreground mx-1">{r.lcuScore}-{r.rivalScore}</span>
                <span className="text-muted-foreground">{r.riIn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="bento-card-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Próximos</h3>
        <div className="flex flex-col gap-2">
          {UPCOMING_MATCHES.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                {m.date.getDate()}
              </div>
              <div className="flex-1 truncate">
                <span className="font-semibold">LCU</span>
                <span className="text-muted-foreground mx-1">vs</span>
                <span className="text-muted-foreground">{m.riIn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

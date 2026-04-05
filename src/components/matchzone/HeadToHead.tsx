import { motion } from "framer-motion";
import { LCU, RIVAL, H2H } from "./mockData";

const FormBadge = ({ result }: { result: "W" | "D" | "L" }) => {
  const colors = {
    W: "bg-emerald-500/20 text-emerald-400",
    D: "bg-yellow-500/20 text-yellow-400",
    L: "bg-red-500/20 text-red-400",
  };
  const labels = { W: "G", D: "E", L: "P" };
  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${colors[result]}`}>
      {labels[result]}
    </span>
  );
};

const StatBar = ({ label, home, away }: { label: string; home: number; away: number }) => {
  const total = home + away || 1;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-semibold">
        <span>{home}</span>
        <span className="text-muted-foreground">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
        <div className="bg-primary rounded-l-full transition-all" style={{ width: `${(home / total) * 100}%` }} />
        <div className="bg-secondary rounded-r-full transition-all" style={{ width: `${(away / total) * 100}%` }} />
      </div>
    </div>
  );
};

export default function HeadToHead() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bento-card"
    >
      <h2 className="text-title mb-4">Frente a Frente</h2>

      {/* Record summary */}
      <div className="flex items-center justify-between mb-4 bg-muted/50 rounded-xl p-3">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-primary">{H2H.lcuWins}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{LCU.shortName}</div>
        </div>
        <div className="text-center flex-1 border-x border-border">
          <div className="text-2xl font-bold text-muted-foreground">{H2H.draws}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Empates</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-secondary">{H2H.rivalWins}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{RIVAL.shortName}</div>
        </div>
      </div>

      {/* Stats bars */}
      <div className="flex flex-col gap-3 mb-5">
        {H2H.stats.map((s) => (
          <StatBar key={s.label} {...s} />
        ))}
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">{LCU.shortName}</span>
          <div className="flex gap-1.5">
            {H2H.lcuForm.map((r, i) => <FormBadge key={i} result={r} />)}
          </div>
          <span className="text-xs text-muted-foreground">#{H2H.lcuTablePos}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">{RIVAL.shortName}</span>
          <div className="flex gap-1.5">
            {H2H.rivalForm.map((r, i) => <FormBadge key={i} result={r} />)}
          </div>
          <span className="text-xs text-muted-foreground">#{H2H.rivalTablePos}</span>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";

export interface StandingRow {
  pos: number;
  team: string;
  jj: number;
  jg: number;
  je: number;
  jp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

interface StandingsTableProps {
  rows: StandingRow[];
  title?: string;
}

const LCU = "Los Cabos United";

export function StandingsTable({ rows, title }: StandingsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>
      )}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-2 px-1.5 font-semibold w-6">#</th>
              <th className="text-left py-2 px-1.5 font-semibold">Equipo</th>
              <th className="text-center py-2 px-1 font-semibold">JJ</th>
              <th className="text-center py-2 px-1 font-semibold">JG</th>
              <th className="text-center py-2 px-1 font-semibold">JE</th>
              <th className="text-center py-2 px-1 font-semibold">JP</th>
              <th className="text-center py-2 px-1 font-semibold">DG</th>
              <th className="text-center py-2 px-1.5 font-bold">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isLCU = row.team === LCU;
              return (
                <tr
                  key={row.team}
                  className={`border-t border-border/50 transition-colors ${isLCU ? "bg-primary/10" : ""}`}
                >
                  <td className="py-2.5 px-1.5 font-semibold text-muted-foreground">{row.pos}</td>
                  <td className="py-2.5 px-1.5">
                    <div className="flex items-center gap-1.5">
                      {isLCU && <div className="w-0.5 h-4 rounded-full bg-primary shrink-0" />}
                      <span className={`font-semibold truncate max-w-[120px] ${isLCU ? "text-primary" : "text-foreground"}`}>
                        {row.team}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-2.5 px-1 text-muted-foreground">{row.jj}</td>
                  <td className="text-center py-2.5 px-1 text-muted-foreground">{row.jg}</td>
                  <td className="text-center py-2.5 px-1 text-muted-foreground">{row.je}</td>
                  <td className="text-center py-2.5 px-1 text-muted-foreground">{row.jp}</td>
                  <td className="text-center py-2.5 px-1 text-muted-foreground">{row.dg > 0 ? `+${row.dg}` : row.dg}</td>
                  <td className={`text-center py-2.5 px-1.5 font-bold ${isLCU ? "text-primary" : "text-foreground"}`}>
                    {row.pts}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

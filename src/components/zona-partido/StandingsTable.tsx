import { motion } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { TeamStanding, TopScorer } from "./mockData";

interface StandingsTableProps {
  standings: TeamStanding[];
  title: string;
}

export function StandingsTable({ standings, title }: StandingsTableProps) {
  const sorted = [...standings].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card !p-0 overflow-hidden"
    >
      <div className="p-4 pb-2">
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="text-[10px] uppercase">
            <TableHead className="w-8 px-2">#</TableHead>
            <TableHead className="px-2">Equipo</TableHead>
            <TableHead className="w-8 px-1 text-center">JJ</TableHead>
            <TableHead className="w-8 px-1 text-center">JG</TableHead>
            <TableHead className="w-8 px-1 text-center">JE</TableHead>
            <TableHead className="w-8 px-1 text-center">JP</TableHead>
            <TableHead className="w-8 px-1 text-center">DG</TableHead>
            <TableHead className="w-10 px-1 text-center font-bold">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((team, i) => {
            const isLCU = team.team === "Los Cabos United";
            return (
              <TableRow key={team.team} className={isLCU ? "bg-primary/5 border-l-2 border-l-primary" : ""}>
                <TableCell className="px-2 text-xs font-medium text-muted-foreground">{i + 1}</TableCell>
                <TableCell className={`px-2 text-xs font-medium truncate max-w-[120px] ${isLCU ? "text-primary font-bold" : ""}`}>
                  {team.team}
                </TableCell>
                <TableCell className="px-1 text-xs text-center">{team.played}</TableCell>
                <TableCell className="px-1 text-xs text-center">{team.won}</TableCell>
                <TableCell className="px-1 text-xs text-center">{team.drawn}</TableCell>
                <TableCell className="px-1 text-xs text-center">{team.lost}</TableCell>
                <TableCell className="px-1 text-xs text-center">
                  <span className={team.goalDifference > 0 ? "text-green-400" : team.goalDifference < 0 ? "text-red-400" : ""}>
                    {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                  </span>
                </TableCell>
                <TableCell className="px-1 text-xs text-center font-bold">{team.points}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}

interface TopScorersTableProps {
  scorers: TopScorer[];
}

export function TopScorersTable({ scorers }: TopScorersTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card !p-0 overflow-hidden"
    >
      <div className="p-4 pb-2">
        <h3 className="text-sm font-bold">🏆 Tabla de Goleo</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="text-[10px] uppercase">
            <TableHead className="w-8 px-2">#</TableHead>
            <TableHead className="px-2">Jugador</TableHead>
            <TableHead className="px-2">Equipo</TableHead>
            <TableHead className="w-10 px-1 text-center">⚽</TableHead>
            <TableHead className="w-10 px-1 text-center">🅰️</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scorers.map((scorer) => {
            const isLCU = scorer.team === "Los Cabos United";
            return (
              <TableRow key={scorer.position} className={isLCU ? "bg-primary/5" : ""}>
                <TableCell className="px-2 text-xs font-medium text-muted-foreground">{scorer.position}</TableCell>
                <TableCell className={`px-2 text-xs font-medium ${isLCU ? "text-primary font-bold" : ""}`}>
                  {scorer.player}
                </TableCell>
                <TableCell className="px-2 text-xs text-muted-foreground truncate max-w-[100px]">{scorer.team}</TableCell>
                <TableCell className="px-1 text-xs text-center font-bold">{scorer.goals}</TableCell>
                <TableCell className="px-1 text-xs text-center">{scorer.assists}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}

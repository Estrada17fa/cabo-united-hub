import { Suspense, lazy, useState } from "react";
import { Loader2 } from "lucide-react";
import { LcuTabs } from "@/components/ui-lcu/LcuTabs";
import { useActiveSeason } from "@/hooks/useLeague";

const Config = lazy(() => import("./Config"));
const Equipos = lazy(() => import("./Equipos"));
const Partidos = lazy(() => import("./Partidos"));
const Posiciones = lazy(() => import("./Posiciones"));
const Goleo = lazy(() => import("./Goleo"));

const TABS = [
  { id: "config", label: "Configuración" },
  { id: "equipos", label: "Equipos" },
  { id: "partidos", label: "Partidos" },
  { id: "posiciones", label: "Posiciones" },
  { id: "goleo", label: "Goleo" },
];

function Fallback() {
  return (
    <div className="flex justify-center py-14">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

export default function Torneo() {
  const [tab, setTab] = useState("config");
  const { data: season } = useActiveSeason();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {season?.logo_url && (
          <img src={season.logo_url} alt={season.name} className="h-9 w-9 object-contain" />
        )}
        <div>
          <h1 className="text-base font-bold text-foreground">{season?.name ?? "Torneo"}</h1>
          <p className="font-mono text-[11px] text-muted-foreground">
            {season?.season_key ? `Temporada ${season.season_key}` : "Sin torneo activo"}
          </p>
        </div>
      </div>

      <div className="border-b border-hairline">
        <LcuTabs items={TABS} value={tab} onChange={setTab} variant="underline" layoutId="admin-torneo" />
      </div>

      <Suspense fallback={<Fallback />}>
        {tab === "config" && <Config />}
        {tab === "equipos" && <Equipos />}
        {tab === "partidos" && <Partidos />}
        {tab === "posiciones" && <Posiciones />}
        {tab === "goleo" && <Goleo />}
      </Suspense>
    </div>
  );
}

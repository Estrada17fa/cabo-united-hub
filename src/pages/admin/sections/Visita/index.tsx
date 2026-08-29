import { Suspense, lazy, useState } from "react";
import { Loader2 } from "lucide-react";
import { LcuTabs } from "@/components/ui-lcu/LcuTabs";

const Lugares = lazy(() => import("./Lugares"));
const Rutas = lazy(() => import("./Rutas"));
const Categorias = lazy(() => import("./Categorias"));

const TABS = [
  { id: "lugares", label: "Lugares" },
  { id: "categorias", label: "Tipos de lugar" },
  { id: "rutas", label: "Rutas del Amo" },
];


function Fallback() {
  return (
    <div className="flex justify-center py-14">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

export default function Visita() {
  const [tab, setTab] = useState("lugares");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-bold text-foreground">Visita Los Cabos</h1>
        <p className="text-[11px] text-muted-foreground">
          Lo que captures aquí es exactamente lo que muestra el mapa del sitio.
        </p>
      </div>

      <div className="border-b border-hairline">
        <LcuTabs items={TABS} value={tab} onChange={setTab} variant="underline" layoutId="admin-visita" />
      </div>

      <Suspense fallback={<Fallback />}>
        {tab === "lugares" && <Lugares />}
        {tab === "rutas" && <Rutas />}
      </Suspense>
    </div>
  );
}

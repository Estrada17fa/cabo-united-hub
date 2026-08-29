import { Suspense, lazy, useState } from "react";
import { Loader2 } from "lucide-react";
import { LcuTabs } from "@/components/ui-lcu/LcuTabs";

const HeroSlides = lazy(() => import("./HeroSlides"));
const Banners = lazy(() => import("./Banners"));

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "banners", label: "Banners" },
];

function Fallback() {
  return (
    <div className="flex justify-center py-14">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

export default function Tienda() {
  const [tab, setTab] = useState("hero");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-bold text-foreground">Tienda</h1>
        <p className="text-[11px] text-muted-foreground">
          Aquí se edita el contenido de campaña de la tienda: el hero y los banners. Las fotos y
          precios de producto vienen del catálogo, no se suben desde aquí.
        </p>
      </div>

      <div className="border-b border-hairline">
        <LcuTabs items={TABS} value={tab} onChange={setTab} variant="underline" layoutId="admin-tienda" />
      </div>

      <Suspense fallback={<Fallback />}>
        {tab === "hero" && <HeroSlides />}
        {tab === "banners" && <Banners />}
      </Suspense>
    </div>
  );
}

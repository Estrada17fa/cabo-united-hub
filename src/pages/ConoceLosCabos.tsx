import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Place } from "@/lib/visita-los-cabos-data";
import { usePlaces } from "@/hooks/useVisitaLosCabos";
import { MapView } from "@/components/visita-los-cabos/MapView";
import { FilterPills, FilterValue } from "@/components/visita-los-cabos/FilterPills";
import { PlaceDetail } from "@/components/visita-los-cabos/PlaceDetail";
import { RoutesPanel } from "@/components/visita-los-cabos/RoutesPanel";
import { FeaturedStrip } from "@/components/visita-los-cabos/FeaturedStrip";
import { BrandLeadForm } from "@/components/forms/BrandLeadForm";

const ConoceLosCabos = () => {
  const isMobile = useIsMobile();
  const { data: places = [] } = usePlaces();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterValue>("todos");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Open the place detail when arriving via ?place=<id>
  useEffect(() => {
    const placeId = searchParams.get("place");
    if (placeId && places.some((p) => p.id === placeId)) {
      setSelectedId(placeId);
      if (isMobile) setSheetOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isMobile, places]);

  const filteredPlaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    return places.filter((p) => {
      if (filter === "patrocinadores" && p.tier !== "patrocinador") return false;
      if (
        filter !== "todos" &&
        filter !== "patrocinadores" &&
        p.category !== filter
      )
        return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !(p.area ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [filter, search, places]);

  const selected = selectedId
    ? places.find((p) => p.id === selectedId) ?? null
    : null;

  function handleSelect(place: Place) {
    setSelectedId(place.id);
    if (isMobile) setSheetOpen(true);
  }

  function handleBack() {
    setSelectedId(null);
    setSheetOpen(false);
    if (searchParams.get("place")) {
      searchParams.delete("place");
      setSearchParams(searchParams, { replace: true });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 -mx-1"
    >
      {/* DESKTOP — split layout */}
      <div className="hidden md:grid grid-cols-12 gap-3" style={{ height: "calc(100vh - 18rem)", minHeight: 540 }}>
        {/* LEFT — Map */}
        <div className="col-span-8 relative">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <MapView
              filteredPlaces={filteredPlaces}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
          {/* Filters overlay top-right */}
          <div className="absolute top-3 right-3 left-16 z-10 max-w-[460px] ml-auto">
            <div className="bg-background/85 backdrop-blur-md rounded-2xl border border-border p-2.5">
              <FilterPills
                active={filter}
                onChange={setFilter}
                search={search}
                onSearchChange={setSearch}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Panel */}
        <div className="col-span-4 bg-card border border-border rounded-2xl p-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <PlaceDetail place={selected} onBack={handleBack} />
              </motion.div>
            ) : (
              <motion.div
                key="routes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <RoutesPanel onSelectPlace={(id) => { const pl = places.find((p) => p.id === id); if (pl) handleSelect(pl); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE — stacked */}
      <div className="md:hidden space-y-3">
        <FilterPills
          active={filter}
          onChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />
        <div style={{ height: "45vh", minHeight: 320 }}>
          <MapView
            filteredPlaces={filteredPlaces}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
        <FeaturedStrip places={places} onSelect={handleSelect} />
        {/* Routes panel inline below on mobile */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <RoutesPanel onSelectPlace={(id) => { const pl = places.find((p) => p.id === id); if (pl) handleSelect(pl); }} />
        </div>
      </div>

      {/* Alta de negocios */}
      <div className="rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Negocios
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-foreground">
              ¿Quieres aparecer en el mapa?
            </h2>
            <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
              Registra tu negocio y llega a la afición que recorre Los Cabos cada fin de semana.
            </p>
          </div>
          <button
            onClick={() => setShowLeadForm((v) => !v)}
            className="rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-primary-foreground"
          >
            {showLeadForm ? "Ocultar formulario" : "Quiero aparecer"}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {showLeadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <BrandLeadForm defaultInterest="mapa" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop bottom strip */}
      <div className="hidden md:block pt-2">
        <FeaturedStrip places={places} onSelect={handleSelect} />
      </div>

      {/* MOBILE bottom sheet */}
      <AnimatePresence>
        {isMobile && sheetOpen && selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBack}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl"
              style={{ height: "75vh" }}
            >
              <div className="flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1.5 rounded-full bg-muted-foreground/40" />
              </div>
              <div className="px-4 pb-4 h-[calc(75vh-1.75rem)]">
                <PlaceDetail place={selected} onBack={handleBack} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConoceLosCabos;

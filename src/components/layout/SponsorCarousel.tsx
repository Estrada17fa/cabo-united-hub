import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import sponsor05 from "@/assets/sponsors/sponsor-05.png";
import sponsor06 from "@/assets/sponsors/sponsor-06.png";
import sponsor07 from "@/assets/sponsors/sponsor-07.png";
import sponsor08 from "@/assets/sponsors/sponsor-08.png";
import sponsor09 from "@/assets/sponsors/sponsor-09.png";
import sponsor10 from "@/assets/sponsors/sponsor-10.png";
import { useSponsors } from "@/hooks/useSponsors";

/** Respaldo: si aún no hay patrocinadores en el panel, la banda nunca se ve vacía. */
const FALLBACK = [
  { id: "f5", name: "Patrocinador 5", logo_url: sponsor05, link_url: null },
  { id: "f6", name: "Patrocinador 6", logo_url: sponsor06, link_url: null },
  { id: "f7", name: "Patrocinador 7", logo_url: sponsor07, link_url: null },
  { id: "f8", name: "Patrocinador 8", logo_url: sponsor08, link_url: null },
  { id: "f9", name: "Patrocinador 9", logo_url: sponsor09, link_url: null },
  { id: "f10", name: "Patrocinador 10", logo_url: sponsor10, link_url: null },
];

/** Banda fija de patrocinadores: marquee de loop perfecto, logos homologados por altura. */
export function SponsorCarousel() {
  const { data } = useSponsors();
  const singleSetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [travelDistance, setTravelDistance] = useState(0);

  const sponsors = useMemo(
    () =>
      data && data.length > 0
        ? data.map((s) => ({ id: s.id, name: s.name, logo_url: s.logo_url, link_url: s.link_url }))
        : FALLBACK,
    [data],
  );

  useEffect(() => {
    const updateWidth = () => {
      if (singleSetRef.current && containerRef.current) {
        const setWidth = singleSetRef.current.getBoundingClientRect().width;
        const styles = window.getComputedStyle(containerRef.current);
        const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
        setTravelDistance(setWidth + gap);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (singleSetRef.current) resizeObserver.observe(singleSetRef.current);
    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [sponsors]);

  // Velocidad constante (px/s) para que con más logos no se acelere ni se corte.
  const duration = travelDistance > 0 ? Math.max(18, travelDistance / 26) : 30;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface-1/95 backdrop-blur-md safe-bottom">
      <div className="flex items-center overflow-hidden py-2">
        <motion.div
          ref={containerRef}
          className="flex w-max items-center gap-8"
          animate={travelDistance > 0 ? { x: [0, -travelDistance] } : { x: 0 }}
          transition={{
            x: { duration, repeat: Infinity, ease: "linear", repeatType: "loop" },
          }}
        >
          {[0, 1, 2, 3].map((copyIdx) => (
            <div
              key={`set-${copyIdx}`}
              ref={copyIdx === 0 ? singleSetRef : undefined}
              aria-hidden={copyIdx !== 0}
              className="flex items-center gap-8"
            >
              {sponsors.map((sponsor) => {
                const img = (
                  <img
                    src={sponsor.logo_url}
                    alt={copyIdx === 0 ? sponsor.name : ""}
                    className="h-7 w-auto max-w-none flex-shrink-0 object-contain opacity-90 transition-opacity hover:opacity-100"
                    loading="lazy"
                  />
                );
                return (
                  <div
                    key={`${copyIdx}-${sponsor.id}`}
                    className="flex h-7 flex-shrink-0 items-center justify-center px-2"
                  >
                    {sponsor.link_url && copyIdx === 0 ? (
                      <a
                        href={sponsor.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-7 items-center"
                      >
                        {img}
                      </a>
                    ) : (
                      img
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

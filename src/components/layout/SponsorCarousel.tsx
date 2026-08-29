import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import sponsor05 from "@/assets/sponsors/sponsor-05.png";
import sponsor06 from "@/assets/sponsors/sponsor-06.png";
import sponsor07 from "@/assets/sponsors/sponsor-07.png";
import sponsor08 from "@/assets/sponsors/sponsor-08.png";
import sponsor09 from "@/assets/sponsors/sponsor-09.png";
import sponsor10 from "@/assets/sponsors/sponsor-10.png";

const sponsors = [
  { id: 5, name: "Patrocinador 5", logo: sponsor05 },
  { id: 6, name: "Patrocinador 6", logo: sponsor06 },
  { id: 7, name: "Patrocinador 7", logo: sponsor07 },
  { id: 8, name: "Patrocinador 8", logo: sponsor08 },
  { id: 9, name: "Patrocinador 9", logo: sponsor09 },
  { id: 10, name: "Patrocinador 10", logo: sponsor10 },
];

/** Banda fija de patrocinadores: marquee de loop perfecto, logos homologados por altura. */
export function SponsorCarousel() {
  const singleSetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [travelDistance, setTravelDistance] = useState(0);

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
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface-1/95 backdrop-blur-md safe-bottom">
      <div className="flex items-center overflow-hidden py-2">
        <motion.div
          ref={containerRef}
          className="flex w-max items-center gap-8"
          animate={travelDistance > 0 ? { x: [0, -travelDistance] } : { x: 0 }}
          transition={{
            x: { duration: 30, repeat: Infinity, ease: "linear", repeatType: "loop" },
          }}
        >
          {[0, 1, 2, 3].map((copyIdx) => (
            <div
              key={`set-${copyIdx}`}
              ref={copyIdx === 0 ? singleSetRef : undefined}
              aria-hidden={copyIdx !== 0}
              className="flex items-center gap-8"
            >
              {sponsors.map((sponsor) => (
                <div
                  key={`${copyIdx}-${sponsor.id}`}
                  className="flex h-7 flex-shrink-0 items-center justify-center px-2"
                >
                  <img
                    src={sponsor.logo}
                    alt={copyIdx === 0 ? sponsor.name : ""}
                    className="h-7 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

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

export function SponsorCarousel() {
  const singleSetRef = useRef<HTMLDivElement>(null);
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (singleSetRef.current) {
        setSingleSetWidth(singleSetRef.current.scrollWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);

    if (singleSetRef.current) {
      resizeObserver.observe(singleSetRef.current);
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border py-2.5 sm:py-3 z-40 safe-bottom">
      <div className="overflow-hidden">
        <motion.div
          className="flex w-max items-center"
          animate={singleSetWidth > 0 ? { x: [0, -singleSetWidth] } : { x: 0 }}
          transition={{
            x: {
              duration: 16,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          <div ref={singleSetRef} className="flex items-center gap-2 sm:gap-8">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex h-7 sm:h-8 flex-shrink-0 items-center justify-center px-2 sm:px-6"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="h-7 sm:h-8 max-w-[72px] sm:max-w-none w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <div aria-hidden="true" className="flex items-center gap-2 sm:gap-8">
            {sponsors.map((sponsor) => (
              <div
                key={`duplicate-${sponsor.id}`}
                className="flex h-7 sm:h-8 flex-shrink-0 items-center justify-center px-2 sm:px-6"
              >
                <img
                  src={sponsor.logo}
                  alt=""
                  className="h-7 sm:h-8 max-w-[72px] sm:max-w-none w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

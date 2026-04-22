import { motion } from "framer-motion";
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
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border py-2.5 sm:py-3 z-40 safe-bottom">
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6 sm:gap-8 items-center"
          animate={{ x: [0, "-50%"] }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {duplicatedSponsors.map((sponsor, index) => (
            <div
              key={`${sponsor.id}-${index}`}
              className="flex-shrink-0 h-9 sm:h-8 px-5 sm:px-6 flex items-center justify-center"
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="h-9 sm:h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

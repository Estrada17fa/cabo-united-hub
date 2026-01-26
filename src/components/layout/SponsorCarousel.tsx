import { motion } from "framer-motion";

// Placeholder sponsors - these would be replaced with actual sponsor logos
const sponsors = [
  { id: 1, name: "Sponsor 1" },
  { id: 2, name: "Sponsor 2" },
  { id: 3, name: "Sponsor 3" },
  { id: 4, name: "Sponsor 4" },
  { id: 5, name: "Sponsor 5" },
  { id: 6, name: "Sponsor 6" },
];

export function SponsorCarousel() {
  // Duplicate sponsors for seamless loop
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border py-3 z-40">
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-8 items-center"
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
              className="flex-shrink-0 h-8 px-6 flex items-center justify-center"
            >
              <div className="bg-muted/50 rounded-lg px-4 py-2 border border-border">
                <span className="text-caption text-muted-foreground whitespace-nowrap">
                  {sponsor.name}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

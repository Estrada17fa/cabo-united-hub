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
  return (
    <div className="sponsor-carousel fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-40 safe-bottom">
      <div className="sponsor-carousel__viewport">
        <div className="sponsor-carousel__track">
          {[...sponsors, ...sponsors].map((sponsor, index) => (
            <div
              key={`${sponsor.id}-${index}`}
              className="sponsor-carousel__item"
              aria-hidden={index >= sponsors.length ? "true" : undefined}
            >
              <img
                src={sponsor.logo}
                alt={index >= sponsors.length ? "" : sponsor.name}
                className="sponsor-carousel__logo"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Flame } from "lucide-react";
import {
  CATEGORY_META,
  FEATURED_PLACE_IDS,
  Place,
  PLACES,
} from "@/lib/visita-los-cabos-data";

interface FeaturedStripProps {
  onSelect: (place: Place) => void;
}

export function FeaturedStrip({ onSelect }: FeaturedStripProps) {
  const featured = FEATURED_PLACE_IDS.map((id) =>
    PLACES.find((p) => p.id === id)
  ).filter(Boolean) as Place[];

  return (
    <div className="space-y-2">
      <h3 className="text-[13px] font-bold text-foreground px-1">
        Lugares Destacados esta Semana
      </h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {featured.map((place) => {
          const meta = CATEGORY_META[place.category];
          return (
            <button
              key={place.id}
              onClick={() => onSelect(place)}
              className="shrink-0 w-[180px] h-[100px] relative rounded-xl overflow-hidden border border-border hover:border-foreground/40 transition-all group text-left"
              style={{ background: place.photoGradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-2.5 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-md"
                    style={{
                      backgroundColor: "hsl(0 0% 0% / 0.5)",
                      color: meta.color,
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[12px] font-bold text-white leading-tight line-clamp-2">
                    {place.name}
                  </p>
                  <p className="text-[10px] text-white/80 flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5" style={{ color: "hsl(15 90% 65%)" }} />
                    {place.goingToday} fans van hoy
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
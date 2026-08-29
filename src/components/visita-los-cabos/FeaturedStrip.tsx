import { Flame } from "lucide-react";
import { Place, placeBackground } from "@/lib/visita-los-cabos-data";
import { useCategoryMeta } from "@/hooks/usePlaceCategories";
import { CategoryIcon } from "./CategoryIcon";


interface FeaturedStripProps {
  places: Place[];
  onSelect: (place: Place) => void;
}

export function FeaturedStrip({ places, onSelect }: FeaturedStripProps) {
  const featured = places.filter((p) => p.featured);
  const list = featured.length > 0 ? featured : places.slice(0, 6);

  if (list.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-[13px] font-bold text-foreground px-1">
        Lugares Destacados esta Semana
      </h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {list.map((place) => {
          const meta = CATEGORY_META[place.category] ?? CATEGORY_META.restaurantes;
          return (
            <button
              key={place.id}
              onClick={() => onSelect(place)}
              className="shrink-0 w-[180px] h-[100px] relative rounded-xl overflow-hidden border border-border hover:border-foreground/40 transition-all group text-left"
              style={{
                background: place.photoUrl ? undefined : placeBackground(place),
                borderLeft: `3px solid ${meta.color}`,
              }}
            >
              {place.photoUrl && (
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-2.5 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-md"
                    style={{
                      backgroundColor: "hsl(0 0% 0% / 0.5)",
                      color: meta.color,
                    }}
                  >
                    <CategoryIcon name={meta.icon} className="w-3 h-3" />
                    {meta.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[12px] font-bold text-white leading-tight line-clamp-2">
                    {place.name}
                  </p>
                  {place.goingToday != null ? (
                    <p className="text-[10px] text-white/80 flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-primary" />
                      <span className="font-display tabular-nums">{place.goingToday}</span>
                      fans van hoy
                    </p>
                  ) : (
                    place.area && (
                      <p className="text-[10px] text-white/70 line-clamp-1">{place.area}</p>
                    )
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

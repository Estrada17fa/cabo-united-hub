import { ArrowLeft, Clock, MapPin, MessageCircle, Navigation, Star, Flame, Users } from "lucide-react";
import {
  LCU_CYAN,
  Place,
  placeBackground,
  SPONSOR_GOLD,
} from "@/lib/visita-los-cabos-data";
import { useCategoryMeta } from "@/hooks/usePlaceCategories";
import { CategoryIcon } from "./CategoryIcon";

interface PlaceDetailProps {
  place: Place;
  onBack: () => void;
}

const AMBER = "hsl(42 95% 58%)";

export function PlaceDetail({ place, onBack }: PlaceDetailProps) {
  const { metaFor } = useCategoryMeta();
  const meta = metaFor(place.category);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coords[1]},${place.coords[0]}`;
  const waUrl = place.whatsapp
    ? `https://wa.me/${place.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  const hasStats =
    place.visitedBy != null || place.rating != null || place.goingToday != null;

  return (
    <div className="flex flex-col h-full">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-3 px-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al mapa
      </button>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
        {/* Photo */}
        <div
          className="relative w-full h-40 rounded-2xl overflow-hidden border border-border"
          style={
            place.photoUrl
              ? undefined
              : { background: placeBackground(place, meta.gradient) }
          }
        >
          {place.photoUrl && (
            <img
              src={place.photoUrl}
              alt={place.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {place.tier === "patrocinador" && (
            <div
              className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: SPONSOR_GOLD,
                color: "hsl(0 0% 8%)",
                boxShadow: `0 0 12px ${SPONSOR_GOLD}80`,
              }}
            >
              <Star className="w-3 h-3" fill="currentColor" />
              Patrocinador Oficial
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-[20px] font-bold text-white leading-tight">
              {place.name}
            </h2>
            <p className="text-[12px] text-white/70 mt-0.5 flex items-center gap-1.5">
              <CategoryIcon
                name={meta.icon}
                className="w-3.5 h-3.5"
                style={{ color: meta.color }}
              />
              <span style={{ color: meta.color }}>{meta.label}</span>
            </p>
          </div>
        </div>

        {/* Stats pills — solo lo capturado */}
        {hasStats && (
          <div className="flex gap-2 flex-wrap">
            {place.visitedBy != null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-foreground">
                <Users className="w-3 h-3 text-primary" />
                <span className="font-display tabular-nums">{place.visitedBy}</span>
                fans visitaron
              </span>
            )}
            {place.rating != null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-foreground">
                <Star className="w-3 h-3" style={{ color: AMBER, fill: AMBER }} />
                <span className="font-display tabular-nums">{place.rating}</span>
              </span>
            )}
            {place.goingToday != null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-foreground">
                <Flame className="w-3 h-3 text-primary" />
                <span className="font-display tabular-nums">{place.goingToday}</span>
                van hoy
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {place.description && (
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {place.description}
          </p>
        )}

        {/* Meta */}
        {(place.hours || place.area) && (
          <div className="space-y-2">
            {place.hours && (
              <div className="flex items-center gap-2 text-[12px] text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {place.hours}
              </div>
            )}
            {place.area && (
              <div className="flex items-center gap-2 text-[12px] text-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {place.area}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className={waUrl ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2"}>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-card border border-border text-[12px] font-semibold text-foreground hover:border-foreground/40 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{
              backgroundColor: LCU_CYAN,
              color: "hsl(0 0% 8%)",
              boxShadow: `0 4px 14px -4px ${LCU_CYAN}80`,
            }}
          >
            <Navigation className="w-3.5 h-3.5" />
            Cómo llegar
          </a>
        </div>
      </div>
    </div>
  );
}

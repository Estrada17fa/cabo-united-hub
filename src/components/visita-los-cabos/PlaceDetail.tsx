import { ArrowLeft, BadgeCheck, Clock, MapPin, MessageCircle, Navigation, Star, Flame, Users } from "lucide-react";
import { CATEGORY_META, LCU_CYAN, Place, SPONSOR_GOLD } from "@/lib/visita-los-cabos-data";
import { CategoryIcon } from "./CategoryIcon";

interface PlaceDetailProps {
  place: Place;
  onBack: () => void;
}

const AMBER = "hsl(42 95% 58%)";

export function PlaceDetail({ place, onBack }: PlaceDetailProps) {
  const meta = CATEGORY_META[place.category];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coords[1]},${place.coords[0]}`;
  const waUrl = place.whatsapp
    ? `https://wa.me/${place.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

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
        {/* Photo placeholder */}
        <div
          className="relative w-full h-40 rounded-2xl overflow-hidden border border-border"
          style={{ background: place.photoGradient }}
        >
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

        {/* Stats pills */}
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-foreground">
            <Users className="w-3 h-3 text-primary" />
            <span className="font-display tabular-nums">{place.visitedBy}</span>
            fans visitaron
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-foreground">
            <Star className="w-3 h-3" style={{ color: AMBER, fill: AMBER }} />
            <span className="font-display tabular-nums">{place.rating}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-foreground">
            <Flame className="w-3 h-3 text-primary" />
            <span className="font-display tabular-nums">{place.goingToday}</span>
            van hoy
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {place.description}
        </p>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {place.hours}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {place.area}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-card border border-border text-[12px] font-semibold text-foreground hover:border-foreground/40 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-card border border-border text-[12px] font-semibold text-muted-foreground opacity-50 cursor-not-allowed"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>
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

        {/* Reviews */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Lo que dicen los Amos
          </h3>
          {place.reviews.map((r, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-3 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">
                  {r.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground truncate">
                    {r.user}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-3 h-3"
                        style={{
                          color: idx < r.rating ? AMBER : "hsl(0 0% 25%)",
                          fill: idx < r.rating ? AMBER : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {r.text}
              </p>
              {r.verified && (
                <p
                  className="text-[10px] font-semibold inline-flex items-center gap-1"
                  style={{ color: SPONSOR_GOLD }}
                >
                  <BadgeCheck className="w-3 h-3" />
                  Visita verificada
                </p>
              )}
            </div>
          ))}

          <button className="text-[12px] text-primary hover:underline w-full text-left pt-1">
            Ver todas las reseñas →
          </button>
        </div>
      </div>
    </div>
  );
}

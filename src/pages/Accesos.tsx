import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Calendar, Phone, Clock, ArrowRight, Ticket, Gift, Sparkles, Repeat, Quote, ChevronLeft, ChevronRight, Check, Store, ChevronDown } from "lucide-react";
import stadiumHero from "@/assets/accesos-page-hero.jpg";
import mobileTeamBg from "@/assets/mobile-team-bg.jpg";
import kitFan from "@/assets/accesos-kit-fan.jpg";
import kitGold from "@/assets/accesos-kit-gold.jpg";
import kitPremium from "@/assets/accesos-kit-premium.jpg";
import kitPlatino from "@/assets/accesos-kit-platino.jpg";
import lcuCrest from "@/assets/lcu-crest.png";

const WHATSAPP_URL = "https://wa.me/525500000000";
const BOLETOMOVIL_URL = "https://www.boletomovil.com";

type TierId = "fan" | "gold" | "premium" | "platino";

type Tier = {
  id: TierId;
  badge: string;
  price: string;
  priceNote: string;
  tagline: string;
  cta: string;
  accent: string;
  image: string;
  popular?: boolean;
  benefits: {
    estadio: string[];
    kitName: string;
    kitTitle: string;
    kitItems: string[];
    experiencias: string[] | null;
    continuos: string[];
  };
};

const tiers: Tier[] = [
  {
    id: "fan",
    badge: "FAN",
    price: "$0",
    priceNote: "Gratis para siempre",
    tagline: "Empieza a vivir el paraíso, sin costo.",
    cta: "Únete gratis",
    accent: "#FFFFFF",
    image: kitFan,
    benefits: {
      estadio: ["10% de descuento en boletos", "Pase digital de aficionado"],
      kitName: "Kit Digital",
      kitTitle: "Kit Digital",
      kitItems: ["Pase digital", "Stickers de WhatsApp", "Wallpapers oficiales"],
      experiencias: null,
      continuos: [
        "5% de descuento en tienda oficial en primera compra",
        "Acceso exclusivo a Ediciones Limitadas en tienda",
        "Sorteos mensuales para la comunidad Fan",
        "Newsletter exclusivo con contenido del club",
      ],
    },
  },
  {
    id: "gold",
    badge: "GOLD",
    price: "$1,499",
    priceNote: "por temporada",
    tagline: "Tu lugar en la grada y el kit que te identifica.",
    cta: "Quiero mi Gold",
    accent: "#F59E0B",
    image: kitGold,
    benefits: {
      estadio: [
        "Entrada a todos los partidos en casa",
        "Nombre en el muro digital del estadio",
      ],
      kitName: "Kit Gold",
      kitTitle: "Kit Gold — entregado en bolsa oficial",
      kitItems: [
        "Kit Digital",
        "Tarjeta personalizada",
        "Gorra oficial",
        "Pin metálico",
        "Calcomanías oficiales",
        "Bufanda oficial",
        "Playera de merch",
      ],
      experiencias: null,
      continuos: [
        "10% de descuento en tienda oficial en primera compra",
        "Acceso exclusivo a Ediciones Limitadas",
        "Acceso exclusivo a Ediciones Especiales en tienda",
        "Preventa anticipada de boletos especiales",
        "Invitaciones a sorteos exclusivos Gold",
      ],
    },
  },
  {
    id: "premium",
    badge: "PREMIUM",
    price: "$2,499",
    priceNote: "por temporada",
    tagline: "Vive el partido desde adentro, con foto incluida.",
    cta: "Quiero mi Premium",
    accent: "#00abc4",
    image: kitPremium,
    popular: true,
    benefits: {
      estadio: [
        "Entrada a todos los partidos en casa",
        "Nombre en el muro digital",
        "Acceso VIP a área preferencial",
      ],
      kitName: "Kit Premium",
      kitTitle: "Kit Premium — entregado en caja clásica",
      kitItems: [
        "Kit Digital",
        "Tarjeta personalizada",
        "Gorra oficial",
        "Pin metálico",
        "Calcomanías oficiales",
        "Bufanda Edición Especial",
        "Jersey oficial",
        "Playera de merch",
        "Parche del equipo",
      ],
      experiencias: ["Foto con jugadores 1× por temporada"],
      continuos: [
        "20% de descuento en tienda oficial en primera compra",
        "Puntos dobles en Fan Zone",
        "Acceso exclusivo a Ediciones Limitadas",
        "Acceso exclusivo a Ediciones Especiales en tienda",
      ],
    },
  },
  {
    id: "platino",
    badge: "PLATINO",
    price: "$4,999",
    priceNote: "por temporada · edición Socio Fundador",
    tagline: "Tu nombre, tu asiento, tu temporada inolvidable.",
    cta: "Quiero mi Platino",
    accent: "#E2E8F0",
    image: kitPlatino,
    benefits: {
      estadio: [
        "Entrada a todos los partidos en casa",
        "Asiento personalizado con placa",
        "Nombre en el muro digital",
        "Acceso VIP a área preferencial",
      ],
      kitName: "Kit Platino",
      kitTitle: "Kit Platino — entregado en caja premium",
      kitItems: [
        "Kit Digital",
        "Tarjeta personalizada",
        "Gorra oficial",
        "Pin metálico",
        "Calcomanías oficiales",
        "Bufanda Edición Fundador",
        "Jersey oficial personalizado con tu nombre",
        "Playera de merch",
        "Tote bag premium",
        "Parche del equipo",
        "Certificado de Socio Fundador numerado",
      ],
      experiencias: [
        "Foto con jugadores 1× por temporada",
        "Tour del estadio y cancha 1×",
        "Acceso a entrenamiento abierto",
        "Anuncio de cumpleaños en estadio",
        "Meet & greet con jugadores",
        "Evento anual con la directiva",
      ],
      continuos: [
        "30% de descuento en tienda oficial en primera compra",
        "Puntos dobles en Fan Zone",
        "Acceso exclusivo a Ediciones Limitadas",
        "Acceso exclusivo a Ediciones Especiales en tienda",
      ],
    },
  },
];

const storyMoments = [
  {
    quote: "Cuando el estadio se enciende, ya no eres espectador. Eres parte de la historia.",
    label: "EL RUGIDO",
  },
  {
    quote: "Cada partido en casa es una cita con tu gente, tu equipo y tu paraíso.",
    label: "LA AFICIÓN",
  },
  {
    quote: "Aquí no hay gradas vacías ni aficiones de paso: queremos que todos seamos parte del paraíso.",
    label: "TODOS AL PARAÍSO",
  },
];

const POS = [
  {
    name: "OXXO Plaza Cabo San Lucas",
    address: "Blvd. Marina 100, Centro, Cabo San Lucas",
    hours: "Lun-Dom 24h",
    phone: "+52 624 143 0000",
    logo: null as string | null,
    coords: { lat: 22.8905, lng: -109.9167 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("OXXO Blvd. Marina 100, Centro, Cabo San Lucas"),
  },
  {
    name: "Tienda LC United Centro",
    address: "Av. Lázaro Cárdenas 200, San José del Cabo",
    hours: "Lun-Sáb 10:00–20:00",
    phone: "+52 624 142 1111",
    logo: lcuCrest,
    coords: { lat: 23.0608, lng: -109.7081 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Av. Lázaro Cárdenas 200, San José del Cabo"),
  },
  {
    name: "Estadio Don Koll - Taquilla",
    address: "Carretera Transpeninsular Km 4.5, San José del Cabo",
    hours: "Día de partido desde 14:00",
    phone: "+52 624 144 2222",
    logo: lcuCrest,
    coords: { lat: 23.0739, lng: -109.7237 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Estadio Don Koll, Carretera Transpeninsular Km 4.5, San José del Cabo"),
  },
  {
    name: "7-Eleven Plaza del Sol",
    address: "Carr. Transpeninsular 3000, Cabo San Lucas",
    hours: "Lun-Dom 24h",
    phone: "",
    logo: null as string | null,
    coords: { lat: 22.9034, lng: -109.9081 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("7-Eleven Plaza del Sol, Cabo San Lucas"),
  },
  {
    name: "Café Paraíso – San José",
    address: "Plaza Mijares S/N, Centro, San José del Cabo",
    hours: "Lun-Dom 09:00–22:00",
    phone: "",
    logo: null as string | null,
    coords: { lat: 23.0613, lng: -109.7036 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Plaza Mijares, Centro, San José del Cabo"),
  },
];

function BenefitGroup({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof Ticket;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4 md:p-5 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl"
          style={{ background: `${accent}1f`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}33` }}
        >
          <Icon className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: accent }}>
          {title}
        </h4>
      </div>
      <div className="text-[13px] text-white/85 leading-relaxed flex-1">{children}</div>
    </div>
  );
}

function BenefitChips({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] text-white/85"
          style={{
            background: `${accent}10`,
            border: `1px solid ${accent}30`,
          }}
        >
          <Check className="w-3 h-3" style={{ color: accent }} strokeWidth={3} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TierBigCard({ tier }: { tier: Tier }) {
  const groups = [
    {
      key: "estadio",
      icon: Ticket,
      label: "Acceso al estadio",
      content: <BenefitChips items={tier.benefits.estadio} accent={tier.accent} />,
    },
    {
      key: "kit",
      icon: Gift,
      label: tier.benefits.kitName,
      content: <BenefitChips items={tier.benefits.kitItems} accent={tier.accent} />,
    },
    ...(tier.benefits.experiencias
      ? [
          {
            key: "experiencias",
            icon: Sparkles,
            label: "Experiencias exclusivas",
            content: <BenefitChips items={tier.benefits.experiencias} accent={tier.accent} />,
          },
        ]
      : []),
    {
      key: "continuos",
      icon: Repeat,
      label: "Beneficios continuos",
      content: <BenefitChips items={tier.benefits.continuos} accent={tier.accent} />,
    },
  ];

  const [activeTab, setActiveTab] = useState(groups[0].key);
  const activeGroup = groups.find((g) => g.key === activeTab) ?? groups[0];
  const continuosSpansFull = !tier.benefits.experiencias;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: "#0f0f0f",
        border: `1px solid ${tier.accent}25`,
        boxShadow: tier.popular ? `0 0 40px ${tier.accent}1f` : undefined,
      }}
    >
      {/* Photo */}
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        <img
          src={tier.image}
          alt={`Kit ${tier.badge}`}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width={1280}
          height={800}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 60%, #0f0f0f 100%)",
          }}
        />
        {tier.popular && (
          <div
            className="absolute top-4 right-4 px-3 py-1 rounded-full font-bold"
            style={{ background: tier.accent, color: "#0a0a0a", fontSize: 11, letterSpacing: "0.1em" }}
          >
            MÁS POPULAR
          </div>
        )}
        <div className="absolute bottom-4 left-5 right-5">
          <div className="text-[11px] font-medium text-white/60 tracking-[0.18em] mb-1">
            AMO DEL PARAÍSO
          </div>
          <div
            className="font-extrabold leading-none"
            style={{ color: tier.accent, fontSize: 38, letterSpacing: "0.04em" }}
          >
            {tier.badge}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 md:p-7 flex-1 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-white/80 text-[13.5px] md:text-[15px] leading-snug flex-1 min-w-0">{tier.tagline}</p>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-none whitespace-nowrap">
              {tier.price}
            </div>
            <div className="text-[11px] md:text-[12px] text-white/55 mt-1 max-w-[140px] ml-auto leading-tight">{tier.priceNote}</div>
          </div>
        </div>

        {/* Desktop: 2x2 grid */}
        <div className="hidden sm:grid grid-cols-2 gap-3 auto-rows-fr">
          {groups.map((g, i) => {
            const isContinuos = g.key === "continuos";
            return (
              <div
                key={g.key}
                className={(continuosSpansFull && isContinuos ? "col-span-2 " : "") + "h-full"}
              >
                <BenefitGroup icon={g.icon} title={g.label} accent={tier.accent}>
                  {g.content}
                </BenefitGroup>
              </div>
            );
          })}
        </div>

        {/* Mobile: tabs (one section visible at a time) */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            {groups.map((g) => {
              const active = g.key === activeTab;
              const Icon = g.icon;
              return (
                <button
                  key={g.key}
                  onClick={() => setActiveTab(g.key)}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap transition-colors"
                  style={{
                    background: active ? `${tier.accent}` : "rgba(255,255,255,0.05)",
                    color: active ? "#0a0a0a" : "rgba(255,255,255,0.7)",
                    border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon className="w-3 h-3" strokeWidth={2.5} />
                  {g.label.split(" ")[0]}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeGroup.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <BenefitGroup icon={activeGroup.icon} title={activeGroup.label} accent={tier.accent}>
                {activeGroup.content}
              </BenefitGroup>
            </motion.div>
          </AnimatePresence>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 font-bold transition-opacity hover:opacity-90"
          style={{
            height: 54,
            borderRadius: 12,
            fontSize: 15,
            background: tier.id === "fan" ? "transparent" : tier.accent,
            color: tier.id === "fan" ? "#fff" : "#0a0a0a",
            border: tier.id === "fan" ? "1px solid rgba(255,255,255,0.25)" : "none",
          }}
        >
          {tier.cta}
          {tier.id !== "fan" && <ArrowRight className="w-4 h-4" />}
        </a>
      </div>
    </motion.article>
  );
}

function TierCarousel() {
  const [index, setIndex] = useState(2); // start on Premium (popular)
  const tier = tiers[index];
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + tiers.length) % tiers.length);

  return (
    <div>
      {/* Tier tabs */}
      <div className="flex items-center justify-center gap-1 md:gap-2 mb-6 px-1 flex-nowrap">
        {tiers.map((t, i) => {
          const active = i === index;
          return (
            <button
              key={t.id}
              onClick={() => setIndex(i)}
              className="relative px-2.5 md:px-5 py-1.5 md:py-2 rounded-full text-[10.5px] md:text-[13px] font-bold uppercase tracking-[0.04em] md:tracking-[0.08em] transition-all whitespace-nowrap"
              style={{
                background: active ? t.accent : "rgba(255,255,255,0.05)",
                color: active ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: active ? `0 6px 20px ${t.accent}33` : undefined,
              }}
            >
              {t.badge}
            </button>
          );
        })}
      </div>

      {/* Carousel viewport */}
      <div className="relative">
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <TierBigCard key={tier.id} tier={tier} />
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          aria-label="Nivel anterior"
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-5 lg:-left-14 items-center justify-center w-11 h-11 rounded-full bg-card/90 backdrop-blur border border-border text-white hover:bg-card transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Siguiente nivel"
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-5 lg:-right-14 items-center justify-center w-11 h-11 rounded-full bg-card/90 backdrop-blur border border-border text-white hover:bg-card transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile arrows + dots */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => go(-1)}
          aria-label="Nivel anterior"
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {tiers.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir a ${t.badge}`}
              className="rounded-full transition-all"
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                background: i === index ? t.accent : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Siguiente nivel"
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PointsOfSale() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 },
    );
  }, []);

  const sorted = useMemo(() => {
    if (!userCoords) return POS.map((p) => ({ ...p, distanceKm: null as number | null }));
    const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
      const R = 6371;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(x));
    };
    return POS.map((p) => ({ ...p, distanceKm: haversine(userCoords, p.coords) })).sort(
      (a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0),
    );
  }, [userCoords]);

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + sorted.length) % sorted.length);

  return (
    <section className="max-w-6xl mx-auto mt-8 mb-4">
      <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-white">Puntos de venta físicos</h3>
          <p className="text-[13px] text-white/60">
            Paga en efectivo en estos establecimientos
            {userCoords && " · ordenados por cercanía"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-card border border-border text-white hover:border-[#00abc4]/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-card border border-border text-white hover:border-[#00abc4]/50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden -mx-1">
        <motion.div
          className="flex"
          animate={{ x: `${(-active * 100) / sorted.length}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          style={{ width: `${sorted.length * 100}%` }}
        >
          {sorted.map((p, i) => (
            <div
              key={p.name}
              className="px-1"
              style={{ width: `${100 / sorted.length}%` }}
            >
              <div
                role="link"
                tabIndex={0}
                onClick={() => window.open(p.mapsUrl, "_blank", "noopener,noreferrer")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    window.open(p.mapsUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className="cursor-pointer rounded-2xl p-5 border border-border flex items-start gap-4 transition-colors hover:border-[#00abc4]/40 hover:bg-white/[0.02]"
                style={{ background: "#111" }}
              >
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                  {p.logo ? (
                    <img src={p.logo} alt={p.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <Store className="w-8 h-8" style={{ color: "#00abc4" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-base font-bold text-white">{p.name}</div>
                    {i === 0 && userCoords && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                        style={{ background: "#00abc4", color: "#0a0a0a" }}
                      >
                        Más cercano
                      </span>
                    )}
                    {p.distanceKm != null && (
                      <span className="text-[11px] text-white/50">
                        a {p.distanceKm < 1 ? `${Math.round(p.distanceKm * 1000)} m` : `${p.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/60 mt-1.5 flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{p.address}</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {p.hours}
                  </div>
                  {p.phone ? (
                    <a
                      href={`tel:${p.phone.replace(/\s/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs mt-1.5 inline-flex items-center gap-1 hover:underline"
                      style={{ color: "#00abc4" }}
                    >
                      <Phone className="w-3 h-3" /> {p.phone}
                    </a>
                  ) : (
                    <div className="text-[11px] text-white/40 mt-1.5">Sin teléfono · Toca para ver en mapa</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {sorted.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActive(i)}
            aria-label={`Ir a ${p.name}`}
            className="rounded-full transition-all"
            style={{
              width: i === active ? 22 : 8,
              height: 8,
              background: i === active ? "#00abc4" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </section>
  );
}

const Accesos = () => {
  useEffect(() => {
    [kitFan, kitGold, kitPremium, kitPlatino, stadiumHero, mobileTeamBg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* HERO — storytelling */}
      <div className="relative -mx-3 sm:-mx-4 lg:-mx-[calc((100vw-100%)/2)] -mt-4 md:-mt-6">
        <div className="relative w-full overflow-hidden" style={{ minHeight: 560 }}>
          <img
            src={mobileTeamBg}
            alt="Afición Los Cabos United"
            className="md:hidden absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <img
            src={stadiumHero}
            alt="Estadio Los Cabos United"
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 70%, #0a0a0a 100%)",
            }}
          />

          <div className="relative z-10 px-4 pt-6 md:pt-10 pb-10 md:pb-14 max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-bold mb-4"
              style={{ color: "#00abc4", fontSize: 11, letterSpacing: "0.18em" }}
            >
              TEMPORADA 2025–26 · AMOS DEL PARAÍSO
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7 }}
              className="font-bold text-white mb-5"
              style={{
                fontSize: "clamp(26px, 5.2vw, 58px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              No vienes a ver un partido.
              <br />
              <span style={{ color: "#00abc4" }}>Vienes a defender tu paraíso.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.7 }}
              className="mx-auto text-white/80 text-[14.5px] md:text-[18px] leading-snug md:leading-relaxed"
              style={{ maxWidth: 1100 }}
            >
              En cada cántico late un nombre, en cada bandera vive una promesa.
              Aquí el mar se queda en la orilla y la grada se vuelve casa: somos
              los que cantan cuando duele y celebran como si fuera la primera vez.
              Defender este escudo es defender lo nuestro.
            </motion.p>

            {/* Loop video — full width of content, shorter height */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.7 }}
              className="mt-10 mx-auto rounded-2xl overflow-hidden relative aspect-[16/10] md:aspect-[3/1]"
              style={{
                maxWidth: 1500,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 80px -30px rgba(0,171,196,0.35)",
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={stadiumHero}
                className="absolute inset-0 w-full h-full object-cover"
                aria-label="Afición y partidos Los Cabos United"
              >
                {/* TODO: reemplazar con video oficial de la afición */}
              </video>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.45) 100%)",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <a
                href="#niveles"
                className="inline-flex items-center justify-center gap-2 font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  height: 54,
                  padding: "0 26px",
                  borderRadius: 12,
                  fontSize: 15,
                  background: "#00abc4",
                  color: "#0a0a0a",
                  minWidth: 220,
                  boxShadow: "0 12px 30px -10px rgba(0,171,196,0.6)",
                }}
              >
                Quiero ser parte
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#niveles"
                className="group inline-flex items-center justify-center gap-2 font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  height: 54,
                  padding: "0 22px",
                  borderRadius: 12,
                  fontSize: 14,
                  color: "#fff",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(0,171,196,0.45)",
                  backdropFilter: "blur(6px)",
                }}
              >
                Conoce los 4 niveles
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" style={{ color: "#00abc4" }} />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Storytelling moments */}
      <section className="max-w-6xl mx-auto px-1 mt-5 md:mt-8">
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {storyMoments.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-2xl p-5 md:p-6"
              style={{
                background: "linear-gradient(135deg, #111, #0a0a0a)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Quote className="w-5 h-5 mb-3" style={{ color: "#00abc4" }} />
              <p className="text-white text-[15px] md:text-base leading-snug font-medium">
                {m.quote}
              </p>
              <div
                className="mt-4 text-[10px] font-bold tracking-[0.18em]"
                style={{ color: "#00abc4" }}
              >
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIER BIG CARDS */}
      <section id="niveles" className="max-w-5xl mx-auto mt-12 md:mt-16 scroll-mt-24">
        <div className="text-center mb-5 md:mb-6 px-2">
          <div
            className="font-bold mb-3"
            style={{ color: "#00abc4", fontSize: 11, letterSpacing: "0.18em" }}
          >
            ELIGE TU NIVEL
          </div>
          <h2
            className="font-bold text-white"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            Cuatro formas de ser <span style={{ color: "#00abc4" }}>Amo del Paraíso</span>
          </h2>
          <p className="text-sm text-white/60 mt-3 max-w-xl mx-auto">
            Desde el pase digital gratuito hasta el Socio Fundador con asiento personalizado.
            Todos pertenecen. Algunos lo viven más cerca.
          </p>
        </div>

        <TierCarousel />
      </section>

      {/* BOLETOMOVIL SECTION */}
      <section className="max-w-6xl mx-auto mt-16">
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, #0d1a0d, #111)",
            border: "1px solid rgba(0,171,196,0.15)",
          }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div
                className="font-bold mb-3"
                style={{ color: "#00abc4", fontSize: 11, letterSpacing: "0.15em" }}
              >
                BOLETOS · PARTIDO A PARTIDO
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">¿No tienes abono?</h3>
              <p className="text-sm text-white/60 mb-6 max-w-md">
                Compra tus boletos para el siguiente partido de manera rápida y
                segura en Boletomovil
              </p>

              <div className="flex items-start gap-3 mb-2">
                <Calendar className="w-4 h-4 text-white/60 mt-1" />
                <div className="flex-1">
                  <div className="text-xs text-white/60 mb-2">Próximo partido en casa:</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <img src={lcuCrest} alt="Los Cabos United" className="w-9 h-9 object-contain" />
                      <span className="text-sm font-bold text-white">LCU</span>
                    </div>
                    <span className="text-white/40 text-xs font-bold">VS</span>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 flex items-center justify-center text-[11px] font-extrabold text-white/80">
                        RFC
                      </div>
                      <span className="text-sm font-bold text-white">Rival FC</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/60 mt-2">
                    Dom 27 Abr · Estadio Don Koll
                  </div>
                </div>
              </div>
              <div className="font-bold mt-3" style={{ color: "#00abc4" }}>
                Desde $150 MXN
              </div>
            </div>

            <div className="flex flex-col items-center">
              <a
                href={BOLETOMOVIL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold transition-opacity hover:opacity-90"
                style={{
                  height: 56,
                  minWidth: 280,
                  background: "#00abc4",
                  color: "#0a0a0a",
                  fontSize: 16,
                  borderRadius: 12,
                }}
              >
                Comprar en Boletomovil
                <ArrowRight className="w-5 h-5" />
              </a>
              <div className="mt-3 text-xs text-white/50 text-center">
                Plataforma oficial de venta de boletos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PUNTOS DE VENTA FÍSICOS */}
      <PointsOfSale />
    </motion.div>
  );
};

export default Accesos;

import { motion } from "framer-motion";
import { MapPin, Calendar, Phone, Clock, ArrowRight, ExternalLink, Heart, Shirt, Users } from "lucide-react";
import stadiumHero from "@/assets/accesos-page-hero.jpg";
import mobileTeamBg from "@/assets/mobile-team-bg.jpg";
import kitFan from "@/assets/kit-fan.jpg";
import kitGold from "@/assets/kit-gold.jpg";
import kitPremium from "@/assets/kit-premium.jpg";
import kitPlatino from "@/assets/kit-platino.jpg";
import posOxxo from "@/assets/pos-oxxo.png";
import posTienda from "@/assets/pos-tienda.png";
import posEstadio from "@/assets/pos-estadio.png";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const WHATSAPP_URL = "https://wa.me/525500000000";
const BOLETOMOVIL_URL = "https://www.boletomovil.com";

type Tier = {
  id: "free" | "gold" | "premium" | "platino";
  name: string;
  label: string;
  price: string;
  priceMonthly?: string;
  badge: string;
  cta: string;
  accent: string;
  textOnAccent: string;
  tagline: string;
};

const tiers: Tier[] = [
  {
    id: "free",
    name: "Amo del Paraíso Fan",
    label: "AMO DEL PARAÍSO",
    price: "$0",
    badge: "FAN",
    cta: "Únete como Fan",
    accent: "#FFFFFF",
    textOnAccent: "#0a0a0a",
    tagline: "Acceso digital y comunidad oficial",
  },
  {
    id: "gold",
    name: "Amo del Paraíso Gold",
    label: "AMO DEL PARAÍSO GOLD",
    price: "$1,499",
    badge: "GOLD",
    cta: "Quiero mi Gold",
    accent: "#F59E0B",
    textOnAccent: "#0a0a0a",
    tagline: "Entrada a partidos + kit oficial básico",
  },
  {
    id: "premium",
    name: "Amo del Paraíso Premium",
    label: "AMO DEL PARAÍSO PREMIUM",
    price: "$2,499",
    badge: "PREMIUM",
    cta: "Quiero mi Premium",
    accent: "#00abc4",
    textOnAccent: "#0a0a0a",
    tagline: "Acceso VIP + foto con jugadores",
  },
  {
    id: "platino",
    name: "Amo del Paraíso Platino",
    label: "AMO DEL PARAÍSO PLATINO",
    price: "$4,499",
    priceMonthly: "o $416/mes",
    badge: "PLATINO",
    cta: "Quiero mi Platino",
    accent: "#E2E8F0",
    textOnAccent: "#0a0a0a",
    tagline: "Experiencia completa + jersey personalizado",
  },
];

function MembershipCard({ tier }: { tier: Tier }) {
  let topStyle: React.CSSProperties = {};
  let cardStyle: React.CSSProperties = {};
  let labelColor = "#FFFFFF";
  let topBorder = "1px solid rgba(255,255,255,0.1)";
  let extraShadow = "";

  switch (tier.id) {
    case "free":
      cardStyle = { background: "#1a1a1a" };
      topStyle = { background: "linear-gradient(135deg, #1a1a1a, #222)" };
      break;
    case "gold":
      cardStyle = { background: "linear-gradient(135deg, #1a1200, #1a1a1a)" };
      topStyle = { background: "linear-gradient(135deg, #2a1f00, #1a1400)" };
      labelColor = "#F59E0B";
      topBorder = "3px solid #F59E0B";
      break;
    case "premium":
      cardStyle = { background: "linear-gradient(135deg, #001a1f, #0a1a1f)" };
      topStyle = { background: "linear-gradient(135deg, #002a35, #001a22)" };
      labelColor = "#00abc4";
      topBorder = "3px solid #00abc4";
      extraShadow = "0 0 40px rgba(0,171,196,0.2)";
      break;
    case "platino":
      cardStyle = { background: "linear-gradient(135deg, #111, #1a1a1a)" };
      topStyle = { background: "linear-gradient(135deg, #1f1f1f, #111)" };
      labelColor = "#E2E8F0";
      topBorder = "3px solid #E2E8F0";
      extraShadow = "0 0 20px rgba(226,232,240,0.08)";
      break;
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        ...cardStyle,
        borderTop: topBorder,
        boxShadow: extraShadow || undefined,
        minHeight: 200,
      }}
    >
      {/* Top visual area */}
      <div
        className="relative flex items-center justify-center"
        style={{ ...topStyle, height: 110 }}
      >
        {/* Shimmer overlay for platino */}
        {tier.id === "platino" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
              backgroundSize: "200% auto",
              animation: "boletos-shimmer 3s linear infinite",
            }}
          />
        )}

        {/* "MÁS POPULAR" pill for premium */}
        {tier.id === "premium" && (
          <div
            className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-1 rounded-b-lg font-bold shadow-lg"
            style={{
              background: "#00abc4",
              color: "#0a0a0a",
              fontSize: 11,
              letterSpacing: "0.08em",
            }}
          >
            MÁS POPULAR
          </div>
        )}

        {/* Label stack */}
        <div className="relative z-10 flex flex-col items-center text-center px-3">
          <span
            className="font-medium text-white/60"
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
            }}
          >
            AMO DEL PARAÍSO
          </span>
          <span
            className="font-extrabold mt-1"
            style={{
              fontSize: 26,
              color: labelColor,
              letterSpacing: "0.05em",
              lineHeight: 1,
            }}
          >
            {tier.badge}
          </span>
          <span
            className="block mt-2 rounded-full"
            style={{
              width: 32,
              height: 2,
              background: labelColor,
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 py-4 flex-1 flex items-center">
        <p
          className="text-white/75 leading-snug"
          style={{ fontSize: 13 }}
        >
          {tier.tagline}
        </p>
      </div>
    </div>
  );
}

function PriceAndCta({ tier }: { tier: Tier }) {
  const buttonStyle: React.CSSProperties =
    tier.id === "free"
      ? {
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff",
        }
      : tier.id === "platino"
      ? {
          background: "#FFFFFF",
          color: "#0a0a0a",
        }
      : { background: tier.accent, color: tier.textOnAccent };

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div>
        <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">{tier.price}</div>
        <div className="text-[13px] text-white/60 mt-1">por temporada</div>
        {tier.priceMonthly && (
          <div className="text-[13px] text-white/70 mt-0.5">{tier.priceMonthly}</div>
        )}
      </div>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 font-bold transition-opacity hover:opacity-90 relative overflow-hidden"
        style={{
          height: 52,
          borderRadius: 10,
          fontSize: 15,
          ...buttonStyle,
        }}
      >
        {tier.id === "platino" && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 30%, rgba(0,0,0,0.05) 50%, transparent 70%)",
              backgroundSize: "200% auto",
              animation: "boletos-shimmer 3s linear infinite",
            }}
          />
        )}
        <span className="relative">{tier.cta}</span>
        {tier.id !== "free" && <ArrowRight className="w-4 h-4 relative" />}
      </a>
    </div>
  );
}

const tierBenefits: Record<Tier["id"], { kitName: string; kitImage: string; highlight: string; benefits: string[] }> = {
  free: {
    kitName: "Kit Digital",
    kitImage: kitFan,
    highlight: "Para empezar a sentir los colores sin costo.",
    benefits: [
      "Pase digital oficial",
      "Stickers de WhatsApp exclusivos",
      "Wallpapers para tu celular",
      "5% de descuento en tienda oficial",
      "Acceso a la comunidad rojinegra",
    ],
  },
  gold: {
    kitName: "Kit Básico",
    kitImage: kitGold,
    highlight: "Tu primer abono: entras al estadio con los colores puestos.",
    benefits: [
      "Entrada general a todos los partidos en casa",
      "Tarjeta personalizada + Gorra oficial",
      "Pin metálico + paquete de stickers",
      "Tu nombre en el muro digital del estadio",
      "10% de descuento en tienda oficial",
    ],
  },
  premium: {
    kitName: "Kit Medio",
    kitImage: kitPremium,
    highlight: "El favorito: vives el partido desde el área VIP con jersey puesto.",
    benefits: [
      "Todo lo del nivel Gold",
      "Jersey oficial + playera merch + parche + bandera",
      "Acceso VIP / área preferencial",
      "Foto con jugadores (1x por temporada)",
      "Puntos dobles en Fan Zone",
      "25% de descuento en tienda oficial",
    ],
  },
  platino: {
    kitName: "Kit Platino",
    kitImage: kitPlatino,
    highlight: "La experiencia completa: tu nombre en el jersey, en el muro y con el equipo.",
    benefits: [
      "Todo lo del nivel Premium",
      "Jersey personalizado con tu nombre",
      "Mochila oficial",
      "Meet & greet con jugadores",
      "40% de descuento en tienda oficial",
      "Atención prioritaria por WhatsApp",
    ],
  },
};

const POS = [
  {
    name: "Tienda Express Cabo San Lucas",
    address: "Blvd. Marina 100, Centro, Cabo San Lucas",
    hours: "Lun-Dom 24h",
    phone: "+52 624 143 0000",
    logo: posOxxo,
  },
  {
    name: "Tienda LC United Centro",
    address: "Av. Lázaro Cárdenas 200, San José del Cabo",
    hours: "Lun-Sáb 10:00–20:00",
    phone: "+52 624 142 1111",
    logo: posTienda,
  },
  {
    name: "Estadio Don Koll - Taquilla",
    address: "Carretera Transpeninsular Km 4.5, San José del Cabo",
    hours: "Día de partido desde 14:00",
    phone: "+52 624 144 2222",
    logo: posEstadio,
  },
];

const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const Accesos = () => {
  return (
    <>
      <style>{`
        @keyframes boletos-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* HERO — break out of container padding */}
        <div className="relative -mx-3 sm:-mx-4 lg:-mx-[calc((100vw-100%)/2)]">
          <div
            className="relative w-full overflow-hidden"
            style={{ minHeight: 580 }}
          >
            <img
              src={mobileTeamBg}
              alt="Plantel Los Cabos United"
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
                  "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 60%, #0a0a0a 100%)",
              }}
            />

            {/* Hero content top 40% */}
            <div className="relative z-10 px-4 pt-16 md:pt-24 text-center max-w-3xl mx-auto">
              <div
                className="font-bold mb-4"
                style={{
                  color: "#00abc4",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                }}
              >
                TEMPORADA 2025–26
              </div>
              <h1
                className="font-bold text-white mb-4"
                style={{
                  fontSize: "clamp(32px, 6vw, 52px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                Únete y sé Amo del Paraíso
              </h1>
              <p
                className="mx-auto text-white/70"
                style={{
                  fontSize: 16,
                  maxWidth: 520,
                  lineHeight: 1.5,
                }}
              >
                Únete al abono oficial y vive Los Cabos United como nunca antes
              </p>
            </div>

            {/* Cards row, overlapping bottom of hero */}
            <div
              className="absolute left-0 right-0 z-20 px-4"
              style={{ top: "50%" }}
            >
              <div className="max-w-[1100px] mx-auto">
                <div
                  className="hidden md:grid gap-4"
                  style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                >
                  {tiers.map((t) => (
                    <MembershipCard key={t.id} tier={t} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile cards (horizontal scroll) */}
        <div className="md:hidden -mx-3 mt-[-340px] relative z-20 mb-6">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-3 pb-2">
            {tiers.map((t) => (
              <div
                key={t.id}
                className="snap-center shrink-0"
                style={{ width: "80vw" }}
              >
                <MembershipCard tier={t} />
                <PriceAndCta tier={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop pricing/CTA aligned to columns */}
        <div className="hidden md:block max-w-[1100px] mx-auto px-4 mt-2">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {tiers.map((t) => (
              <PriceAndCta key={t.id} tier={t} />
            ))}
          </div>
        </div>

        {/* Tablet 2x2 fallback handled by breakpoints — keep simple: md uses 4-col, sm uses scroll */}

        {/* STORYTELLING — por qué ser socio */}
        <section className="max-w-4xl mx-auto mt-16 md:mt-24 px-2 text-center">
          <div
            className="font-bold mb-4"
            style={{ color: "#00abc4", fontSize: 11, letterSpacing: "0.18em" }}
          >
            POR QUÉ SER AMO DEL PARAÍSO
          </div>
          <h2
            className="font-extrabold text-white"
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            No compras un boleto.
            <br />
            <span className="gradient-text">Te vuelves parte del paraíso.</span>
          </h2>
          <p className="mt-5 mx-auto text-white/70 text-base md:text-lg" style={{ maxWidth: 580 }}>
            Cada gol, cada grito, cada victoria — los vives desde adentro.
            Esto no es ver al equipo: es ser el equipo.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-10 text-left">
            {[
              { icon: Heart, title: "Tu lugar en la grada", desc: "Desde el primer minuto, tu asiento te espera cada partido en casa." },
              { icon: Shirt, title: "Los colores puestos", desc: "Kit oficial que te identifica como parte de la familia rojinegra." },
              { icon: Users, title: "Una familia rojinegra", desc: "Eventos, sorteos y experiencias exclusivas solo para socios." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 items-start">
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,171,196,0.12)", border: "1px solid rgba(0,171,196,0.3)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#00abc4" }} />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{title}</div>
                  <div className="text-xs text-white/60 mt-1 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#niveles"
            className="inline-flex items-center gap-2 mt-10 text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            Elige tu nivel ↓
          </a>
        </section>

        {/* TABS POR NIVEL CON KIT MOCKUP */}
        <section id="niveles" className="max-w-6xl mx-auto mt-12 md:mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">¿Qué incluye cada nivel?</h2>
            <p className="text-sm text-white/60 mt-2">Mira el kit y los beneficios de tu abono</p>
          </div>

          <Tabs defaultValue="premium" className="w-full">
            <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
              <TabsList className="bg-transparent p-0 h-auto gap-2 flex w-max mx-auto">
                {tiers.map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="relative rounded-full px-5 py-2.5 text-sm font-bold border data-[state=active]:shadow-lg transition-all"
                    style={{
                      borderColor: "rgba(255,255,255,0.1)",
                      background: "#111",
                      color: "rgba(255,255,255,0.6)",
                      // active styles via CSS-in-JS not available; use data attrs through className override
                    } as React.CSSProperties}
                  >
                    <span
                      className="relative z-10"
                      style={{ color: undefined }}
                    >
                      {t.badge}
                    </span>
                    {t.id === "premium" && (
                      <span
                        className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "#00abc4", color: "#0a0a0a", fontSize: 9, letterSpacing: "0.05em" }}
                      >
                        POPULAR
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tiers.map((t) => {
              const data = tierBenefits[t.id];
              return (
                <TabsContent key={t.id} value={t.id} className="mt-8">
                  <div
                    className="rounded-2xl overflow-hidden border"
                    style={{
                      background: "linear-gradient(135deg, #0f0f0f, #141414)",
                      borderColor: `${t.accent}40`,
                      boxShadow: `0 0 60px -20px ${t.accent}30`,
                    }}
                  >
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Imagen del kit */}
                      <div
                        className="relative aspect-square md:aspect-auto md:min-h-[420px] flex items-center justify-center"
                        style={{ background: "#0a0a0a" }}
                      >
                        <img
                          src={data.kitImage}
                          alt={`${data.kitName} - ${t.name}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={1024}
                          height={1024}
                        />
                        <div
                          className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md"
                          style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${t.accent}50`, color: t.accent }}
                        >
                          {data.kitName}
                        </div>
                      </div>

                      {/* Beneficios */}
                      <div className="p-6 md:p-8 flex flex-col">
                        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accent }}>
                          {t.badge}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1">{t.name}</h3>

                        <div
                          className="mt-4 px-4 py-3 rounded-xl text-sm italic"
                          style={{
                            background: `${t.accent}10`,
                            borderLeft: `3px solid ${t.accent}`,
                            color: "rgba(255,255,255,0.85)",
                          }}
                        >
                          "{data.highlight}"
                        </div>

                        <ul className="mt-5 space-y-2.5 flex-1">
                          {data.benefits.map((b) => (
                            <li key={b} className="flex items-start gap-2.5 text-sm text-white/85">
                              <span
                                className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full mt-0.5"
                                style={{ background: t.accent }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                              {b}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 pt-5 border-t border-white/10">
                          <PriceAndCta tier={t} />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </section>

        {/* BOLETOMOVIL SECTION */}
        <section className="max-w-6xl mx-auto mt-12">
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
                  style={{
                    color: "#00abc4",
                    fontSize: 11,
                    letterSpacing: "0.15em",
                  }}
                >
                  BOLETOS · PARTIDO A PARTIDO
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  ¿No tienes abono?
                </h3>
                <p className="text-sm text-white/60 mb-6 max-w-md">
                  Compra tus boletos para el siguiente partido de manera rápida y
                  segura en Boletomovil
                </p>

                <div className="flex items-start gap-3 mb-2">
                  <Calendar className="w-4 h-4 text-white/60 mt-1" />
                  <div>
                    <div className="text-xs text-white/60">Próximo partido en casa:</div>
                    <div className="text-base font-bold text-white">
                      Los Cabos United vs Rival FC
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
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
        <section className="max-w-6xl mx-auto mt-8 mb-4">
          <h3 className="text-lg font-bold text-white">Puntos de venta físicos</h3>
          <p className="text-[13px] text-white/60 mb-4">
            Paga en efectivo en estos establecimientos · Toca para ver en Google Maps
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            {POS.map((p) => (
              <a
                key={p.name}
                href={mapsUrl(p.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl p-4 border border-border block transition-all hover:border-[#00abc4]/50 hover:-translate-y-0.5"
                style={{ background: "#111" }}
              >
                <ExternalLink className="absolute top-3 right-3 w-3.5 h-3.5 text-white/30 group-hover:text-[#00abc4] transition-colors" />
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-14 h-14 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={p.logo}
                      alt={`Logo ${p.name}`}
                      className="w-full h-full object-contain p-1.5"
                      loading="lazy"
                      width={56}
                      height={56}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{p.name}</div>
                    <div className="text-xs text-white/60 mt-1 flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#00abc4" }} />
                      <span>{p.address}</span>
                    </div>
                    <div className="text-xs text-white/60 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.hours}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `tel:${p.phone.replace(/\s/g, "")}`;
                      }}
                      className="text-xs mt-1 flex items-center gap-1 hover:underline"
                      style={{ color: "#00abc4" }}
                    >
                      <Phone className="w-3 h-3" /> {p.phone}
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default Accesos;

import { motion } from "framer-motion";
import { useState } from "react";
import { Info, MapPin, Calendar, Phone, Clock, ArrowRight } from "lucide-react";
import stadiumHero from "@/assets/stadium-hero.jpg";
import lcuCrest from "@/assets/lcu-crest.png";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

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
};

const tiers: Tier[] = [
  {
    id: "free",
    name: "Amo del Paraíso",
    label: "AMO DEL PARAÍSO",
    price: "$0",
    badge: "GRATIS",
    cta: "Únete gratis",
    accent: "#FFFFFF",
    textOnAccent: "#0a0a0a",
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
  },
];

function MembershipCard({ tier }: { tier: Tier }) {
  let topStyle: React.CSSProperties = {};
  let cardStyle: React.CSSProperties = {};
  let labelColor = "#FFFFFF";
  let shieldOpacity = 0.08;
  let shieldFilter = "";
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
      shieldOpacity = 0.15;
      shieldFilter = "sepia(1) saturate(5) hue-rotate(-15deg) brightness(1.1)";
      topBorder = "2px solid #F59E0B";
      break;
    case "premium":
      cardStyle = { background: "linear-gradient(135deg, #001a1f, #0a1a1f)" };
      topStyle = { background: "linear-gradient(135deg, #002a35, #001a22)" };
      labelColor = "#00abc4";
      shieldOpacity = 0.2;
      shieldFilter = "hue-rotate(160deg) saturate(2)";
      topBorder = "2px solid #00abc4";
      extraShadow = "0 0 30px rgba(0,171,196,0.12)";
      break;
    case "platino":
      cardStyle = { background: "linear-gradient(135deg, #111, #1a1a1a)" };
      topStyle = { background: "linear-gradient(135deg, #1f1f1f, #111)" };
      labelColor = "#E2E8F0";
      shieldOpacity = 0.15;
      shieldFilter = "grayscale(1) brightness(1.5)";
      topBorder = "2px solid #E2E8F0";
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
        style={{ ...topStyle, height: 100 }}
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
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full font-bold"
            style={{
              background: "#00abc4",
              color: "#0a0a0a",
              fontSize: 10,
              letterSpacing: "0.05em",
            }}
          >
            MÁS POPULAR
          </div>
        )}

        {/* Shield watermark */}
        <img
          src={lcuCrest}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{
            width: 80,
            height: 80,
            opacity: shieldOpacity,
            filter: shieldFilter || undefined,
            objectFit: "contain",
          }}
        />

        {/* Label */}
        <span
          className="relative z-10 font-bold text-center px-2"
          style={{
            fontSize: 11,
            color: labelColor,
            letterSpacing: "0.1em",
          }}
        >
          {tier.label}
        </span>
      </div>

      {/* Bottom section */}
      <div className="p-5 flex-1 flex items-start">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background:
              tier.id === "free"
                ? "rgba(255,255,255,0.1)"
                : tier.id === "platino"
                ? "linear-gradient(135deg, #94a3b8, #e2e8f0)"
                : tier.accent,
            color: tier.id === "free" ? "#fff" : tier.textOnAccent,
            letterSpacing: "0.08em",
          }}
        >
          {tier.badge}
        </span>
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
    <div className="flex flex-col gap-3 mt-4">
      <div>
        <div className="text-2xl font-bold text-white">{tier.price}</div>
        <div className="text-xs text-white/50">por temporada</div>
        {tier.priceMonthly && (
          <div className="text-xs text-white/50 mt-0.5">{tier.priceMonthly}</div>
        )}
      </div>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 font-bold transition-opacity hover:opacity-90 relative overflow-hidden"
        style={{
          height: 48,
          borderRadius: 10,
          fontSize: 14,
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

const KIT_TOOLTIPS: Record<string, string> = {
  "Kit Digital": "Pase digital · Stickers WA · Wallpapers",
  "Kit Básico": "Tarjeta personalizada · Gorra · Pin Metálico · Stickers",
  "Kit Medio": "Kit Digital + Jersey Oficial · Playera Merch · Parche · Bandera",
  "Kit Platino": "Kit Medio + Jersey Personalizado · Mochila Oficial",
};

type Cell =
  | { type: "text"; value: string }
  | { type: "check"; color: string }
  | { type: "x" }
  | { type: "kit"; value: string }
  | { type: "discount"; value: string; color: string };

const benefitRows: { label: string; cells: Cell[] }[] = [
  {
    label: "Precio",
    cells: [
      { type: "text", value: "$0" },
      { type: "text", value: "$1,499" },
      { type: "text", value: "$2,499" },
      { type: "text", value: "$4,499" },
    ],
  },
  {
    label: "Entrada general a todos los partidos en casa",
    cells: [
      { type: "x" },
      { type: "check", color: "#F59E0B" },
      { type: "check", color: "#00abc4" },
      { type: "check", color: "#E2E8F0" },
    ],
  },
  {
    label: "Nombre en el muro digital del estadio",
    cells: [
      { type: "x" },
      { type: "check", color: "#F59E0B" },
      { type: "check", color: "#00abc4" },
      { type: "check", color: "#E2E8F0" },
    ],
  },
  {
    label: "Kit Oficial",
    cells: [
      { type: "kit", value: "Kit Digital" },
      { type: "kit", value: "Kit Básico" },
      { type: "kit", value: "Kit Medio" },
      { type: "kit", value: "Kit Platino" },
    ],
  },
  {
    label: "Descuento en tienda oficial",
    cells: [
      { type: "discount", value: "5%", color: "#FFFFFF" },
      { type: "discount", value: "10%", color: "#F59E0B" },
      { type: "discount", value: "25%", color: "#00abc4" },
      { type: "discount", value: "40%", color: "#E2E8F0" },
    ],
  },
  {
    label: "Puntos dobles en Fan Zone",
    cells: [
      { type: "x" },
      { type: "x" },
      { type: "check", color: "#00abc4" },
      { type: "check", color: "#E2E8F0" },
    ],
  },
  {
    label: "Acceso VIP / área preferencial",
    cells: [
      { type: "x" },
      { type: "x" },
      { type: "check", color: "#00abc4" },
      { type: "check", color: "#E2E8F0" },
    ],
  },
  {
    label: "Foto con jugadores (1x temporada)",
    cells: [
      { type: "x" },
      { type: "x" },
      { type: "check", color: "#00abc4" },
      { type: "check", color: "#E2E8F0" },
    ],
  },
  {
    label: "Jersey personalizado con tu nombre",
    cells: [
      { type: "x" },
      { type: "x" },
      { type: "x" },
      { type: "check", color: "#E2E8F0" },
    ],
  },
  {
    label: "Meet & greet con jugadores",
    cells: [
      { type: "x" },
      { type: "x" },
      { type: "x" },
      { type: "check", color: "#E2E8F0" },
    ],
  },
];

function CellRenderer({ cell }: { cell: Cell }) {
  if (cell.type === "text") {
    return <span className="font-bold text-white">{cell.value}</span>;
  }
  if (cell.type === "check") {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
        style={{ background: cell.color }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (cell.type === "x") {
    return (
      <span className="text-lg" style={{ color: "rgba(255,255,255,0.2)" }}>
        ✕
      </span>
    );
  }
  if (cell.type === "kit") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-white text-sm cursor-help">
            {cell.value}
            <Info className="w-3.5 h-3.5 text-white/40" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px]">
          <p className="text-xs">{KIT_TOOLTIPS[cell.value]}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  if (cell.type === "discount") {
    return (
      <span className="font-bold" style={{ color: cell.color }}>
        {cell.value}
      </span>
    );
  }
  return null;
}

const POS = [
  {
    name: "OXXO Plaza Cabo San Lucas",
    address: "Blvd. Marina 100, Centro, Cabo San Lucas",
    hours: "Lun-Dom 24h",
    phone: "+52 624 143 0000",
  },
  {
    name: "Tienda LC United Centro",
    address: "Av. Lázaro Cárdenas 200, San José del Cabo",
    hours: "Lun-Sáb 10:00–20:00",
    phone: "+52 624 142 1111",
  },
  {
    name: "Estadio Don Koll - Taquilla",
    address: "Carretera Transpeninsular Km 4.5, San José del Cabo",
    hours: "Día de partido desde 14:00",
    phone: "+52 624 144 2222",
  },
];

const Tickets = () => {
  return (
    <TooltipProvider delayDuration={150}>
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
              src={stadiumHero}
              alt="Estadio Los Cabos United"
              className="absolute inset-0 w-full h-full object-cover"
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
                Sé Amo del Paraíso
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
              style={{ top: "55%" }}
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
        <div className="md:hidden -mx-3 mt-[-180px] relative z-20 mb-6">
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
        <div className="hidden md:block max-w-[1100px] mx-auto px-4 mt-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {tiers.map((t) => (
              <PriceAndCta key={t.id} tier={t} />
            ))}
          </div>
        </div>

        {/* Tablet 2x2 fallback handled by breakpoints — keep simple: md uses 4-col, sm uses scroll */}

        {/* BENEFITS COMPARISON */}
        <section className="max-w-6xl mx-auto mt-12 md:mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">¿Qué incluye cada nivel?</h2>
            <p className="text-sm text-white/60 mt-2">Elige el que más se adapta a ti</p>
          </div>

          <div
            className="rounded-2xl overflow-hidden border border-border"
            style={{ background: "#0f0f0f" }}
          >
            {/* Scrollable wrapper for mobile */}
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 700, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1a1a1a" }}>
                    <th
                      className="text-left p-4 text-xs font-semibold text-white/70 uppercase sticky left-0 z-10"
                      style={{ background: "#1a1a1a", minWidth: 220 }}
                    >
                      Beneficio
                    </th>
                    {tiers.map((t) => (
                      <th
                        key={t.id}
                        className="p-4 text-xs font-bold uppercase text-center"
                        style={{ color: t.accent, minWidth: 110 }}
                      >
                        {t.badge}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {benefitRows.map((row, idx) => (
                    <tr
                      key={row.label}
                      style={{ background: idx % 2 === 0 ? "#111" : "#0f0f0f" }}
                    >
                      <td
                        className="p-4 text-sm text-white/80 sticky left-0 z-10"
                        style={{ background: idx % 2 === 0 ? "#111" : "#0f0f0f" }}
                      >
                        {row.label}
                      </td>
                      {row.cells.map((cell, i) => (
                        <td key={i} className="p-4 text-center">
                          <CellRenderer cell={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* CTA row */}
                  <tr style={{ background: "#1a1a1a" }}>
                    <td className="p-4 text-xs uppercase text-white/50 sticky left-0 z-10" style={{ background: "#1a1a1a" }}>
                      Únete ahora
                    </td>
                    {tiers.map((t) => (
                      <td key={t.id} className="p-4 align-middle">
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 font-bold w-full transition-opacity hover:opacity-90"
                          style={{
                            height: 40,
                            borderRadius: 8,
                            fontSize: 12,
                            background:
                              t.id === "free"
                                ? "transparent"
                                : t.id === "platino"
                                ? "#FFFFFF"
                                : t.accent,
                            color:
                              t.id === "free" ? "#fff" : t.textOnAccent,
                            border:
                              t.id === "free"
                                ? "1px solid rgba(255,255,255,0.3)"
                                : "none",
                            padding: "0 10px",
                          }}
                        >
                          {t.cta}
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
            Paga en efectivo en estos establecimientos
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            {POS.map((p) => (
              <div
                key={p.name}
                className="rounded-xl p-4 border border-border"
                style={{ background: "#111" }}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" style={{ color: "#00abc4" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{p.name}</div>
                    <div className="text-xs text-white/60 mt-1">{p.address}</div>
                    <div className="text-xs text-white/60 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.hours}
                    </div>
                    <a
                      href={`tel:${p.phone.replace(/\s/g, "")}`}
                      className="text-xs mt-1 flex items-center gap-1 hover:underline"
                      style={{ color: "#00abc4" }}
                    >
                      <Phone className="w-3 h-3" /> {p.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </TooltipProvider>
  );
};

export default Tickets;

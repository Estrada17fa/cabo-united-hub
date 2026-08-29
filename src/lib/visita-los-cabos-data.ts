export const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZW1pbGlvZXMxNyIsImEiOiJjbW85bXFmbHowYWVuMnNwdHZqbjNvaHBiIn0.FkXp1K9sD08aY2yXyLToyg";

export type PlaceTier = "patrocinador" | "destacado" | "basico";
export type PlaceCategory =
  | "restaurantes"
  | "bares"
  | "tours"
  | "tiendas"
  | "hoteles";

export interface Review {
  user: string;
  initials: string;
  rating: number;
  text: string;
  verified: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  tier: PlaceTier;
  coords: [number, number]; // [lng, lat] for Mapbox
  area: string;
  description: string;
  hours: string;
  visitedBy: number;
  rating: number;
  goingToday: number;
  reviews: Review[];
  whatsapp?: string;
  photoGradient: string; // CSS gradient placeholder
}

export interface FanRoute {
  id: string;
  icon: string;
  name: string;
  description: string;
  stops: number;
  duration: string;
}

export const CATEGORY_META: Record<
  PlaceCategory,
  { label: string; icon: string; color: string }
> = {
  restaurantes: { label: "Restaurantes", icon: "utensils", color: "#F59E0B" },
  bares: { label: "Bares", icon: "beer", color: "#FF6B6B" },
  tours: { label: "Tours", icon: "waves", color: "#2DD4A7" },
  tiendas: { label: "Tiendas", icon: "shopping-bag", color: "#8B5CF6" },
  hoteles: { label: "Hoteles", icon: "bed-double", color: "#3B82F6" },
};

// Gold accent for sponsor-tier places (pins, badges, verified)
export const SPONSOR_GOLD = "#F2B33D";

// Brand cyan for chrome/UI accents on this page
export const LCU_CYAN = "#00ABC4";

export const PLACES: Place[] = [
  {
    id: "sunset-monalisa",
    name: "Sunset MonaLisa",
    category: "restaurantes",
    tier: "patrocinador",
    coords: [-109.7123, 23.0568],
    area: "Cabo San Lucas",
    description:
      "Cocina mediterránea con vista al Arco. El spot favorito para celebrar victorias del Amo al atardecer.",
    hours: "Abre a las 1:00 PM",
    visitedBy: 412,
    rating: 4.9,
    goingToday: 23,
    whatsapp: "+526241456789",
    photoGradient:
      "linear-gradient(135deg, hsl(20 80% 40%) 0%, hsl(340 60% 30%) 100%)",
    reviews: [
      {
        user: "@rafa_sjc",
        initials: "RS",
        rating: 5,
        text: "El mejor lugar para ir antes del partido. La vista es increíble 🌊",
        verified: true,
      },
      {
        user: "@lucia.amo",
        initials: "LA",
        rating: 5,
        text: "Llegamos tras la victoria contra Mazatlán. El staff nos recibió con cánticos. Inolvidable.",
        verified: true,
      },
      {
        user: "@cabofan23",
        initials: "CF",
        rating: 4,
        text: "Pricey pero la experiencia vale cada peso. Pide el sunset menu.",
        verified: true,
      },
    ],
  },
  {
    id: "acre-restaurant",
    name: "Acre Restaurant & Bungalows",
    category: "restaurantes",
    tier: "destacado",
    coords: [-109.6892, 23.0534],
    area: "San José del Cabo",
    description:
      "Farm-to-table en medio de un huerto orgánico. Brunch épico los domingos de partido en casa.",
    hours: "Abre a las 8:00 AM",
    visitedBy: 287,
    rating: 4.8,
    goingToday: 14,
    whatsapp: "+526241112233",
    photoGradient:
      "linear-gradient(135deg, hsl(140 50% 25%) 0%, hsl(80 40% 20%) 100%)",
    reviews: [
      {
        user: "@chef_mario",
        initials: "CM",
        rating: 5,
        text: "El brunch antes del partido es ritual obligado. Los huevos benedictinos son arte.",
        verified: true,
      },
      {
        user: "@amo4ever",
        initials: "AF",
        rating: 5,
        text: "Ambiente tranquilo, perfecto para juntar a la familia antes de ir al estadio.",
        verified: true,
      },
      {
        user: "@nataly_cabo",
        initials: "NC",
        rating: 4,
        text: "Reservar con anticipación. Vale la pena el viaje desde Cabo San Lucas.",
        verified: true,
      },
    ],
  },
  {
    id: "manta-restaurant",
    name: "Manta Restaurant",
    category: "restaurantes",
    tier: "patrocinador",
    coords: [-109.9156, 22.8895],
    area: "Cabo San Lucas",
    description:
      "Cocina baja-asiática del chef Enrique Olvera. Vista al Pacífico y menú degustación premium.",
    hours: "Abre a las 6:00 PM",
    visitedBy: 521,
    rating: 4.9,
    goingToday: 31,
    whatsapp: "+526241445566",
    photoGradient:
      "linear-gradient(135deg, hsl(200 70% 25%) 0%, hsl(260 50% 20%) 100%)",
    reviews: [
      {
        user: "@gourmet_amo",
        initials: "GA",
        rating: 5,
        text: "Lujo absoluto. Pedimos el omakase y fue una experiencia sensorial completa.",
        verified: true,
      },
      {
        user: "@vip_lcunited",
        initials: "VL",
        rating: 5,
        text: "Descuento del 15% mostrando boleto del partido. ¡Gracias por apoyar al club!",
        verified: true,
      },
      {
        user: "@cabosunset",
        initials: "CS",
        rating: 5,
        text: "Mesa con vista al mar al atardecer. Reserva con semanas de anticipación.",
        verified: true,
      },
    ],
  },
  {
    id: "cabo-adventures",
    name: "Cabo Adventures Tours",
    category: "tours",
    tier: "destacado",
    coords: [-109.9134, 22.8901],
    area: "Cabo San Lucas",
    description:
      "Tours de avistamiento de ballenas, snorkel y catamaranes. Operadora #1 con certificación ambiental.",
    hours: "Abre a las 7:00 AM",
    visitedBy: 198,
    rating: 4.7,
    goingToday: 8,
    whatsapp: "+526241778899",
    photoGradient:
      "linear-gradient(135deg, hsl(195 80% 30%) 0%, hsl(220 60% 20%) 100%)",
    reviews: [
      {
        user: "@dive_cabo",
        initials: "DC",
        rating: 5,
        text: "Tour de ballenas espectacular. Los guías son super profesionales.",
        verified: true,
      },
      {
        user: "@familia_amo",
        initials: "FA",
        rating: 5,
        text: "Llevamos a los niños al snorkel. Equipo en perfecto estado y staff muy atento.",
        verified: true,
      },
      {
        user: "@adventure_bcs",
        initials: "AB",
        rating: 4,
        text: "El catamarán al atardecer es mágico. Llega 30 min antes.",
        verified: true,
      },
    ],
  },
  {
    id: "puerto-paraiso",
    name: "Puerto Paraíso Mall",
    category: "tiendas",
    tier: "basico",
    coords: [-109.9201, 22.8912],
    area: "Cabo San Lucas",
    description:
      "Centro comercial frente a la marina. Tiendas, cines y la tienda oficial del club.",
    hours: "Abre a las 10:00 AM",
    visitedBy: 89,
    rating: 4.3,
    goingToday: 4,
    photoGradient:
      "linear-gradient(135deg, hsl(280 40% 25%) 0%, hsl(220 30% 20%) 100%)",
    reviews: [
      {
        user: "@shopper_cabo",
        initials: "SC",
        rating: 4,
        text: "Buena variedad de tiendas y restaurantes. Estacionamiento amplio.",
        verified: true,
      },
      {
        user: "@merch_amo",
        initials: "MA",
        rating: 5,
        text: "La tienda oficial tiene merch exclusivo que no encuentras online.",
        verified: true,
      },
      {
        user: "@tourist_lc",
        initials: "TL",
        rating: 4,
        text: "Vista a la marina muy chida. Buen lugar para pasar la tarde.",
        verified: true,
      },
    ],
  },
  {
    id: "flora-farms",
    name: "Flora Farms",
    category: "restaurantes",
    tier: "destacado",
    coords: [-109.6734, 23.0456],
    area: "San José del Cabo",
    description:
      "Granja-restaurante en la sierra. Ingredientes propios, ambiente bohemio y mercado orgánico.",
    hours: "Abre a las 9:00 AM",
    visitedBy: 376,
    rating: 4.8,
    goingToday: 19,
    whatsapp: "+526241223344",
    photoGradient:
      "linear-gradient(135deg, hsl(90 50% 25%) 0%, hsl(40 40% 20%) 100%)",
    reviews: [
      {
        user: "@foodie_bcs",
        initials: "FB",
        rating: 5,
        text: "Pizza al horno de leña + cocteles del huerto = perfección.",
        verified: true,
      },
      {
        user: "@green_amo",
        initials: "GA",
        rating: 5,
        text: "Domingo de mercado y brunch antes del partido. Plan ideal.",
        verified: true,
      },
      {
        user: "@local_sjc",
        initials: "LS",
        rating: 4,
        text: "Está alejado pero el viaje vale la pena. Reserva siempre.",
        verified: true,
      },
    ],
  },
  {
    id: "medano-beach",
    name: "Médano Beach",
    category: "bares",
    tier: "basico",
    coords: [-109.9145, 22.8867],
    area: "Cabo San Lucas",
    description:
      "La playa principal de Cabo. Bares de pie, deportes acuáticos y zona de pantallas para ver el partido.",
    hours: "Abierto 24 hrs",
    visitedBy: 142,
    rating: 4.5,
    goingToday: 27,
    photoGradient:
      "linear-gradient(135deg, hsl(200 60% 30%) 0%, hsl(40 50% 25%) 100%)",
    reviews: [
      {
        user: "@beach_amo",
        initials: "BA",
        rating: 5,
        text: "Vimos el partido en pantalla gigante con los pies en la arena. Brutal.",
        verified: true,
      },
      {
        user: "@playa_lc",
        initials: "PL",
        rating: 4,
        text: "Los bares cobran caro pero el ambiente es inigualable.",
        verified: true,
      },
      {
        user: "@surf_cabo",
        initials: "SC",
        rating: 5,
        text: "El mejor lugar para celebrar después de una victoria. Animación pura.",
        verified: true,
      },
    ],
  },
  {
    id: "rooftop-hacienda",
    name: "The Rooftop at Hacienda Encantada",
    category: "bares",
    tier: "patrocinador",
    coords: [-109.8456, 22.9234],
    area: "Corredor Turístico",
    description:
      "Bar en la azotea con vista 360° al Mar de Cortés. Coctelería de autor y DJ los días de partido.",
    hours: "Abre a las 5:00 PM",
    visitedBy: 334,
    rating: 4.9,
    goingToday: 18,
    whatsapp: "+526241334455",
    photoGradient:
      "linear-gradient(135deg, hsl(340 60% 30%) 0%, hsl(280 50% 25%) 100%)",
    reviews: [
      {
        user: "@vip_amo",
        initials: "VA",
        rating: 5,
        text: "Vista de infarto al atardecer. Los cocteles son arte líquido.",
        verified: true,
      },
      {
        user: "@nightlife_bcs",
        initials: "NB",
        rating: 5,
        text: "Después del partido se llena de fans. DJ pone himnos del club. Locura.",
        verified: true,
      },
      {
        user: "@premium_lc",
        initials: "PL",
        rating: 5,
        text: "Reserva mesa VIP con descuento mostrando tu pase de socio.",
        verified: true,
      },
    ],
  },
  {
    id: "edith-restaurant",
    name: "Edith's Restaurant",
    category: "restaurantes",
    tier: "destacado",
    coords: [-109.9089, 22.8923],
    area: "Cabo San Lucas",
    description:
      "Clásico cabeño desde 1985. Caesar salad preparada en mesa y mariscos frescos diarios.",
    hours: "Abre a las 5:30 PM",
    visitedBy: 256,
    rating: 4.7,
    goingToday: 11,
    whatsapp: "+526241556677",
    photoGradient:
      "linear-gradient(135deg, hsl(15 60% 30%) 0%, hsl(0 50% 25%) 100%)",
    reviews: [
      {
        user: "@classic_cabo",
        initials: "CC",
        rating: 5,
        text: "Tradición pura. La Caesar en mesa es show garantizado.",
        verified: true,
      },
      {
        user: "@old_amo",
        initials: "OA",
        rating: 5,
        text: "Mi familia viene desde hace 20 años. Nunca decepciona.",
        verified: true,
      },
      {
        user: "@seafood_lc",
        initials: "SL",
        rating: 4,
        text: "El red snapper a la sal es el mejor de Cabo. Pídelo sí o sí.",
        verified: true,
      },
    ],
  },
  {
    id: "esperanza-resort",
    name: "Esperanza Resort",
    category: "hoteles",
    tier: "destacado",
    coords: [-109.8123, 22.9345],
    area: "Corredor Turístico",
    description:
      "Resort 5 estrellas con spa, playa privada y paquetes especiales para días de partido.",
    hours: "Recepción 24/7",
    visitedBy: 167,
    rating: 4.9,
    goingToday: 6,
    whatsapp: "+526241667788",
    photoGradient:
      "linear-gradient(135deg, hsl(220 50% 25%) 0%, hsl(180 40% 20%) 100%)",
    reviews: [
      {
        user: "@luxury_amo",
        initials: "LA",
        rating: 5,
        text: "Servicio impecable. El paquete game-day incluye transporte al estadio.",
        verified: true,
      },
      {
        user: "@spa_lover",
        initials: "SL",
        rating: 5,
        text: "El spa es de otro nivel. Perfecto para relajarse antes del partido.",
        verified: true,
      },
      {
        user: "@beach_vip",
        initials: "BV",
        rating: 5,
        text: "Playa privada, atardeceres únicos. Hospedaje de élite.",
        verified: true,
      },
    ],
  },
];

export const FAN_ROUTES: FanRoute[] = [
  {
    id: "pre-partido",
    icon: "flag",
    name: "Ruta Pre-Partido",
    description: "Desayuna, compra tu merch y llega al estadio",
    stops: 3,
    duration: "~3 horas",
  },
  {
    id: "familiar",
    icon: "users",
    name: "Ruta Familiar",
    description: "Un día completo para toda la familia Amo",
    stops: 4,
    duration: "~5 horas",
  },
  {
    id: "vip",
    icon: "wine",
    name: "Ruta VIP",
    description: "Experiencia premium antes del partido",
    stops: 3,
    duration: "~4 horas",
  },
];

// Featured this week — show first 5 for the bottom strip
export const FEATURED_PLACE_IDS = [
  "sunset-monalisa",
  "rooftop-hacienda",
  "manta-restaurant",
  "flora-farms",
  "cabo-adventures",
];
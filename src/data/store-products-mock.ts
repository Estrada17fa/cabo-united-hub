import type { StoreProduct } from "@/lib/store-types";
import jerseyLocal from "@/assets/tienda/jersey-local.jpg";
import jerseyVisita from "@/assets/tienda/jersey-visita.jpg";
import hoodieNegro from "@/assets/tienda/hoodie-negro.jpg";
import playeraNegra from "@/assets/tienda/playera-negra.jpg";
import gorra from "@/assets/tienda/gorra.jpg";
import bufanda from "@/assets/tienda/bufanda.jpg";

const APPAREL = ["CH", "M", "G", "XG"];

/**
 * Datos de EJEMPLO. Se reemplazan por el catálogo real sin tocar pantallas:
 * solo cambia el interior de `useProducts` / `useProduct`.
 */
export const MOCK_PRODUCTS: StoreProduct[] = [
  {
    id: "p-jersey-local",
    handle: "jersey-local-25-26",
    title: "Jersey Local 25/26",
    eyebrow: "Temporada 25/26",
    description:
      "El uniforme con el que jugamos en casa. Tela ligera de secado rápido, escudo bordado y corte atlético pensado para el calor de Los Cabos.",
    category: "jerseys",
    price: 1290,
    compareAtPrice: null,
    currency: "MXN",
    images: [jerseyLocal, jerseyVisita],
    sizes: APPAREL,
    tags: ["nuevo", "jersey", "oficial"],
    createdAt: "2026-08-01",
  },
  {
    id: "p-jersey-visita",
    handle: "jersey-visita-25-26",
    title: "Jersey Visita 25/26",
    eyebrow: "Temporada 25/26",
    description:
      "Blanco con detalles en cian. El mismo tejido técnico del uniforme local, para acompañar al equipo donde juegue.",
    category: "jerseys",
    price: 1290,
    compareAtPrice: null,
    currency: "MXN",
    images: [jerseyVisita, jerseyLocal],
    sizes: APPAREL,
    tags: ["jersey", "oficial"],
    createdAt: "2026-07-20",
  },
  {
    id: "p-jersey-portero",
    handle: "jersey-portero-25-26",
    title: "Jersey de Portero",
    eyebrow: "Edición limitada",
    description:
      "Versión de arquero con manga larga y refuerzos en codos. Producción corta: mientras duren las existencias.",
    category: "jerseys",
    price: 1390,
    compareAtPrice: 1590,
    currency: "MXN",
    images: [jerseyLocal],
    sizes: ["M", "G", "XG"],
    tags: ["jersey", "limitada"],
    createdAt: "2026-07-05",
  },
  {
    id: "p-hoodie-negro",
    handle: "hoodie-escudo-bordado",
    title: "Hoodie Escudo Bordado",
    eyebrow: "Streetwear",
    description:
      "Felpa pesada de 400 g, interior perchado y escudo bordado al pecho. Corte holgado, se ve igual de bien en el estadio y fuera de él.",
    category: "hoodies",
    price: 1190,
    compareAtPrice: null,
    currency: "MXN",
    images: [hoodieNegro],
    sizes: APPAREL,
    tags: ["nuevo", "hoodie"],
    createdAt: "2026-08-10",
  },
  {
    id: "p-hoodie-agotado",
    handle: "hoodie-amos-del-paraiso",
    title: "Hoodie Amos del Paraíso",
    eyebrow: "Drop 01",
    description:
      "El primer drop de la afición, con lettering en la espalda. Se agotó en tres días; vuelve pronto.",
    category: "hoodies",
    price: 1290,
    compareAtPrice: null,
    currency: "MXN",
    images: [hoodieNegro],
    sizes: APPAREL,
    soldOut: true,
    tags: ["hoodie", "limitada"],
    createdAt: "2026-06-15",
  },
  {
    id: "p-playera-negra",
    handle: "playera-lcu-negra",
    title: "Playera LCU Negra",
    eyebrow: "Esencial",
    description:
      "Algodón peinado 100%, cuello reforzado y logo mínimo al pecho. La base de todo el guardarropa del club.",
    category: "playeras",
    price: 590,
    compareAtPrice: 690,
    currency: "MXN",
    images: [playeraNegra],
    sizes: APPAREL,
    tags: ["playera", "oferta"],
    createdAt: "2026-07-28",
  },
  {
    id: "p-playera-blanca",
    handle: "playera-lcu-esencial",
    title: "Playera Esencial",
    eyebrow: "Esencial",
    description:
      "Misma base de algodón peinado con estampado sobrio. Para el día a día en el puerto.",
    category: "playeras",
    price: 590,
    compareAtPrice: null,
    currency: "MXN",
    images: [playeraNegra],
    sizes: APPAREL,
    tags: ["playera"],
    createdAt: "2026-07-10",
  },
  {
    id: "p-gorra",
    handle: "gorra-snapback-escudo",
    title: "Gorra Snapback Escudo",
    eyebrow: "Accesorio",
    description:
      "Snapback estructurada, visera plana y escudo bordado en cian. Talla única ajustable.",
    category: "accesorios",
    price: 490,
    compareAtPrice: null,
    currency: "MXN",
    images: [gorra],
    sizes: ["Única"],
    tags: ["accesorio", "gorra"],
    createdAt: "2026-08-05",
  },
  {
    id: "p-bufanda",
    handle: "bufanda-de-tribuna",
    title: "Bufanda de Tribuna",
    eyebrow: "Accesorio",
    description:
      "Tejido doble faz en cian y negro, con flecos. La que se levanta cuando cae el gol.",
    category: "accesorios",
    price: 390,
    compareAtPrice: null,
    currency: "MXN",
    images: [bufanda],
    sizes: ["Única"],
    tags: ["accesorio", "bufanda", "nuevo"],
    createdAt: "2026-08-12",
  },
];

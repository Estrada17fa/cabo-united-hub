/**
 * Modelo de producto propio de la tienda LCU.
 * El catálogo viene de Shopify; estos tipos son la capa de presentación
 * que usan las pantallas de la tienda.
 *
 * Clasificación: se lee directo de Shopify (productType + tags con prefijo),
 * sin adivinar por palabras clave.
 *   - linea:oficial | linea:streetwear   (sin tag → "otros")
 *   - seccion:hombre | mujer | nino | accesorios  (puede traer varias)
 *   - equipacion:local | visita | portero | tercero  (tags sueltos como respaldo)
 *   - corte:oversize | regular | crop  (se guarda, no se usa para navegar)
 */

export type StoreLine = "oficial" | "streetwear" | "otros";

export const STORE_LINE_LABELS: Record<StoreLine, string> = {
  oficial: "Jerseys",
  streetwear: "Streetwear",
  otros: "Otros",
};

export const STORE_SECTION_LABELS: Record<string, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  nino: "Niño",
  accesorios: "Accesorios",
};

export const STORE_EQUIPACION_LABELS: Record<string, string> = {
  local: "Local",
  visita: "Visita",
  portero: "Portero",
  tercero: "Tercero",
};

/** Acentos para palabras conocidas que llegan sin acento desde los tags. */
const ACCENT_WORDS: Record<string, string> = {
  nino: "niño", nina: "niña", ninos: "niños", ninas: "niñas", edicion: "edición",
  pantalon: "pantalón", pantalones: "pantalones", sueter: "suéter", sueteres: "suéteres",
  camison: "camisón", calcetin: "calcetín", calcetines: "calcetines", bebe: "bebé",
  coleccion: "colección", aniversario: "aniversario", campeon: "campeón", campeones: "campeones",
  ultimas: "últimas", ultima: "última", nueva: "nueva", basico: "básico", basica: "básica",
  clasico: "clásico", clasica: "clásica", tecnico: "técnico", unico: "único", unica: "única",
};

/** Formato en pantalla de cualquier valor de tag/Type: guiones a espacios, acentos, mayúscula inicial. */
export function formatTagLabel(value: string | null | undefined): string {
  if (!value) return "";
  const words = value.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ").split(" ");
  const out = words
    .map((w) => {
      const key = normalizeStoreKey(w);
      return ACCENT_WORDS[key] ?? w.toLowerCase();
    })
    .join(" ");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** Etiqueta de sección. */
export const sectionLabel = (v: string) => STORE_SECTION_LABELS[v] ?? formatTagLabel(v);
/** Etiqueta de equipación. */
export const equipacionLabel = (v: string) => STORE_EQUIPACION_LABELS[v] ?? formatTagLabel(v);

/** Nombres en pantalla de tipos de prenda (plural, con acentos). */
const TYPE_LABELS: Record<string, string> = {
  jersey: "Jerseys",
  playera: "Playeras",
  camiseta: "Camisetas",
  hoodie: "Hoodies",
  sudadera: "Sudaderas",
  crewneck: "Crewnecks",
  pantalon: "Pantalones",
  short: "Shorts",
  gorra: "Gorras",
  bolsa: "Bolsas",
  bufanda: "Bufandas",
  chamarra: "Chamarras",
};

/** minúsculas, sin acentos, sin espacios extra. */
export function normalizeStoreKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Etiqueta en pantalla para un tipo de prenda: exactamente el Type de Shopify,
 * solo con la primera letra en mayúscula (sin singularizar ni pluralizar).
 */
export function storeTypeLabel(productType: string): string {
  const label = formatTagLabel(productType);
  return label || "Otros";
}

export interface StoreClassification {
  line: StoreLine;
  /** Secciones normalizadas (puede traer varias: un unisex aparece en todas). */
  sections: string[];
  /** Equipación normalizada (solo jerseys) o null. */
  equipacion: string | null;
  /** Tipo de prenda normalizado (singular, sin acentos). */
  garmentType: string;
  /** Corte (oversize/regular/crop) — se guarda, no navega. */
  corte: string | null;
}

/** Lee productType + tags de Shopify y devuelve la clasificación de la tienda. */
export function classifyStoreProduct(productType: string, tags: string[]): StoreClassification {
  let line: StoreLine = "otros";
  const sections: string[] = [];
  let equipacion: string | null = null;
  let corte: string | null = null;

  for (const raw of tags) {
    const tag = normalizeStoreKey(raw);
    const [prefix, ...rest] = tag.split(":");
    const value = rest.join(":").trim();

    if (prefix === "linea" && value) {
      if (value === "oficial") line = "oficial";
      else if (value === "streetwear") line = "streetwear";
    } else if (prefix === "seccion" && value) {
      if (!sections.includes(value)) sections.push(value);
    } else if (prefix === "equipacion" && value) {
      equipacion = value;
    } else if (prefix === "corte" && value) {
      corte = value;
    } else if (!raw.includes(":") && STORE_EQUIPACION_LABELS[tag]) {
      // Respaldo: tag suelto "Local"/"Visita"/"Portero"/"Tercero".
      equipacion = equipacion ?? tag;
    }
  }

  return {
    line,
    sections,
    equipacion,
    garmentType: normalizeStoreKey(productType),
    corte,
  };
}

export interface StoreVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  availableForSale: boolean;
}

export interface StoreProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  line: StoreLine;
  sections: string[];
  equipacion: string | null;
  garmentType: string;
  corte: string | null;
  /** Etiqueta corta arriba del nombre (equipación en jerseys, sección en streetwear) */
  eyebrow?: string;
  price: number;
  /** Precio anterior; si existe y es mayor, la pieza está en oferta */
  compareAtPrice?: number | null;
  currency: string;
  images: string[];
  sizes: string[];
  /** Variantes reales de Shopify, necesarias para el checkout */
  variants: StoreVariant[];
  soldOut?: boolean;
  tags: string[];
  /** Para el orden "Más nuevo" */
  createdAt: string;
}

export function formatMoney(amount: number, currency = "MXN") {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

export function isOnSale(p: StoreProduct) {
  return !!p.compareAtPrice && p.compareAtPrice > p.price;
}

export function mapShopifySize(variantTitle: string): string {
  const map: Record<string, string> = {
    chica: "CH",
    mediana: "M",
    grande: "G",
    "extra grande": "XG",
    "default title": "Única",
  };
  const lower = variantTitle.trim().toLowerCase();
  return map[lower] || variantTitle.trim();
}

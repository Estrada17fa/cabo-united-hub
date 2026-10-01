/**
 * Guías de tallas por tipo de prenda (y corte opcional).
 * Edita las medidas aquí. Cambia `pendiente` a false cuando sean las reales.
 * `garmentType` es el tipo de Shopify en singular y sin acentos (jersey, playera, hoodie...).
 */
export interface SizeGuide {
  garmentType: string;
  corte?: string;
  title: string;
  columns: string[];
  rows: string[][];
  pendiente: boolean;
}

export const SIZE_GUIDES: SizeGuide[] = [
  {
    garmentType: "jersey",
    title: "Jersey",
    columns: ["Talla", "Pecho (cm)", "Largo (cm)"],
    rows: [
      ["CH", "96", "70"],
      ["M", "102", "72"],
      ["G", "108", "74"],
      ["XG", "114", "76"],
    ],
    pendiente: true,
  },
  {
    garmentType: "playera",
    corte: "oversize",
    title: "Playera oversize",
    columns: ["Talla", "Pecho (cm)", "Largo (cm)", "Manga (cm)"],
    rows: [
      ["CH", "112", "70", "22"],
      ["M", "118", "72", "23"],
      ["G", "124", "74", "24"],
      ["XG", "130", "76", "25"],
    ],
    pendiente: true,
  },
  {
    garmentType: "playera",
    corte: "regular",
    title: "Playera regular",
    columns: ["Talla", "Pecho (cm)", "Largo (cm)"],
    rows: [
      ["CH", "96", "69"],
      ["M", "102", "71"],
      ["G", "108", "73"],
      ["XG", "114", "75"],
    ],
    pendiente: true,
  },
  {
    garmentType: "hoodie",
    title: "Hoodie",
    columns: ["Talla", "Pecho (cm)", "Largo (cm)", "Manga (cm)"],
    rows: [
      ["CH", "110", "68", "60"],
      ["M", "116", "70", "62"],
      ["G", "122", "72", "64"],
      ["XG", "128", "74", "66"],
    ],
    pendiente: true,
  },
];

/** Busca primero tipo + corte, luego solo tipo (la primera sin corte o cualquiera del tipo). */
export function getSizeGuide(p: { garmentType: string; corte: string | null }): SizeGuide | null {
  const byType = SIZE_GUIDES.filter((g) => g.garmentType === p.garmentType);
  if (byType.length === 0) return null;
  return (
    (p.corte && byType.find((g) => g.corte === p.corte)) ||
    byType.find((g) => !g.corte) ||
    byType[0]
  );
}

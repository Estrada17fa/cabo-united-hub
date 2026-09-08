import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useShopHeroSlides, type ShopHeroSlide } from "@/hooks/useShopContent";
import hero1 from "@/assets/tienda-hero-1.jpg";
import hero2 from "@/assets/tienda-hero-2.jpg";
import hero3 from "@/assets/tienda-hero-3.jpg";

/** Respaldo si el admin todavía no capturó slides: la página nunca se ve vacía. */
const FALLBACK: ShopHeroSlide[] = [
  {
    id: "f1",
    image_url: hero1,
    eyebrow: "Temporada 25/26",
    title: "Jersey Oficial",
    subtitle: "Hecho para los Amos del Paraíso",
    cta_label: "Ver jerseys",
    cta_url: "/tienda",
    sort_order: 0,
    published: true,
  },
  {
    id: "f2",
    image_url: hero2,
    eyebrow: "Streetwear",
    title: "Hoodies bordados",
    subtitle: "Felpa pesada, escudo al pecho",
    cta_label: "Ver colección",
    cta_url: "/tienda",
    sort_order: 1,
    published: true,
  },
  {
    id: "f3",
    image_url: hero3,
    eyebrow: "Edición limitada",
    title: "Piezas contadas",
    subtitle: "Mientras duren las existencias",
    cta_label: "Ver todo",
    cta_url: "/tienda",
    sort_order: 2,
    published: true,
  },
];

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

export function HeroCarousel() {
  const { data } = useShopHeroSlides();
  const slides = useMemo(() => (data && data.length > 0 ? data : FALLBACK), [data]);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [slides.length]);

  useEffect(() => {
    slides.forEach((s) => {
      if (!s.image_url) return;
      const img = new Image();
      img.src = s.image_url;
    });
  }, [slides]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[Math.min(index, slides.length - 1)];
  if (!slide) return null;

  const cta =
    slide.cta_label && slide.cta_url ? (
      isExternal(slide.cta_url) ? (
        <a
          href={slide.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-primary-foreground"
        >
          {slide.cta_label} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      ) : (
        <Link
          to={slide.cta_url}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-primary-foreground"
        >
          {slide.cta_label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )
    ) : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-hairline bg-surface-1">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]">
        <AnimatePresence mode="sync">
          <motion.img
            key={slide.id}
            src={slide.image_url ?? ""}
            alt={slide.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Legibilidad del texto, sin degradado decorativo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <motion.div key={`${slide.id}-copy`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {slide.eyebrow && (
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {slide.eyebrow}
              </p>
            )}
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="mt-1.5 max-w-md text-[13px] text-white/70 md:text-sm">{slide.subtitle}</p>
            )}
            {cta && <div className="mt-4">{cta}</div>}
          </motion.div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute right-4 top-4 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir al slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-1.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

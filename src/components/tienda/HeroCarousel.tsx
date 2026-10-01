import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useShopHeroSlides, type ShopHeroSlide } from "@/hooks/useShopContent";
import { useProducts } from "@/hooks/useProducts";

export interface SlideView {
  id: string;
  image_url: string | null;
  image_mobile_url: string | null;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  cta: { label: string; url: string; external: boolean } | null;
}

/** Resuelve el botón. Producto inexistente / no publicado → sin botón. */
export function resolveCta(
  s: Pick<ShopHeroSlide, "show_cta" | "cta_type" | "cta_ref" | "cta_label" | "cta_url">,
  productHandles: Set<string> | null,
): SlideView["cta"] {
  if (!s.show_cta || !s.cta_label) return null;
  if (s.cta_type === "product") {
    if (!s.cta_ref) return null;
    if (productHandles && !productHandles.has(s.cta_ref)) return null;
    return { label: s.cta_label, url: `/tienda/producto/${s.cta_ref}`, external: false };
  }
  if (!s.cta_url) return null;
  return { label: s.cta_label, url: s.cta_url, external: /^https?:\/\//i.test(s.cta_url) };
}

function CtaButton({ cta }: { cta: NonNullable<SlideView["cta"]> }) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-primary-foreground";
  const inner = (
    <>
      {cta.label} <ArrowRight className="h-3.5 w-3.5" />
    </>
  );
  return cta.external ? (
    <a href={cta.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link to={cta.url} className={cls}>
      {inner}
    </Link>
  );
}

/** Una diapositiva; `forceMobile` sirve para la vista previa del admin. */
export function HeroSlideFrame({ slide, forceMobile }: { slide: SlideView; forceMobile?: boolean }) {
  const desktop = slide.image_url ?? "";
  const mobile = slide.image_mobile_url || desktop;
  return (
    <>
      {forceMobile ? (
        <img src={mobile} alt={slide.title} className="absolute inset-0 h-full w-full object-cover object-center" />
      ) : (
        <picture>
          <source media="(max-width: 767px)" srcSet={mobile} />
          <img src={desktop} alt={slide.title} className="absolute inset-0 h-full w-full object-cover object-center" />
        </picture>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        {slide.eyebrow && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">{slide.eyebrow}</p>
        )}
        {slide.title && (
          <h2
            className={`font-display font-bold leading-tight tracking-tight text-white ${
              forceMobile ? "text-xl" : "text-2xl md:text-4xl"
            }`}
          >
            {slide.title}
          </h2>
        )}
        {slide.subtitle && (
          <p className="mt-1.5 max-w-md text-[13px] text-white/70 md:text-sm">{slide.subtitle}</p>
        )}
        {slide.cta && (
          <div className="mt-3">
            <CtaButton cta={slide.cta} />
          </div>
        )}
      </div>
    </>
  );
}

export function HeroCarousel() {
  const { data, isLoading } = useShopHeroSlides();
  const { data: products } = useProducts();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const handles = useMemo(() => (products ? new Set(products.map((p) => p.handle)) : null), [products]);
  const slides: SlideView[] = useMemo(
    () =>
      (data ?? [])
        .filter((s) => s.image_url)
        .map((s) => ({
          id: s.id,
          image_url: s.image_url,
          image_mobile_url: s.image_mobile_url,
          eyebrow: s.eyebrow,
          title: s.title,
          subtitle: s.subtitle,
          cta: resolveCta(s, handles),
        })),
    [data, handles],
  );

  useEffect(() => setIndex(0), [slides.length]);

  useEffect(() => {
    slides.forEach((s) => {
      [s.image_url, s.image_mobile_url].forEach((u) => {
        if (!u) return;
        const img = new Image();
        img.src = u;
      });
    });
  }, [slides]);

  const autoplay = slides.length > 1 && !paused && !reduce;
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [autoplay, slides.length]);

  if (isLoading && slides.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-hairline bg-surface-1">
        <div className="aspect-[20/9] w-full animate-pulse bg-surface-2 sm:aspect-[8/3] md:aspect-[7/2]" />
      </div>
    );
  }

  const slide = slides[Math.min(index, slides.length - 1)];
  if (!slide) return null;
  const go = (d: number) => setIndex((i) => (i + d + slides.length) % slides.length);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-hairline bg-surface-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start != null && slides.length > 1) {
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }
        setTimeout(() => setPaused(false), 4000);
      }}
    >
      <div className="relative aspect-[20/9] w-full sm:aspect-[8/3] md:aspect-[7/2]">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <HeroSlideFrame slide={slide} />
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="absolute right-4 top-4 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-white/35"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

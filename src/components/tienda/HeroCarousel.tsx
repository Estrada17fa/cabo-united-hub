import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/tienda-hero-1.jpg";
import hero2 from "@/assets/tienda-hero-2.jpg";
import hero3 from "@/assets/tienda-hero-3.jpg";

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    image: hero1,
    eyebrow: "Drop 24/25",
    title: "Jersey Oficial",
    subtitle: "Diseñado para los Amos del Paraíso",
  },
  {
    image: hero2,
    eyebrow: "Nuevo ingreso",
    title: "Hoodies premium",
    subtitle: "Bordados, edición exclusiva",
  },
  {
    image: hero3,
    eyebrow: "Edición limitada",
    title: "Detalles de autor",
    subtitle: "Mientras duren las existencias",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[index];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-card">
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Vignette / overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.55) 100%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Copy */}
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="px-5 md:px-12 pb-6 md:pb-0 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <p
                  className="text-[11px] font-semibold uppercase mb-3"
                  style={{ color: "#00FF87", letterSpacing: "0.2em" }}
                >
                  {slide.eyebrow}
                </p>
                <h1
                  className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[0.95] mb-3"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {slide.title}
                </h1>
                <p className="text-sm md:text-base text-white/70">{slide.subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrows (desktop only) */}
        <button
          onClick={() => go(-1)}
          aria-label="Anterior"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur border border-white/15 items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Siguiente"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur border border-white/15 items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 right-4 md:right-6 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir al slide ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 24 : 8,
                background: i === index ? "#00FF87" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

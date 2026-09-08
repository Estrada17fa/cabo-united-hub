import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import donKollImg from "@/assets/don-koll.jpg";
import adnCabenoImg from "@/assets/adn-cabeno.jpg";
import { SeasonSummary } from "@/components/club/SeasonSummary";
import { RosterSection } from "@/components/club/RosterSection";
import { YouthTeamCard } from "@/components/club/YouthTeamCard";
import { NewsSection } from "@/components/club/NewsSection";
import { FanWall } from "@/components/club/FanWall";
import { cn } from "@/lib/utils";

const FOUNDED_YEAR = 2022;

const MILESTONES = [
  { year: "Enero 2022", label: "Fundación" },
  { year: "Agosto 2022", label: "Debut" },
  { year: "Mayo 2024", label: "Campeones" },
];

/* ------------------------------- ADN Cabeño ------------------------------- */

function AdnContent() {
  return (
    <div className="space-y-3">
      <h2 className="text-display-md text-foreground md:text-3xl">
        Amos del Paraíso desde el {FOUNDED_YEAR}
      </h2>
      <p className="text-sm leading-relaxed text-secondary-fg md:max-w-lg">
        Nacidos entre el desierto y el mar, Los Cabos United representa el orgullo
        sudcaliforniano. Un club joven con un sueño grande: llevar a Baja California Sur a
        la élite del fútbol mexicano.
      </p>
      <div className="relative pt-3">
        <div className="absolute left-[16.666%] right-[16.666%] top-[16px] h-px bg-primary/25" />
        <div className="relative grid grid-cols-3 gap-2">
          {MILESTONES.map((m) => (
            <div key={m.year} className="relative z-10 flex flex-col items-center gap-1 text-center">
              <span className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <span className="text-[11px] font-semibold leading-none text-foreground">
                {m.year}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StadiumContent() {
  return (
    <div className="space-y-2">
      <h2 className="text-display-md text-foreground md:text-3xl">Estadio Don Koll</h2>
      <div className="flex items-start gap-1.5 text-sm text-secondary-fg">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>C. P.º Pacífico, Los Cangrejos, 23473 Cabo San Lucas, B.C.S.</span>
      </div>
    </div>
  );
}

function ImageCard({
  image,
  alt,
  chip,
  children,
  className = "",
}: {
  image: string;
  alt: string;
  chip: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-hairline bg-surface-1",
        className
      )}
    >
      <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/25" />
      <div className="relative flex min-h-[280px] flex-col justify-between p-4 md:min-h-[320px] md:p-6">
        <span className="w-fit rounded-lg border border-primary/30 bg-background/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur">
          {chip}
        </span>
        {children}
      </div>
    </section>
  );
}

/* ---------------------------------- Página ---------------------------------- */

const Club = () => {
  const [topTab, setTopTab] = useState<"adn" | "estadio">("adn");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 pb-8"
    >
      <SeasonSummary />

      {/* Móvil: ADN / Estadio en pestañas */}
      <div className="md:hidden">
        <div className="mb-3 flex gap-1.5">
          {[
            { id: "adn" as const, label: "ADN Cabeño" },
            { id: "estadio" as const, label: "Tu Estadio" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopTab(t.id)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                topTab === t.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-hairline bg-surface-1 text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {topTab === "adn" ? (
          <ImageCard image={adnCabenoImg} alt="Los Cabos United" chip="ADN Cabeño">
            <AdnContent />
          </ImageCard>
        ) : (
          <ImageCard image={donKollImg} alt="Estadio Don Koll" chip="Tu Estadio">
            <StadiumContent />
          </ImageCard>
        )}
      </div>

      {/* Desktop: lado a lado */}
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        <ImageCard
          image={adnCabenoImg}
          alt="Los Cabos United"
          chip="ADN Cabeño"
          className="md:col-span-2"
        >
          <AdnContent />
        </ImageCard>
        <ImageCard image={donKollImg} alt="Estadio Don Koll" chip="Tu Estadio">
          <StadiumContent />
        </ImageCard>
      </div>

      <RosterSection />

      <YouthTeamCard />

      <div className="grid gap-4 md:grid-cols-3">
        <NewsSection className="md:col-span-2" />
        <FanWall />
      </div>
    </motion.div>
  );
};

export default Club;

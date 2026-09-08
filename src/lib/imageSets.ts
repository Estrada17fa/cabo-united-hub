/**
 * Juegos de imágenes responsivas (WebP en 640/1024/1600 px).
 * Se usan con <SmartImage /> para que el celular descargue la variante chica.
 */
import stadium640 from "@/assets/stadium-hero-640.webp";
import stadium1024 from "@/assets/stadium-hero-1024.webp";
import stadium1600 from "@/assets/stadium-hero-1600.webp";
import accesosHero640 from "@/assets/accesos-page-hero-640.webp";
import accesosHero1024 from "@/assets/accesos-page-hero-1024.webp";
import accesosHero1600 from "@/assets/accesos-page-hero-1600.webp";
import mobileBg640 from "@/assets/mobile-team-bg-640.webp";
import mobileBg1024 from "@/assets/mobile-team-bg-1024.webp";
import mobileBg1600 from "@/assets/mobile-team-bg-1600.webp";
import donKoll640 from "@/assets/don-koll-640.webp";
import donKoll1024 from "@/assets/don-koll-1024.webp";
import donKoll1600 from "@/assets/don-koll-1600.webp";
import adn640 from "@/assets/adn-cabeno-640.webp";
import adn1024 from "@/assets/adn-cabeno-1024.webp";
import adn1600 from "@/assets/adn-cabeno-1600.webp";
import tienda1_640 from "@/assets/tienda-hero-1-640.webp";
import tienda1_1024 from "@/assets/tienda-hero-1-1024.webp";
import tienda1_1600 from "@/assets/tienda-hero-1-1600.webp";
import tienda2_640 from "@/assets/tienda-hero-2-640.webp";
import tienda2_1024 from "@/assets/tienda-hero-2-1024.webp";
import tienda2_1600 from "@/assets/tienda-hero-2-1600.webp";
import tienda3_640 from "@/assets/tienda-hero-3-640.webp";
import tienda3_1024 from "@/assets/tienda-hero-3-1024.webp";
import tienda3_1600 from "@/assets/tienda-hero-3-1600.webp";

export interface ImageSet {
  src: string;
  srcSet: string;
}

function set(w640: string, w1024: string, w1600: string): ImageSet {
  return {
    src: w1024,
    srcSet: `${w640} 640w, ${w1024} 1024w, ${w1600} 1600w`,
  };
}

export const IMG = {
  stadiumHero: set(stadium640, stadium1024, stadium1600),
  accesosHero: set(accesosHero640, accesosHero1024, accesosHero1600),
  mobileTeamBg: set(mobileBg640, mobileBg1024, mobileBg1600),
  donKoll: set(donKoll640, donKoll1024, donKoll1600),
  adnCabeno: set(adn640, adn1024, adn1600),
  tiendaHero1: set(tienda1_640, tienda1_1024, tienda1_1600),
  tiendaHero2: set(tienda2_640, tienda2_1024, tienda2_1600),
  tiendaHero3: set(tienda3_640, tienda3_1024, tienda3_1600),
};

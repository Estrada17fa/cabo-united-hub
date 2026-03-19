import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Swords, Users, Heart, Ticket, ShoppingBag, MapPin, Handshake, Mail, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const navLinks = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Zona de Partido", path: "/zona-partido", icon: Swords },
  { name: "Tu Club", path: "/club", icon: Users },
  { name: "Fan Zone", path: "/fan-zone", icon: Heart },
  { name: "Boletos", path: "/boletos", icon: Ticket },
  { name: "Tienda Oficial", path: "/tienda", icon: ShoppingBag },
  { name: "Conoce Los Cabos", path: "/conoce-los-cabos", icon: MapPin },
];

const menuLinks = [
  { name: "Patrocinios", path: "/patrocinios", icon: Handshake },
  { name: "Contáctanos", path: "/contacto", icon: Mail },
];

function MobileNav() {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeIndex = navLinks.findIndex((l) => l.path === location.pathname);
  const isActive = (path: string) => location.pathname === path;

  // Center active item
  useEffect(() => {
    const container = scrollRef.current;
    const activeEl = itemRefs.current[activeIndex];
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const scrollLeft =
      activeEl.offsetLeft - containerRect.width / 2 + elRect.width / 2;

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [activeIndex]);

  const scroll = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const step = dir === "left" ? -1 : 1;
    const targetIndex = Math.min(
      Math.max(0, activeIndex + step),
      navLinks.length - 1
    );
    const targetEl = itemRefs.current[targetIndex];
    if (!targetEl) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = targetEl.getBoundingClientRect();
    const scrollLeft =
      targetEl.offsetLeft - containerRect.width / 2 + elRect.width / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  };

  return (
    <div className="flex items-center flex-1 min-w-0 mx-1">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="flex-shrink-0 p-1 text-muted-foreground active:text-foreground transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable nav */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="flex items-center w-max px-[calc(50%-3.5rem)]">
          {navLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                ref={(el) => { itemRefs.current[i] = el; }}
                style={{ scrollSnapAlign: "center" }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 mx-0.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground scale-105"
                    : "text-muted-foreground active:bg-card"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="flex-shrink-0 p-1 text-muted-foreground active:text-foreground transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-top">
      <div className="flex items-center h-14 sm:h-16 md:h-20 px-3 sm:px-4 gap-2">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-card border border-border flex items-center justify-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
          </div>
        </Link>

        {/* Mobile nav carousel */}
        <div className="md:hidden flex-1 min-w-0">
          <MobileNav />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-lg text-[11px] lg:text-xs font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Más + Hamburger */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted active:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <span className="text-xs sm:text-sm font-medium">Más</span>
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Sheet lateral */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-80">
          <SheetHeader>
            <SheetTitle className="text-lg">Más opciones</SheetTitle>
            <SheetDescription className="sr-only">Menú de navegación adicional</SheetDescription>
          </SheetHeader>

          <div className="space-y-1.5 mt-6">
            <p className="text-label text-muted-foreground mb-3">Extras</p>
            {menuLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-card border border-border text-foreground active:border-secondary/50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

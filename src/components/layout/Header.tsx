import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, CircleDot, Users, Heart, Ticket, ShoppingBag, MapPin, Handshake, Mail, Shield, ChevronLeft, ChevronRight } from "lucide-react";
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
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const rawActiveIndex = navLinks.findIndex((link) => link.path === location.pathname);
  const activeIndex = rawActiveIndex >= 0 ? rawActiveIndex : 0;

  // Calculate translateX to center the active item
  const getTranslateX = useCallback(() => {
    const container = containerRef.current;
    const item = itemRefs.current[activeIndex];
    if (!container || !item) return 0;
    const containerWidth = container.offsetWidth;
    const itemOffsetLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    return -(itemOffsetLeft - containerWidth / 2 + itemWidth / 2);
  }, [activeIndex]);

  const [translateX, setTranslateX] = useState(0);

  // Recalculate position on mount, route change, resize
  useEffect(() => {
    const update = () => setTranslateX(getTranslateX());
    // Double rAF for layout readiness
    const f = requestAnimationFrame(() => requestAnimationFrame(update));
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(f);
      window.removeEventListener("resize", update);
    };
  }, [getTranslateX]);

  // Touch handlers for swipe ±1
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    // Clamp drag feedback to ±80px so it feels constrained
    setDragOffset(Math.max(-80, Math.min(80, delta)));
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    const threshold = 30;
    if (Math.abs(dragOffset) > threshold) {
      const direction = dragOffset < 0 ? 1 : -1;
      const nextIndex = (activeIndex + direction + navLinks.length) % navLinks.length;
      navigate(navLinks[nextIndex].path);
    }
    setDragOffset(0);
  };

  const goToIndex = (direction: "left" | "right") => {
    const nextIndex =
      direction === "left"
        ? (activeIndex - 1 + navLinks.length) % navLinks.length
        : (activeIndex + 1) % navLinks.length;
    navigate(navLinks[nextIndex].path);
  };

  const getCircularDistance = (index: number): number => {
    return Math.min(
      Math.abs(index - activeIndex),
      navLinks.length - Math.abs(index - activeIndex)
    );
  };

  return (
    <div className="flex items-center flex-1 min-w-0 gap-0.5">
      <button
        onClick={() => goToIndex("left")}
        className="flex-shrink-0 rounded-full p-1.5 text-muted-foreground active:text-foreground"
        aria-label="Página anterior"
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex items-center w-max gap-2"
          style={{
            transform: `translateX(${translateX + dragOffset}px)`,
            transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const dist = getCircularDistance(index);
            const isActive = dist === 0;
            const isAdjacent = dist === 1;

            return (
              <button
                key={link.path}
                ref={(el) => { itemRefs.current[index] = el; }}
                onClick={() => navigate(link.path)}
                type="button"
                style={{
                  transform: `scale(${isActive ? 1.12 : isAdjacent ? 0.88 : 0.75})`,
                  opacity: isActive ? 1 : isAdjacent ? 0.65 : 0.35,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className={`flex shrink-0 items-center justify-center rounded-xl border font-medium whitespace-nowrap ${
                  isActive
                    ? "gap-1.5 border-primary bg-primary text-secondary-foreground shadow-lg shadow-primary/20 px-3.5 py-2"
                    : "border-border bg-card text-muted-foreground p-2"
                }`}
              >
                <Icon className={`flex-shrink-0 ${isActive ? "h-3.5 w-3.5" : "h-3.5 w-3.5"}`} />
                {isActive && (
                  <span className="text-[11px] font-semibold">
                    {link.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => goToIndex("right")}
        className="flex-shrink-0 rounded-full p-1.5 text-muted-foreground active:text-foreground"
        aria-label="Página siguiente"
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
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
      <div className="flex items-center h-14 sm:h-16 md:h-20 px-2 sm:px-4 gap-1.5">
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
                    ? "bg-primary text-secondary-foreground"
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
          className="flex-shrink-0 flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted active:bg-muted transition-colors"
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

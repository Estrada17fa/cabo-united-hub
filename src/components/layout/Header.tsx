import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const rawActiveIndex = navLinks.findIndex((link) => link.path === location.pathname);
  const activeIndex = rawActiveIndex >= 0 ? rawActiveIndex : 0;
  const isActive = (path: string) => location.pathname === path;

  const centerItem = (index: number, behavior: ScrollBehavior = "smooth") => {
    const container = scrollRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return;

    const targetLeft = item.offsetLeft - container.clientWidth / 2 + item.offsetWidth / 2;
    const maxLeft = container.scrollWidth - container.clientWidth;

    container.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxLeft)),
      behavior,
    });
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => centerItem(activeIndex));
    const handleResize = () => centerItem(activeIndex, "auto");

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIndex]);

  const goToIndex = (direction: "left" | "right") => {
    const nextIndex =
      direction === "left"
        ? (activeIndex - 1 + navLinks.length) % navLinks.length
        : (activeIndex + 1) % navLinks.length;

    navigate(navLinks[nextIndex].path);
  };

  return (
    <div className="flex items-center flex-1 min-w-0 gap-1">
      <button
        onClick={() => goToIndex("left")}
        className="flex-shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
        aria-label="Página anterior"
        type="button"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          className="flex items-center w-max gap-1"
          style={{ paddingLeft: "calc(50% - 2.9rem)", paddingRight: "calc(50% - 2.9rem)" }}
        >
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const distance = Math.abs(index - activeIndex);
            const active = isActive(link.path);
            const isAdjacent = distance === 1;

            return (
              <Link
                key={link.path}
                to={link.path}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                style={{ scrollSnapAlign: "center" }}
                className={`flex h-10 shrink-0 snap-center items-center justify-center gap-1 overflow-hidden rounded-xl border font-medium whitespace-nowrap transition-all duration-300 ease-out ${
                  active
                    ? "w-[5.8rem] border-primary bg-primary px-2.5 text-primary-foreground shadow-sm"
                    : isAdjacent
                      ? "w-[4.5rem] border-border bg-card px-2 text-foreground scale-90"
                      : "w-[3.5rem] border-transparent bg-transparent px-1.5 text-muted-foreground scale-75 opacity-55"
                }`}
              >
                <Icon className={`${active ? "h-3.5 w-3.5" : "h-3 w-3"} flex-shrink-0`} />
                <span className={`truncate ${active ? "text-[11px]" : isAdjacent ? "text-[10px]" : "text-[9px]"}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => goToIndex("right")}
        className="flex-shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
        aria-label="Página siguiente"
        type="button"
      >
        <ChevronRight className="h-3.5 w-3.5" />
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

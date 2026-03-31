import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, Users, Heart, Ticket, ShoppingBag, MapPin, Handshake, Mail, Shield, Icon } from "lucide-react";
import { soccerBall } from "@lucide/lab";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const SoccerBallIcon = (props: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <Icon iconNode={soccerBall} {...props} />
);

const navLinks = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Zona de Partido", path: "/zona-partido", icon: SoccerBallIcon },
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
  const activeIndex = navLinks.findIndex((link) => link.path === location.pathname);
  const currentIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <LayoutGroup>
      <div className="flex items-center justify-center gap-1.5 px-2">
        {navLinks.map((link, index) => {
          const NavIcon = link.icon;
          const isActive = index === currentIndex;

          return (
            <motion.button
              key={link.path}
              layout
              onClick={() => navigate(link.path)}
              type="button"
              className={`relative flex items-center justify-center rounded-xl font-medium whitespace-nowrap transition-colors duration-300 ${
                isActive
                  ? "gap-1.5 bg-primary text-secondary-foreground shadow-lg shadow-primary/20 px-3 py-2"
                  : "text-muted-foreground hover:text-foreground p-2"
              }`}
              transition={{
                layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <NavIcon className="flex-shrink-0 h-4 w-4" />
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.span
                    key={`label-${link.path}`}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="text-[11px] font-semibold overflow-hidden"
                  >
                    {link.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-top">
      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Top row: shield centered, hamburger top-right */}
        <div className="relative flex items-center justify-center h-14 px-2">
          <Link to="/" className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </Link>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-card border border-border text-foreground active:bg-muted transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Nav row below shield */}
        <div className="pb-2 overflow-x-auto scrollbar-hide">
          <MobileNav />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center h-20 px-4 gap-1.5">
        <Link to="/" className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {navLinks.map((link) => {
            const NavIcon = link.icon;
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
                <NavIcon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted active:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <span className="text-sm font-medium">Más</span>
          <Menu className="w-5 h-5" />
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
              const NavIcon = link.icon;
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
                  <NavIcon className="w-4 h-4 flex-shrink-0" />
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

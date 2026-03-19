import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Swords, Users, Heart, Ticket, ShoppingBag, MapPin, Handshake, Mail, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-top">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-card border border-border flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
            </div>
          </Link>

          {/* Main Navigation - Desktop only */}
          <nav className="hidden md:flex items-center gap-1">
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

          {/* Mobile: scrollable icon nav */}
          <div className="flex-1 mx-2 md:hidden overflow-hidden">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                      isActive(link.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground active:bg-card"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </nav>
          </div>

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
      </div>

      {/* Sheet lateral */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-80 p-0">
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="text-lg">Más opciones</SheetTitle>
            <SheetDescription className="sr-only">Menú de navegación adicional</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="px-5 pb-8">
              {/* Mobile: main nav */}
              <div className="md:hidden space-y-1.5">
                <p className="text-label text-muted-foreground mb-3">Navegación</p>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.path)
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-foreground active:border-primary/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  );
                })}
                <div className="h-px bg-border my-4" />
              </div>

              {/* Secondary links */}
              <div className="space-y-1.5">
                <p className="text-label text-muted-foreground mb-3 md:mt-0">Extras</p>
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
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </header>
  );
}

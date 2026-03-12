import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, Trophy, Medal, Ticket, ShoppingBag, User, Newspaper, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Club", path: "/club", icon: Users },
  { name: "Quiniela", path: "/quiniela", icon: Trophy },
  { name: "Liga", path: "/liga", icon: Medal },
  { name: "Tickets", path: "/tickets", icon: Ticket },
  { name: "Tienda", path: "/tienda", icon: ShoppingBag },
];

const mobileMenuLinks = [
  { name: "Perfil", path: "/perfil", icon: User },
  { name: "Noticias", path: "/noticias", icon: Newspaper },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card border border-border flex items-center justify-center">
              <Shield className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <span className="hidden sm:block text-title font-bold">Los Cabos United</span>
          </Link>

          {/* Main Navigation - Always visible */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Hamburger Menu Button - For Perfil & Noticias */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Overlay - Only Perfil & Noticias */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 md:top-20 bg-background/95 backdrop-blur-xl z-40"
          >
            <motion.nav
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="container mx-auto px-4 py-6 flex flex-col gap-2"
            >
              {/* Mobile-only: Main Navigation Links */}
              <div className="sm:hidden space-y-2">
                <p className="text-label text-muted-foreground mb-4">Navegación</p>
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-medium transition-all ${
                          isActive(link.path)
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
                {/* Divider */}
                <div className="h-px bg-border my-4" />
              </div>

              {/* Secondary Links - Perfil & Noticias */}
              <div className="space-y-2">
                <p className="text-label text-muted-foreground mb-4">Más opciones</p>
                {mobileMenuLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-medium transition-all ${
                          isActive(link.path)
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-card border border-border text-foreground hover:border-secondary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Home,
  Users,
  Heart,
  ShoppingBag,
  MapPin,
  Handshake,
  Mail,
  Icon,
  Facebook,
  Instagram,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import lcuCrest from "@/assets/lcu-crest.png";
import { soccerBall } from "@lucide/lab";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

import { AuthModal } from "@/components/auth/AuthModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCartStore } from "@/stores/cartStore";
import { FanPassMini } from "@/components/pass/FanPassMini";
import { MiniPassChip } from "@/components/pass/MiniPassChip";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { preloadRoute } from "@/lib/route-preload";


const SoccerBallIcon = (props: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <Icon iconNode={soccerBall} {...props} />
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.69h-1z" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/share/17GdThDsCD/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/loscabosunited?igsh=ZWVxY2c3ZTJlam5n", label: "Instagram" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@loscabosunited?_r=1&_t=ZS-959h0uWCj13", label: "TikTok" },
  { icon: WhatsAppIcon, href: "#", label: "WhatsApp" },
];

/** Navbar principal: visible en móvil (etiqueta corta) y desktop (nombre completo). */
const navLinks = [
  { name: "Inicio", shortName: "Inicio", path: "/", icon: Home },
  { name: "Match Zone", shortName: "Match", path: "/zona-partido", icon: SoccerBallIcon },
  { name: "Tu Club", shortName: "Club", path: "/club", icon: Users },
  { name: "Fan Zone", shortName: "Fans", path: "/fan-zone", icon: Heart },
  { name: "Visita Los Cabos", shortName: "Visita", path: "/conoce-los-cabos", icon: MapPin },
  { name: "Tienda Oficial", shortName: "Tienda", path: "/tienda", icon: ShoppingBag },
];

const shopLink = { name: "Tienda", path: "/tienda", icon: ShoppingBag };

const menuLinks = [
  { name: "Patrocinios", path: "/patrocinios", icon: Handshake },
  { name: "Contáctanos", path: "/contacto", icon: Mail },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSignupWizard, setShowSignupWizard] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  const totalCartItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const hasCartItems = totalCartItems > 0;
  const setCartOpen = useCartStore((s) => s.setOpen);

  const handleOpenCart = () => {
    setIsMenuOpen(false);
    setTimeout(() => setCartOpen(true), 200);
  };

  const openAuth = () => {
    setIsMenuOpen(true);
    setShowAuth(true);
  };

  const go = (path: string) => {
    preloadRoute(path);
    setIsMenuOpen(false);
    if (path !== location.pathname) {
      window.scrollTo(0, 0);
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md safe-top">
      {/* Línea 1 — hamburguesa · logo · mini pase */}
      <div className="relative flex h-14 items-center justify-center px-2 lg:px-4">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-[11px] border border-hairline bg-surface-2 p-2 text-foreground transition-colors active:bg-surface-3 lg:left-4"
          aria-label="Abrir menú"
        >
          <span className="relative block">
            <Menu className="h-5 w-5" />
            {hasCartItems && (
              <span
                className="absolute -right-1.5 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-background"
                style={{ background: "hsl(var(--primary))" }}
                aria-label={`${totalCartItems} en carrito`}
              >
                {totalCartItems}
              </span>
            )}
          </span>
        </button>

        <Link to="/" className="flex items-center justify-center" aria-label="Inicio">
          <img src={lcuCrest} alt="Los Cabos United" className="h-10 w-auto object-contain" />
        </Link>

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center lg:right-4">
          <MiniPassChip onRequestAuth={openAuth} />
        </div>
      </div>

      <div className="h-px bg-hairline" />

      {/* Línea 2 — navbar visible en todos los formatos, subrayado activo animado */}
      <nav className="border-b border-hairline" aria-label="Navegación principal">
        <ul className="mx-auto grid max-w-6xl grid-cols-6 px-1 sm:flex sm:items-center sm:justify-center sm:gap-1 sm:px-4">
          {navLinks.map((link) => {
            const NavIcon = link.icon;
            const active = isActive(link.path);
            return (
              <li key={link.path} className="relative">
                <Link
                  to={link.path}
                  onMouseEnter={() => preloadRoute(link.path)}
                  onTouchStart={() => preloadRoute(link.path)}
                  onFocus={() => preloadRoute(link.path)}
                  onClick={() => window.scrollTo(0, 0)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors sm:flex-row sm:gap-1.5 sm:px-3 sm:py-3",
                    active
                      ? "font-semibold text-primary sm:text-foreground"
                      : "font-medium text-muted-foreground hover:text-foreground/80",
                  )}
                >
                  <motion.span
                    animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="flex"
                  >
                    <NavIcon className="h-[18px] w-[18px] sm:h-4 sm:w-4" strokeWidth={2} />
                  </motion.span>
                  <span className="text-[9px] leading-none tracking-wide sm:hidden">
                    {link.shortName}
                  </span>
                  <span className="hidden text-[13px] sm:inline">{link.name}</span>
                </Link>
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-primary sm:inset-x-2"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Drawer */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="flex w-[85vw] max-w-80 flex-col overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <SheetDescription className="sr-only">Menú de navegación</SheetDescription>
          </SheetHeader>

          {/* Perfil / Auth */}
          <div className="mb-5 mt-4">
            {user && profile ? (
              <div className="space-y-4">
                <Link
                  to="/mi-perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center gap-3"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-primary/30 transition-all group-hover:ring-primary">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-surface-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      ¡Hola!, {profile.display_name ?? "Fan"}
                    </p>
                    {profile.username && (
                      <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>
                </Link>
                <FanPassMini userId={user.id} onNavigate={() => setIsMenuOpen(false)} />
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-primary/40"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Panel de administración
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div>
                {showAuth ? (
                  <AuthModal
                    loginOnly
                    onSuccess={() => {
                      setShowAuth(false);
                      setIsMenuOpen(false);
                    }}
                  />
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAuth(true)}
                      className="flex w-full items-center gap-3 rounded-[11px] bg-primary px-3.5 py-3 text-sm font-semibold text-primary-foreground"
                    >
                      <User className="h-4 w-4" />
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setTimeout(() => setShowSignupWizard(true), 200);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-[11px] border border-hairline bg-surface-2 px-3.5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-3"
                    >
                      Crear cuenta
                    </button>
                  </div>
                )}
                {showAuth && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setTimeout(() => setShowSignupWizard(true), 200);
                    }}
                    className="mt-3 w-full text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    ¿No tienes cuenta? <span className="font-semibold text-primary">Crea tu pase</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navegación apilada (móvil) */}
          <nav className="mb-4 lg:hidden" aria-label="Navegación">
            <AnimatePresence initial={false}>
              {isMenuOpen && (
                <ul className="space-y-1">
                  {navLinks.map((link, i) => {
                    const NavIcon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <motion.li
                        key={link.path}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i, duration: 0.22, ease: "easeOut" }}
                      >
                        <button
                          onClick={() => go(link.path)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex w-full items-center gap-3 rounded-[11px] px-3.5 py-3 text-sm transition-colors",
                            active
                              ? "bg-surface-2 font-semibold text-foreground"
                              : "font-medium text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
                          )}
                          <NavIcon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                          <span className="flex-1 truncate text-left">{link.name}</span>
                          {link.path === shopLink.path && hasCartItems && (
                            <span
                              className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-background"
                              style={{ background: "hsl(var(--primary))" }}
                            >
                              {totalCartItems}
                            </span>
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </AnimatePresence>
          </nav>

          {/* Ver carrito */}
          <button
            onClick={handleOpenCart}
            className="flex w-full items-center gap-3 rounded-[11px] border border-hairline bg-surface-2 px-3.5 py-3 text-sm font-semibold text-foreground transition-all active:scale-[0.99]"
          >
            <ShoppingBag className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">Ver Carrito</span>
            {hasCartItems && (
              <span
                className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-background"
                style={{ background: "hsl(var(--primary))" }}
              >
                {totalCartItems}
              </span>
            )}
            <ChevronRight className="h-4 w-4 opacity-60" />
          </button>

          <div className="flex-1" />

          <div className="mb-4 h-px bg-hairline" />

          <div className="space-y-1.5 pb-2">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Extras
            </p>
            {menuLinks.map((link) => {
              const NavIcon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-[11px] px-3.5 py-3 text-sm transition-all",
                    isActive(link.path)
                      ? "bg-surface-2 font-semibold text-foreground"
                      : "border border-hairline bg-surface-1 font-medium text-foreground",
                  )}
                >
                  <NavIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}

            <div className="flex items-center gap-1.5 pt-3">
              {socialLinks.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[11px] border border-hairline bg-surface-1 p-2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={social.label}
                  >
                    <SocialIcon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

          </div>
        </SheetContent>
      </Sheet>

      <AuthFlow
        open={showSignupWizard}
        onClose={() => setShowSignupWizard(false)}
        initialTierId="fan"
      />
    </header>
  );
}

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, Users, Heart, Ticket, ShoppingBag, MapPin, Handshake, Mail, Shield, Icon, Facebook, Instagram, User, LogOut, ChevronRight } from "lucide-react";
import lcuCrest from "@/assets/lcu-crest.png";
import { soccerBall } from "@lucide/lab";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
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
import { SignupWizard, type WizardTier } from "@/components/accesos/SignupWizard";

const WIZARD_TIERS: WizardTier[] = [
  { id: "fan", badge: "FAN", price: "$0", priceNote: "Gratis para siempre", tagline: "Empieza a vivir el paraíso, sin costo.", accent: "#FFFFFF" },
  { id: "gold", badge: "GOLD", price: "$1,499", priceNote: "por temporada", tagline: "Tu lugar en la grada y el kit que te identifica.", accent: "#F59E0B" },
  { id: "premium", badge: "PREMIUM", price: "$2,499", priceNote: "por temporada", tagline: "Vive el partido desde adentro, con foto incluida.", accent: "#00abc4" },
  { id: "platino", badge: "PLATINO", price: "$4,999", priceNote: "por temporada · edición Socio Fundador", tagline: "Tu nombre, tu asiento, tu temporada inolvidable.", accent: "#E2E8F0" },
];

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

const navLinks = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Match Zone", path: "/zona-partido", icon: SoccerBallIcon },
  { name: "Tu Club", path: "/club", icon: Users },
  { name: "Fan Zone", path: "/fan-zone", icon: Heart },
  { name: "Accesos", path: "/accesos", icon: Ticket },
  { name: "Tienda Oficial", path: "/tienda", icon: ShoppingBag },
  { name: "Visita Los Cabos", path: "/conoce-los-cabos", icon: MapPin },
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

  const transition = { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const };
  const handleNavigate = (path: string) => {
    if (path === location.pathname) return;
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <motion.div layoutRoot className="flex items-center justify-center gap-1.5 px-2">
      <LayoutGroup>
        {navLinks.map((link, index) => {
          const NavIcon = link.icon;
          const isActive = index === currentIndex;

          return (
            <motion.div
              key={link.path}
              layout="position"
              onClick={() => handleNavigate(link.path)}
              className="relative flex items-center cursor-pointer"
              transition={{ layout: transition }}
            >
              {/* Background plate — local per tab, scales from center */}
              <AnimatePresence mode="wait" initial={false}>
                {isActive && (
                  <motion.div
                    key="plate"
                    className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    style={{ originX: 0.5, originY: 0.5 }}
                    transition={transition}
                  />
                )}
              </AnimatePresence>

              {/* Non-active subtle bg */}
              {!isActive && (
                <div className="absolute inset-0 bg-muted/40 rounded-full" />
              )}

              {/* Content: rigid icon + animated label */}
              <div
                className={`relative z-10 flex items-center gap-1.5 ${
                  isActive ? "px-3.5 py-2 text-secondary-foreground" : "p-2 text-foreground/50"
                }`}
              >
                {/* Icon — fixed size, never participates in scaling */}
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  <NavIcon className="w-4 h-4" strokeWidth={2.5} />
                </div>

                {/* Label — only rendered when active, animates width independently */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      key="label"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={transition}
                      className="text-[13px] font-bold uppercase whitespace-nowrap overflow-hidden block"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </LayoutGroup>
    </motion.div>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSignupWizard, setShowSignupWizard] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const totalCartItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const hasCartItems = totalCartItems > 0;
  const setCartOpen = useCartStore((s) => s.setOpen);

  const handleOpenCart = () => {
    setIsMenuOpen(false);
    // Pequeño delay para que la animación del sheet del menú se cierre
    // antes de abrir el del carrito y evitar conflictos del overlay.
    setTimeout(() => setCartOpen(true), 200);
  };

  return (
    <motion.header layoutRoot className="fixed top-0 left-0 right-0 z-50 bg-background/95 safe-top">
      {/* Mobile + Tablet layout */}
      <div className="lg:hidden">
        {/* Top row: hamburger left, shield center, social right */}
        <div className="relative flex items-center justify-center h-14 px-2">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-card border border-border text-foreground active:bg-muted transition-colors"
            aria-label="Abrir menú"
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {hasCartItems && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "#00abc4", color: "#000" }}
                  aria-label={`${totalCartItems} en carrito`}
                >
                  {totalCartItems}
                </span>
              )}
            </div>
          </button>

          <Link to="/" className="flex items-center justify-center" aria-label="Inicio">
            <img
              src={lcuCrest}
              alt="Los Cabos United"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {socialLinks.map((social) => {
              const SocialIcon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground active:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <SocialIcon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Separator line */}
        <div className="h-px bg-border" />

        {/* Nav row below shield */}
        <div className="py-2.5 overflow-x-auto scrollbar-hide bg-card/50 backdrop-blur-sm">
          <MobileNav />
        </div>

        {/* Separator line */}
        <div className="h-px bg-border" />
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex items-center h-20 px-4 gap-1.5 border-b border-border">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="relative flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted active:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
          {hasCartItems && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: "#00abc4", color: "#000" }}
              aria-label={`${totalCartItems} en carrito`}
            >
              {totalCartItems}
            </span>
          )}
        </button>

        <Link to="/" className="flex-shrink-0" aria-label="Inicio">
          <img
            src={lcuCrest}
            alt="Los Cabos United"
            className="h-12 w-auto object-contain"
          />
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {navLinks.map((link) => {
            const NavIcon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-full text-xs lg:text-sm transition-all duration-300 ${
                  isActive(link.path)
                    ? "bg-primary text-secondary-foreground shadow-lg shadow-primary/25 font-bold"
                    : "text-foreground/50 hover:text-foreground/80 hover:bg-muted/40 font-semibold"
                }`}
              >
                <NavIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="hidden lg:inline uppercase">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 flex items-center gap-1.5">
          {socialLinks.map((social) => {
            const SocialIcon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card active:text-primary transition-colors"
                aria-label={social.label}
              >
                <SocialIcon className="w-5 h-5" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Sheet lateral */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-80 flex flex-col">
          <SheetHeader>
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <SheetDescription className="sr-only">Menú de navegación adicional</SheetDescription>
          </SheetHeader>

          {/* Profile / Auth section */}
          <div className="mt-4 mb-6">
            {user && profile ? (
              <div className="space-y-4">
                <Link
                  to="/mi-perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="w-12 h-12 ring-2 ring-primary/30 group-hover:ring-primary transition-all">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-muted">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      ¡Hola!, {profile.display_name ?? "Fan"}
                    </p>
                    {profile.username && (
                      <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                    )}
                  </div>
                </Link>
                <FanPassMini userId={user.id} onNavigate={() => setIsMenuOpen(false)} />
                <button
                  onClick={async () => {
                    await signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div>
                {showAuth ? (
                  <AuthModal
                    loginOnly
                    onSuccess={() => { setShowAuth(false); setIsMenuOpen(false); }}
                  />
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAuth(true)}
                      className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                    >
                      <User className="w-4 h-4" />
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setTimeout(() => setShowSignupWizard(true), 200);
                      }}
                      className="flex items-center justify-center gap-2 w-full px-3.5 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
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
                    className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ¿No tienes cuenta? <span className="text-primary font-semibold">Crea tu pase</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ver Carrito */}
          <button
            onClick={handleOpenCart}
            className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.99]"
            style={{
              background: "#00abc4",
              color: "#000",
              boxShadow: "0 4px 14px -4px #00abc480",
            }}
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Ver Carrito</span>
            {hasCartItems && (
              <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-black text-[10px] font-bold text-white flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          {/* Spacer pushes Extras to the bottom */}
          <div className="flex-1" />

          <div className="h-px bg-border mb-4" />

          <div className="space-y-1.5 pb-2">
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

      <SignupWizard
        open={showSignupWizard}
        onClose={() => setShowSignupWizard(false)}
        tiers={WIZARD_TIERS}
        initialTierId="fan"
      />
    </motion.header>
  );
}

import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Handshake, Loader2, MapPin, Newspaper, ShieldCheck, ShoppingBag, Ticket, Trophy, Users } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

/** Cada sección se carga sola (lazy). Nada se monta ni consulta si no la abres. */
const SECTIONS = [
  { id: "torneo", label: "Torneo", icon: Trophy, Component: lazy(() => import("./sections/Torneo")) },
  { id: "plantel", label: "Plantel", icon: Users, Component: lazy(() => import("./sections/Plantel")) },
  { id: "noticias", label: "Noticias", icon: Newspaper, Component: lazy(() => import("./sections/Noticias")) },
  { id: "aficion", label: "Afición", icon: Users, Component: lazy(() => import("./sections/Aficion")) },
  { id: "visita", label: "Visita Los Cabos", icon: MapPin, Component: lazy(() => import("./sections/Visita")) },
  { id: "tienda", label: "Tienda", icon: ShoppingBag, Component: lazy(() => import("./sections/Tienda")) },
  {
    id: "patrocinadores",
    label: "Patrocinadores",
    icon: Handshake,
    Component: lazy(() => import("./sections/Patrocinadores")),
  },
  {
    id: "abonos",
    label: "Lista de espera",
    icon: Ticket,
    Component: lazy(() => import("./AbonosWaitlist")),
  },
];

function Fallback() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function AdminShell() {
  const { isAdmin, loading } = useIsAdmin();
  const [active, setActive] = useState(() => localStorage.getItem("lcu-admin-section") || "torneo");

  useEffect(() => {
    localStorage.setItem("lcu-admin-section", active);
  }, [active]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <ShieldCheck className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Esta sección es solo para administradores.</p>
        <Link to="/" className="text-sm font-bold text-primary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const Section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-hairline bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Sitio
          </Link>
          <div className="h-4 w-px bg-hairline" />
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h1 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Panel de administración
          </h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 lg:grid-cols-[210px_1fr]">
        <nav className="flex h-fit gap-1 overflow-x-auto rounded-2xl border border-hairline bg-surface-1 p-2 lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${
                active === s.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 pb-16">
          <Suspense fallback={<Fallback />}>
            <Section.Component />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

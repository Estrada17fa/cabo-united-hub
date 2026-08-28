import { useEffect } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, Ticket } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

/** Secciones del panel. Agregar nuevas entradas aquí (Comercios, Pagos, etc.). */
export const ADMIN_SECTIONS = [
  { label: "Lista de espera", to: "/admin/abonos", icon: Ticket },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin === false) navigate("/", { replace: true });
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="pb-24 pt-2">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-4 h-4 text-brand-primary" />
        <h1 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
          Panel de administración
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <nav className="rounded-2xl border border-border bg-card p-2 h-fit flex lg:flex-col gap-1 overflow-x-auto">
          {ADMIN_SECTIONS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`
              }
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

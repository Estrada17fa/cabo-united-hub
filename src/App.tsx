import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { DataWarmup } from "./components/layout/DataWarmup";
import { PageSkeleton } from "./components/lcu/PageSkeleton";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import { routeLoaders } from "./lib/route-preload";

const lazyRoute = (path: string) =>
  lazy(routeLoaders[path] as () => Promise<{ default: React.ComponentType }>);

const ZonaPartido = lazyRoute("/zona-partido");
const Club = lazyRoute("/club");
const FanZone = lazyRoute("/fan-zone");
const Accesos = lazyRoute("/accesos");
const MiPase = lazyRoute("/mi-pase");
const Comercios = lazyRoute("/comercios");
const Tienda = lazyRoute("/tienda");
const TiendaBuscar = lazyRoute("/tienda/buscar");
const ConoceLosCabos = lazyRoute("/conoce-los-cabos");
const Patrocinios = lazyRoute("/patrocinios");
const Contacto = lazyRoute("/contacto");
const MiPerfil = lazyRoute("/mi-perfil");
const Abonos = lazyRoute("/abonos");

const TiendaProducto = lazy(() => import("./pages/TiendaProducto"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ConfirmarCorreo = lazy(() => import("./pages/ConfirmarCorreo"));
const ConsentimientoTutor = lazy(() => import("./pages/ConsentimientoTutor"));
const AbonosExito = lazy(() => import("./pages/AbonosExito"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** El panel vive fuera del layout público: no monta header, marquesina ni tienda. */
const AdminShell = lazy(() => import("./pages/admin/AdminShell"));

import { CartDrawer } from "@/components/tienda/CartDrawer";
import { useCartSync } from "@/hooks/useCartSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // La segunda visita a una página se pinta desde caché y actualiza en silencio.
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => <PageSkeleton />;

const AppShell = () => {
  useCartSync();
  return (
    <AppLayout>
      <ScrollToTop />
      <DataWarmup />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/zona-partido" element={<ZonaPartido />} />
          <Route path="/club" element={<Club />} />
          <Route path="/fan-zone" element={<FanZone />} />
          <Route path="/accesos" element={<Accesos />} />
          <Route path="/mi-pase" element={<MiPase />} />
          <Route path="/comercios" element={<Comercios />} />

          <Route path="/tienda" element={<Tienda />} />
          <Route path="/tienda/producto/:handle" element={<TiendaProducto />} />
          <Route path="/tienda/buscar" element={<TiendaBuscar />} />
          <Route path="/conoce-los-cabos" element={<ConoceLosCabos />} />
          <Route path="/patrocinios" element={<Patrocinios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirmar-correo" element={<ConfirmarCorreo />} />
          <Route path="/consentimiento-tutor/:token" element={<ConsentimientoTutor />} />
          <Route path="/abonos" element={<Abonos />} />
          <Route path="/abonos/exito" element={<AbonosExito />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CartDrawer />
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminShell />
                </Suspense>
              }
            />
            <Route path="*" element={<AppShell />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

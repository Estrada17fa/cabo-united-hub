import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./components/layout/AppLayout";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";

const ZonaPartido = lazy(() => import("./pages/ZonaPartido"));
const Club = lazy(() => import("./pages/Club"));
const FanZone = lazy(() => import("./pages/FanZone"));
const Accesos = lazy(() => import("./pages/Accesos"));
const MiPase = lazy(() => import("./pages/MiPase"));
const Comercios = lazy(() => import("./pages/Comercios"));
const Tienda = lazy(() => import("./pages/Tienda"));
const TiendaProducto = lazy(() => import("./pages/TiendaProducto"));
const TiendaBuscar = lazy(() => import("./pages/TiendaBuscar"));
const ConoceLosCabos = lazy(() => import("./pages/ConoceLosCabos"));
const Patrocinios = lazy(() => import("./pages/Patrocinios"));
const Contacto = lazy(() => import("./pages/Contacto"));
const MiPerfil = lazy(() => import("./pages/MiPerfil"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ConfirmarCorreo = lazy(() => import("./pages/ConfirmarCorreo"));
const ConsentimientoTutor = lazy(() => import("./pages/ConsentimientoTutor"));
const Abonos = lazy(() => import("./pages/Abonos"));
const AbonosExito = lazy(() => import("./pages/AbonosExito"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** El panel vive fuera del layout público: no monta header, marquesina ni tienda. */
const AdminShell = lazy(() => import("./pages/admin/AdminShell"));

import { CartDrawer } from "@/components/tienda/CartDrawer";
import { useCartSync } from "@/hooks/useCartSync";

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="flex justify-center py-24">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const AppShell = () => {
  useCartSync();
  return (
    <AppLayout>
      <ScrollToTop />
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

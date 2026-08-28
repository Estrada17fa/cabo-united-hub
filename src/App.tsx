import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Club from "./pages/Club";
import ZonaPartido from "./pages/ZonaPartido";
import FanZone from "./pages/FanZone";
import Accesos from "./pages/Accesos";
import MiPase from "./pages/MiPase";
import Comercios from "./pages/Comercios";

import Tienda from "./pages/Tienda";
import TiendaProducto from "./pages/TiendaProducto";
import TiendaBuscar from "./pages/TiendaBuscar";
import ConoceLosCabos from "./pages/ConoceLosCabos";
import Patrocinios from "./pages/Patrocinios";
import Contacto from "./pages/Contacto";
import MiPerfil from "./pages/MiPerfil";
import ResetPassword from "./pages/ResetPassword";
import ConsentimientoTutor from "./pages/ConsentimientoTutor";
import Abonos from "./pages/Abonos";
import AbonosExito from "./pages/AbonosExito";
import NotFound from "./pages/NotFound";
import { CartDrawer } from "@/components/tienda/CartDrawer";
import { useCartSync } from "@/hooks/useCartSync";

const queryClient = new QueryClient();

const AppShell = () => {
  useCartSync();
  return (
    <AppLayout>
      <ScrollToTop />
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
        <Route path="/consentimiento-tutor/:token" element={<ConsentimientoTutor />} />
        <Route path="/abonos" element={<Abonos />} />
        <Route path="/abonos/exito" element={<AbonosExito />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

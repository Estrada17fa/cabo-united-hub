import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Club from "./pages/Club";
import ZonaPartido from "./pages/ZonaPartido";
import FanZone from "./pages/FanZone";
import Tickets from "./pages/Tickets";
import Tienda from "./pages/Tienda";
import ConoceLosCabos from "./pages/ConoceLosCabos";
import Patrocinios from "./pages/Patrocinios";
import Contacto from "./pages/Contacto";
import MiPerfil from "./pages/MiPerfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/zona-partido" element={<ZonaPartido />} />
              <Route path="/club" element={<Club />} />
              <Route path="/fan-zone" element={<FanZone />} />
              <Route path="/boletos" element={<Tickets />} />
              <Route path="/tienda" element={<Tienda />} />
              <Route path="/conoce-los-cabos" element={<ConoceLosCabos />} />
              <Route path="/patrocinios" element={<Patrocinios />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/mi-perfil" element={<MiPerfil />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

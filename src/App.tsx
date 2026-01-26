import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Club from "./pages/Club";
import Quiniela from "./pages/Quiniela";
import Liga from "./pages/Liga";
import Tickets from "./pages/Tickets";
import Tienda from "./pages/Tienda";
import Perfil from "./pages/Perfil";
import Noticias from "./pages/Noticias";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/club" element={<Club />} />
            <Route path="/quiniela" element={<Quiniela />} />
            <Route path="/liga" element={<Liga />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

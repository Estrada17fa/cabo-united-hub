import { useEffect, useState } from "react";
import { useMatches, useStandings } from "@/hooks/useLeague";
import { useClubPlayers } from "@/hooks/useClub";
import { useSponsors } from "@/hooks/useSponsors";
import { usePlaces } from "@/hooks/useVisitaLosCabos";
import { useProducts } from "@/hooks/useProducts";
import { preloadPrimaryRoutes } from "@/lib/route-preload";

/**
 * Calienta la caché de react-query con los datos que comparten varias páginas.
 * Usa los mismos hooks (y por tanto las mismas claves) que las páginas, así que
 * al navegar los datos ya están en caché y la vista se pinta al instante.
 * No renderiza nada.
 */
function Warmup() {
  useMatches();
  useStandings();
  useClubPlayers();
  useSponsors();
  usePlaces();
  useProducts();
  return null;
}

export function DataWarmup() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Esperamos a que la vista actual pinte antes de pedir lo demás.
    const t = window.setTimeout(() => setReady(true), 400);
    preloadPrimaryRoutes();
    return () => window.clearTimeout(t);
  }, []);

  return ready ? <Warmup /> : null;
}

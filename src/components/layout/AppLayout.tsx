import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./Header";
import { SponsorCarousel } from "./SponsorCarousel";
import { RouteLoadingBar } from "./RouteLoadingBar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [routeLoading, setRouteLoading] = useState(false);

  useLayoutEffect(() => {
    if (previousPath.current === location.pathname) return;

    previousPath.current = location.pathname;
    setRouteLoading(true);
    const timer = window.setTimeout(() => setRouteLoading(false), 650);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <AnimatePresence>
        {routeLoading && (
          <motion.div
            key="route-loading-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-x-0 bottom-12 top-[6.75rem] z-30 bg-background sm:top-[6.5rem]"
          >
            <RouteLoadingBar />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pb-16 pt-[6.75rem] sm:pt-[6.5rem]">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0.96 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <SponsorCarousel />
    </div>
  );
}

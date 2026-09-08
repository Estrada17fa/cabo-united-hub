import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Grupos estables: el visitante recurrente reutiliza la caché del navegador
    // y una página nueva no vuelve a bajar las librerías comunes.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("mapbox-gl")) return "vendor-map";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils"))
            return "vendor-motion";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("@stripe")) return "vendor-stripe";
          if (id.includes("html-to-image") || id.includes("qrcode")) return "vendor-pass";
          if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform"))
            return "vendor-forms";
          if (id.includes("i18next")) return "vendor-i18n";
          if (id.includes("@tanstack")) return "vendor-query";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("/react/") || id.includes("react-dom") || id.includes("scheduler"))
            return "vendor-react";
          if (id.includes("@radix-ui")) return "vendor-ui";
          if (id.includes("@remix-run")) return "vendor-router";
          // lucide-react se reparte por página: cada pantalla baja solo sus iconos.
        },
      },
    },
  },
}));

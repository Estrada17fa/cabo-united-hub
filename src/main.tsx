import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el contenedor principal de la aplicación");
}

const splashStartedAt = performance.now();
const MINIMUM_SPLASH_TIME = 700;

createRoot(rootElement).render(<App />);

function hideSplash() {
  const splash = document.getElementById("lcu-splash");
  if (!splash) return;
  splash.classList.add("lcu-splash-hide");
  splash.addEventListener("transitionend", () => splash.remove(), { once: true });
  // Fallback: remove even if the transition event never fires
  window.setTimeout(() => splash.remove(), 600);
}

// Deja ver brevemente la marca y retírala cuando React ya pintó su primer frame.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const elapsed = performance.now() - splashStartedAt;
    window.setTimeout(hideSplash, Math.max(0, MINIMUM_SPLASH_TIME - elapsed));
  });
});

// Safeguard: never leave the splash stuck if something goes wrong
window.setTimeout(hideSplash, 8000);

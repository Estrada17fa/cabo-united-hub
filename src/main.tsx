import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(<App />);

function hideSplash() {
  const splash = document.getElementById("lcu-splash");
  if (!splash) return;
  splash.classList.add("lcu-splash-hide");
  splash.addEventListener("transitionend", () => splash.remove(), { once: true });
  // Fallback: remove even if the transition event never fires
  window.setTimeout(() => splash.remove(), 600);
}

// Fade the splash out as soon as React has painted its first frame
requestAnimationFrame(() => requestAnimationFrame(hideSplash));

// Safeguard: never leave the splash stuck if something goes wrong
window.setTimeout(hideSplash, 8000);

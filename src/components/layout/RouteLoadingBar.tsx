import { useEffect, useState } from "react";

export function RouteLoadingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={`lcu-route-loading ${visible ? "lcu-route-loading-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando página"
    >
      <span />
    </div>
  );
}
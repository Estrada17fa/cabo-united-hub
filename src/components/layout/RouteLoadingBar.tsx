import lcuCrest from "@/assets/lcu-crest.png";

export function RouteLoadingBar() {
  return (
    <div
      className="lcu-route-loading"
      role="status"
      aria-live="polite"
    >
      <img src={lcuCrest} alt="" className="lcu-route-loading-crest" />
      <div className="lcu-route-loading-track" aria-hidden="true">
        <span />
      </div>
      <span className="lcu-route-loading-label">Cargando</span>
    </div>
  );
}
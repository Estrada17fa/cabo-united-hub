import { Link, useLocation } from "react-router-dom";
import { Home, Users, Heart, ShoppingBag, Icon } from "lucide-react";
import { soccerBall } from "@lucide/lab";
import { cn } from "@/lib/utils";

const SoccerBallIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <Icon iconNode={soccerBall} {...props} />
);

const ITEMS = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Match Zone", path: "/zona-partido", icon: SoccerBallIcon },
  { name: "Tu Club", path: "/club", icon: Users },
  { name: "Fan Zone", path: "/fan-zone", icon: Heart },
  { name: "Tienda", path: "/tienda", icon: ShoppingBag },
];

/** Bottom nav tipo app: iconos + label, activo en cyan. */
export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-background/95 backdrop-blur-md lg:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {ITEMS.map((it) => {
          const active =
            it.path === "/" ? pathname === "/" : pathname.startsWith(it.path);
          const ItemIcon = it.icon;
          return (
            <li key={it.path} className="flex-1">
              <Link
                to={it.path}
                onClick={() => window.scrollTo(0, 0)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-2 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <ItemIcon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    active ? "font-semibold" : "font-medium"
                  )}
                >
                  {it.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

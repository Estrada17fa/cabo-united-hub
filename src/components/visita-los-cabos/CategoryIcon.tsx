import { MapPin, icons, type LucideIcon } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

/** kebab-case ("shopping-bag") o PascalCase ("ShoppingBag") → componente Lucide. */
function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return MapPin;
  const registry = icons as unknown as Record<string, LucideIcon>;
  return registry[toPascalCase(name)] ?? registry[name] ?? MapPin;
}

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryIcon({ name, className, style }: CategoryIconProps) {
  const Icon = resolveIcon(name);
  return <Icon className={className} style={style} />;
}

/** SVG en texto para los pines de Mapbox (usa currentColor). */
export function categoryIconSvg(name: string, size = 14): string {
  const Icon = resolveIcon(name);
  try {
    return renderToStaticMarkup(
      createElement(Icon, {
        width: size,
        height: size,
        strokeWidth: 2,
      })
    );
  } catch {
    return "";
  }
}

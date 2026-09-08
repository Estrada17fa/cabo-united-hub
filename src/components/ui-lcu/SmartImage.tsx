import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { ImageSet } from "@/lib/imageSets";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  /** Juego responsivo (640/1024/1600) o una sola URL. */
  image: ImageSet | string;
  alt: string;
  /** true solo para la imagen principal visible al entrar. */
  priority?: boolean;
}

/**
 * Imagen con variantes responsivas, carga diferida y fondo de relleno
 * mientras baja (evita huecos y saltos). No cambia el diseño.
 */
export function SmartImage({
  image,
  alt,
  priority = false,
  sizes = "100vw",
  className,
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const src = typeof image === "string" ? image : image.src;
  const srcSet = typeof image === "string" ? undefined : image.srcSet;

  return (
    <img
      {...rest}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      onLoad={() => setLoaded(true)}
      className={cn(
        "bg-surface-2 transition-opacity duration-500",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}

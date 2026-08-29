import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { ShopBanner } from "@/hooks/useShopContent";

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

/** Franja promocional editorial: imagen o color plano, un solo CTA. */
export function PromoBanner({ banner }: { banner: ShopBanner }) {
  const hasImage = !!banner.image_url;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-hairline"
      style={{ background: hasImage ? undefined : banner.bg_color ?? "hsl(var(--surface-1))" }}
    >
      {hasImage && (
        <>
          <img
            src={banner.image_url!}
            alt={banner.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        </>
      )}

      <div className="relative flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold tracking-tight text-white md:text-lg">
            {banner.title}
          </h3>
          {banner.body && (
            <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-white/70 md:text-[13px]">
              {banner.body}
            </p>
          )}
        </div>

        {banner.cta_label && banner.cta_url && (
          <div className="shrink-0">
            {isExternal(banner.cta_url) ? (
              <a
                href={banner.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 px-4 py-2 text-[12px] font-bold text-white transition-colors hover:border-primary hover:text-primary"
              >
                {banner.cta_label} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            ) : (
              <Link
                to={banner.cta_url}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 px-4 py-2 text-[12px] font-bold text-white transition-colors hover:border-primary hover:text-primary"
              >
                {banner.cta_label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

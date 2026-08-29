import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Facebook, Instagram, Users } from "lucide-react";
import { useFanPosts, type FanPost } from "@/hooks/useClub";

function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const NETWORKS: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  facebook: { label: "Facebook", Icon: Facebook },
  instagram: { label: "Instagram", Icon: Instagram },
  x: { label: "X", Icon: XLogo },
};

function Post({ post }: { post: FanPost }) {
  const meta = NETWORKS[post.network] ?? { label: post.network, Icon: Users };
  const Icon = meta.Icon;
  const body = (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-hairline bg-surface-3 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2 text-secondary-fg">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{post.author}</p>
          {post.handle && (
            <p className="truncate text-[10px] text-muted-foreground">{post.handle}</p>
          )}
        </div>
      </div>

      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.author}
          loading="lazy"
          className="h-32 w-full rounded-lg border border-hairline object-cover"
        />
      )}

      <p className="flex-1 text-sm leading-relaxed text-secondary-fg">
        {post.text.split(/(#[\wáéíóúñ]+)/gi).map((part, i) =>
          part.startsWith("#") ? (
            <span key={i} className="font-semibold text-primary">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>

      <p className="border-t border-hairline pt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        vía {meta.label}
      </p>
    </div>
  );

  return post.link_url ? (
    <a href={post.link_url} target="_blank" rel="noreferrer" className="block h-full">
      {body}
    </a>
  ) : (
    body
  );
}

/** Afición: posts curados manualmente desde el panel. */
export function FanWall({ className = "" }: { className?: string }) {
  const { data: posts = [] } = useFanPosts();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % posts.length), 5000);
    return () => clearInterval(id);
  }, [posts.length]);

  const current = posts[Math.min(index, Math.max(posts.length - 1, 0))];

  return (
    <section className={`rounded-2xl border border-hairline bg-surface-1 p-4 md:p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          La afición
        </p>
        <span className="text-[10px] font-semibold tracking-wider text-secondary-fg">
          #AmosDelParaíso
        </span>
      </div>

      {posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aquí vivirán las voces de la afición.
        </p>
      ) : (
        <>
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                <Post post={current} />
              </motion.div>
            </AnimatePresence>
          </div>

          {posts.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {posts.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Post ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === index ? "w-4 bg-primary" : "w-1.5 bg-white/15"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

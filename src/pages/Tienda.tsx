import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { ProductCard } from "@/components/tienda/ProductCard";
import { AnimatedSection } from "@/components/tienda/AnimatedSection";
import { useShopifyProducts } from "@/hooks/useShopify";
import { Skeleton } from "@/components/ui/skeleton";

const Tienda = () => {
  const { data: products, isLoading, error } = useShopifyProducts({ first: 50 });
  const featured = products?.[0];
  const grid = products ?? [];

  return (
    <div className="pb-16">
      <ShopHeader />

      {/* HERO */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto pt-6 md:pt-12 pb-12 md:pb-20"
        >
          <p className="text-label text-primary mb-4">Mercancía oficial</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6">
            Lleva al
            <br />
            <span className="gradient-text">Cabos United</span>
            <br />
            contigo.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Jerseys, accesorios y piezas de colección. Hechos para el fan.
          </p>
          {featured && (
            <Link
              to={`/tienda/producto/${featured.node.handle}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all hover:gap-3"
            >
              Comprar ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>

        {/* Featured product hero */}
        {featured && (
          <AnimatedSection delay={0.1}>
            <Link
              to={`/tienda/producto/${featured.node.handle}`}
              className="group block relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-card border border-border mb-16 md:mb-24"
            >
              {featured.node.images.edges[0] && (
                <img
                  src={featured.node.images.edges[0].node.url}
                  alt={featured.node.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                <p className="text-label text-primary mb-2">Destacado</p>
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{featured.node.title}</h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-md line-clamp-2">
                  {featured.node.description}
                </p>
              </div>
            </Link>
          </AnimatedSection>
        )}
      </section>

      {/* GRID */}
      <section className="mb-20">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <p className="text-label text-muted-foreground mb-2">Catálogo</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Toda la tienda</h2>
            </div>
          </div>
        </AnimatedSection>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-muted-foreground">
            No pudimos cargar la tienda. Intenta más tarde.
          </div>
        )}

        {!isLoading && grid.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">
              Aún no hay productos en la tienda.
            </p>
          </div>
        )}

        {grid.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {grid.map((p, i) => (
              <ProductCard key={p.node.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* BENEFITS */}
      <AnimatedSection>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {[
            {
              icon: Truck,
              title: "Envío a todo México",
              desc: "Recibe tu pedido en pocos días.",
            },
            {
              icon: ShieldCheck,
              title: "100% oficial",
              desc: "Mercancía autorizada del club.",
            },
            {
              icon: Sparkles,
              title: "Ediciones limitadas",
              desc: "Piezas únicas para verdaderos fans.",
            },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bento-card flex items-start gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </section>
      </AnimatedSection>
    </div>
  );
};

export default Tienda;
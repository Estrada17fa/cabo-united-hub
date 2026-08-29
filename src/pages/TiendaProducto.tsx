import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { ShopHeader } from "@/components/tienda/ShopHeader";
import { useShopifyProduct } from "@/hooks/useShopify";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyVariant } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TiendaProducto = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useShopifyProduct(handle);
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoadingCart = useCartStore((s) => s.isLoading);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (product?.options?.length) {
      const initial: Record<string, string> = {};
      product.options.forEach((opt) => {
        if (opt.values[0]) initial[opt.name] = opt.values[0];
      });
      setSelectedOptions(initial);
      setActiveImage(0);
      setQuantity(1);
    }
  }, [product?.id]);

  const matchingVariant: ShopifyVariant | undefined = useMemo(() => {
    if (!product) return undefined;
    return product.variants.edges.find((edge) =>
      edge.node.selectedOptions.every((o) => selectedOptions[o.name] === o.value),
    )?.node;
  }, [product, selectedOptions]);

  const images = product?.images.edges ?? [];
  const currentImage = images[activeImage]?.node ?? images[0]?.node;

  const handleAdd = async () => {
    if (!product || !matchingVariant) return;
    await addItem({
      product: { node: product },
      variantId: matchingVariant.id,
      variantTitle: matchingVariant.title,
      price: matchingVariant.price,
      quantity,
      selectedOptions: matchingVariant.selectedOptions,
    });
    setJustAdded(true);
    setOpen(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  if (isLoading) {
    return (
      <div>
        <ShopHeader />
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <ShopHeader />
        <div className="text-center py-24">
          <p className="text-lg font-normal mb-2">Producto no disponible</p>
          <Button variant="outline" onClick={() => navigate("/tienda")}>
            Volver a la tienda
          </Button>
        </div>
      </div>
    );
  }

  const price = matchingVariant?.price ?? product.priceRange.minVariantPrice;
  const available = matchingVariant?.availableForSale ?? false;

  return (
    <div className="pb-16">
      <ShopHeader />

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
        {/* Gallery */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square w-full rounded-3xl overflow-hidden bg-card border border-border"
          >
            <AnimatePresence mode="wait">
              {currentImage && (
                <motion.img
                  key={currentImage.url}
                  src={currentImage.url}
                  alt={currentImage.altText ?? product.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </AnimatePresence>
          </motion.div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {images.map((img, i) => (
                <button
                  key={img.node.url}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${
                    i === activeImage
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.node.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="md:pt-4"
        >
          {product.vendor && (
            <p className="text-label text-primary mb-3">{product.vendor}</p>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {product.title}
          </h1>
          <p className="text-2xl font-semibold mb-6">
            {formatPrice(price.amount, price.currencyCode)}
          </p>

          {product.description && (
            <p className="text-sm md:text-base text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Options */}
          {product.options
            .filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"))
            .map((option) => (
              <div key={option.name} className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {option.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isSelected = selectedOptions[option.name] === value;
                    return (
                      <button
                        key={value}
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))
                        }
                        className={`px-4 py-2 rounded-full text-sm font-normal transition-all border ${
                          isSelected
                            ? "bg-foreground text-background border-foreground"
                            : "bg-card text-foreground border-border hover:border-foreground/40"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Cantidad
            </p>
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Disminuir cantidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            onClick={handleAdd}
            disabled={!available || isLoadingCart}
            className="w-full md:w-auto md:min-w-[280px] rounded-full font-semibold h-12 px-8"
          >
            {isLoadingCart ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : justAdded ? (
              <>
                <Check className="w-4 h-4" /> Agregado
              </>
            ) : !available ? (
              "Agotado"
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Agregar al carrito
              </>
            )}
          </Button>

          {/* Accordion */}
          <Accordion type="single" collapsible className="mt-10 border-t border-border">
            <AccordionItem value="desc" className="border-border">
              <AccordionTrigger className="text-sm font-semibold">
                Descripción
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {product.description || "Producto oficial Los Cabos United."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ship" className="border-border">
              <AccordionTrigger className="text-sm font-semibold">
                Envíos y devoluciones
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Envíos a todo México en 3-7 días hábiles. Cambios y devoluciones dentro de
                los primeros 7 días de recibido el producto.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
};

export default TiendaProducto;
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { EmptyRow, Hint, SectionTitle, adminCard } from "@/components/admin/AdminUI";
import { StoreLineTile } from "@/components/tienda/StoreLineTiles";
import { useProducts } from "@/hooks/useProducts";
import { useStoreLineCovers } from "@/hooks/useShopContent";
import { STORE_LINE_LABELS, type StoreLine } from "@/lib/store-types";
import { STORE_MEDIA_BUCKET, STORE_MEDIA_FOLDER } from "@/lib/store-media";

const ORDER: StoreLine[] = ["oficial", "streetwear", "otros"];

export default function LineCovers() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useProducts();
  const { data: covers } = useStoreLineCovers();
  const all = products ?? [];
  const lines = ORDER.filter((l) => all.some((p) => p.line === l));

  const save = async (line: string, url: string | null) => {
    const { error } = url
      ? await supabase.from("store_line_covers").upsert({ line, image_url: url, updated_at: new Date().toISOString() })
      : await supabase.from("store_line_covers").delete().eq("line", line);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    toast.success(url ? "Portada guardada" : "Portada quitada");
    qc.invalidateQueries({ queryKey: ["store_line_covers"] });
  };

  return (
    <div className={adminCard}>
      <SectionTitle title="Portadas de línea" />
      <Hint className="mb-3">
        Foto horizontal (mínimo 1200 px de ancho). Sin portada, se usa la primera foto del primer
        producto de esa línea. La vista previa tiene el tamaño real del tile.
      </Hint>
      {isLoading ? (
        <EmptyRow text="Cargando catálogo…" />
      ) : !lines.length ? (
        <EmptyRow text="El catálogo no tiene líneas todavía." />
      ) : (
        <ul className="space-y-4">
          {lines.map((line) => {
            const custom = covers?.[line] ?? null;
            const fallback = all.find((p) => p.line === line && p.images[0])?.images[0];
            return (
              <li key={line} className="grid gap-3 border-b border-hairline pb-4 last:border-0 md:grid-cols-[1fr_260px]">
                <ImageUploadField
                  label={STORE_LINE_LABELS[line]}
                  value={custom}
                  onChange={(url) => save(line, url)}
                  folder={STORE_MEDIA_FOLDER as "tienda"}
                  bucket={STORE_MEDIA_BUCKET}
                  hint={custom ? "Portada propia" : "Usando foto del catálogo"}
                />
                <div className="pointer-events-none max-w-[260px]">
                  <StoreLineTile label={STORE_LINE_LABELS[line]} cover={custom ?? fallback} active />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

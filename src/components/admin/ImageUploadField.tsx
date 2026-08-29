import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminLabel } from "./AdminUI";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

interface Props {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** Carpeta dentro del bucket público */
  folder: "teams" | "tournaments" | "players" | "places" | "place-logos";
  hint?: string;
}

/** Subida de imagen (PNG/JPG/WEBP/SVG, máx 2 MB) con vista previa. Sin URLs manuales. */
export function ImageUploadField({ label, value, onChange, folder, hint }: Props) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!TYPES.includes(file.type)) return toast.error("Formato no válido. Usa PNG, JPG, WEBP o SVG.");
    if (file.size > MAX_BYTES) return toast.error("La imagen debe pesar menos de 2 MB.");

    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });
    setBusy(false);
    if (error) return toast.error("No se pudo subir la imagen", { description: error.message });

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    onChange(data.publicUrl);
    toast.success("Imagen subida");
  };

  return (
    <div>
      <span className={adminLabel}>{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-surface-2">
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-contain p-1.5" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {value ? "Reemplazar" : "Subir imagen"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Quitar
            </button>
          )}
          {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
        </div>
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) upload(f);
        }}
      />
    </div>
  );
}

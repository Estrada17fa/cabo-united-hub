import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type Country = { code: string; name: string; dial: string; flag: string };

export const COUNTRIES: Country[] = [
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { code: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", dial: "+1", flag: "🇨🇦" },
  { code: "ES", name: "España", dial: "+34", flag: "🇪🇸" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "PE", name: "Perú", dial: "+51", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { code: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", dial: "+595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { code: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", dial: "+507", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", dial: "+502", flag: "🇬🇹" },
  { code: "SV", name: "El Salvador", dial: "+503", flag: "🇸🇻" },
  { code: "HN", name: "Honduras", dial: "+504", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", dial: "+505", flag: "🇳🇮" },
  { code: "CU", name: "Cuba", dial: "+53", flag: "🇨🇺" },
  { code: "DO", name: "República Dominicana", dial: "+1", flag: "🇩🇴" },
  { code: "PR", name: "Puerto Rico", dial: "+1", flag: "🇵🇷" },
  { code: "GB", name: "Reino Unido", dial: "+44", flag: "🇬🇧" },
  { code: "FR", name: "Francia", dial: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", dial: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italia", dial: "+39", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "NL", name: "Países Bajos", dial: "+31", flag: "🇳🇱" },
  { code: "JP", name: "Japón", dial: "+81", flag: "🇯🇵" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
];

/** Devuelve el teléfono en formato E.164, p.ej. +5216241234567 */
export function toE164(dial: string, national: string) {
  const digits = national.replace(/\D/g, "");
  return `${dial}${digits}`;
}

export function PhoneCountryInput({
  country,
  onCountryChange,
  value,
  onChange,
  accent,
}: {
  country: Country;
  onCountryChange: (c: Country) => void;
  value: string;
  onChange: (v: string) => void;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 h-10 px-2.5 rounded-md border border-input bg-background text-sm shrink-0"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-xs font-semibold text-foreground">{country.dial}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <Input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s()-]/g, ""))}
          placeholder="624 123 4567"
          maxLength={18}
        />
      </div>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          style={{ boxShadow: `0 20px 50px -20px ${accent}55` }}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar país…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {list.map((c) => (
              <button
                key={`${c.code}-${c.dial}`}
                type="button"
                onClick={() => {
                  onCountryChange(c);
                  setOpen(false);
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="flex-1 truncate text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.dial}</span>
              </button>
            ))}
            {list.length === 0 && (
              <div className="px-3 py-4 text-xs text-muted-foreground">Sin resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

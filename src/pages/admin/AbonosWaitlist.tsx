import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv, toCsv } from "@/lib/csv";

interface PassRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  tier: string;
  status: string;
  payment_status: string;
  birth_date: string | null;
  pass_code: string | null;
  marketing_consent: boolean;
  created_at: string;
}

const TIERS = ["fan", "gold", "premium", "platino"];
const STATUSES = ["waitlist", "pending_payment", "active"];
const TIER_LABEL: Record<string, string> = {
  fan: "Fan",
  gold: "Gold",
  premium: "Premium",
  platino: "Platino",
};
const STATUS_LABEL: Record<string, string> = {
  waitlist: "Lista de espera",
  pending_payment: "Pago pendiente",
  active: "Activo",
};

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" }) : "—";

export default function AbonosWaitlist() {
  const [rows, setRows] = useState<PassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.rpc("admin_list_fan_passes").then(({ data, error }) => {
      if (error) toast.error("No se pudo cargar la lista", { description: error.message });
      setRows(((data ?? []) as any[]).filter((r) => STATUSES.includes(r.status)) as PassRow[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (tier === "all" || r.tier === tier) &&
        (status === "all" || r.status === status) &&
        (!q ||
          r.full_name?.toLowerCase().includes(q) ||
          (r.email ?? "").toLowerCase().includes(q)),
    );
  }, [rows, tier, status, query]);

  const exportCsv = () => {
    const csv = toCsv(
      [
        "Nombre completo",
        "Correo",
        "Teléfono",
        "Nivel",
        "Estado",
        "Pago",
        "Fecha de nacimiento",
        "Fecha de registro",
        "Marketing",
        "Código de pase",
      ],
      filtered.map((r) => [
        r.full_name,
        r.email ?? "",
        r.phone ?? "",
        TIER_LABEL[r.tier] ?? r.tier,
        STATUS_LABEL[r.status] ?? r.status,
        r.payment_status,
        r.birth_date ?? "",
        new Date(r.created_at).toISOString(),
        r.marketing_consent ? "Sí" : "No",
        r.pass_code ?? "",
      ]),
    );
    downloadCsv(`abonos-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const Chip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
        active
          ? "bg-brand-primary text-background"
          : "bg-white/5 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Lista de espera de abonos
          </h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {filtered.length} de {rows.length} registros
          </p>
        </div>
        <Button onClick={exportCsv} disabled={filtered.length === 0} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={tier === "all"} onClick={() => setTier("all")}>
            Todos los niveles
          </Chip>
          {TIERS.map((t) => (
            <Chip key={t} active={tier === t} onClick={() => setTier(t)}>
              {TIER_LABEL[t]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={status === "all"} onClick={() => setStatus("all")}>
            Todos los estados
          </Chip>
          {STATUSES.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {STATUS_LABEL[s]}
            </Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-muted-foreground">
          No hay registros que coincidan con los filtros.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {[
                  "Nombre",
                  "Correo",
                  "Teléfono",
                  "Nivel",
                  "Estado",
                  "Nacimiento",
                  "Registro",
                  "Marketing",
                ].map((h) => (
                  <th key={h} className="py-2 pr-4 font-bold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border text-[13px]">
                  <td className="py-2.5 pr-4 font-bold text-foreground whitespace-nowrap">
                    {r.full_name}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                    {r.email ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                    {r.phone ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                      {TIER_LABEL[r.tier] ?? r.tier}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                    {fmtDate(r.birth_date)}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                    {fmtDate(r.created_at)}
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    {r.marketing_consent ? "Sí" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { upsertMatch, deleteMatch, scrapeResults, type Match } from "@/hooks/useMatches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Edit, X } from "lucide-react";

interface AdminMatchFormProps {
  matches: Match[];
}

export function AdminMatchForm({ matches }: AdminMatchFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResults_, setScrapeResults] = useState<any[] | null>(null);

  const [form, setForm] = useState({
    home_team: "Los Cabos United",
    away_team: "",
    home_score: 0,
    away_score: 0,
    match_date: "",
    match_time: "",
    venue: "",
    jornada: 1,
    season: "2024-2025",
    status: "scheduled" as "scheduled" | "live" | "finished",
    is_home_game: true,
  });

  if (!user) return null;

  const resetForm = () => {
    setForm({
      home_team: "Los Cabos United",
      away_team: "",
      home_score: 0,
      away_score: 0,
      match_date: "",
      match_time: "",
      venue: "",
      jornada: 1,
      season: "2024-2025",
      status: "scheduled" as "scheduled" | "live" | "finished",
      is_home_game: true,
    });
    setEditing(null);
  };

  const handleEdit = (m: Match) => {
    setForm({
      home_team: m.home_team,
      away_team: m.away_team,
      home_score: m.home_score,
      away_score: m.away_score,
      match_date: m.match_date,
      match_time: m.match_time || "",
      venue: m.venue || "",
      jornada: m.jornada || 1,
      season: m.season,
      status: m.status,
      is_home_game: m.is_home_game,
    });
    setEditing(m);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertMatch({
        ...(editing ? { id: editing.id } : {}),
        ...form,
        match_time: form.match_time || null,
        venue: form.venue || null,
      });
      toast({ title: editing ? "Partido actualizado" : "Partido agregado" });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["next-match"] });
      queryClient.invalidateQueries({ queryKey: ["recent-results"] });
      resetForm();
      setIsOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMatch(id);
      toast({ title: "Partido eliminado" });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const result = await scrapeResults();
      setScrapeResults(result.data || []);
      toast({ title: "Búsqueda completada", description: `${result.data?.length || 0} resultados encontrados` });
    } catch (err: any) {
      toast({ title: "Error al buscar", description: err.message, variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Panel Admin</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleScrape} disabled={scraping}>
            <Search className="w-3 h-3 mr-1" />
            {scraping ? "Buscando..." : "Buscar en Google"}
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsOpen(!isOpen); }}>
            {isOpen ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
            {isOpen ? "Cerrar" : "Agregar"}
          </Button>
        </div>
      </div>

      {scrapeResults_ && (
        <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50 max-h-40 overflow-y-auto">
          <p className="text-xs font-medium mb-2">Resultados de Google ({scrapeResults_.length}):</p>
          {scrapeResults_.map((r: any, i: number) => (
            <div key={i} className="text-xs text-muted-foreground mb-1">
              <a href={r.url} target="_blank" rel="noopener" className="text-primary hover:underline">{r.title}</a>
              <p className="truncate">{r.description}</p>
            </div>
          ))}
          <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => setScrapeResults(null)}>
            Cerrar resultados
          </Button>
        </div>
      )}

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Local" value={form.home_team} onChange={(e) => setForm({ ...form, home_team: e.target.value })} required />
            <Input placeholder="Visitante" value={form.away_team} onChange={(e) => setForm({ ...form, away_team: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Goles local" value={form.home_score} onChange={(e) => setForm({ ...form, home_score: +e.target.value })} min={0} />
            <Input type="number" placeholder="Goles visitante" value={form.away_score} onChange={(e) => setForm({ ...form, away_score: +e.target.value })} min={0} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} required />
            <Input type="time" value={form.match_time} onChange={(e) => setForm({ ...form, match_time: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Estadio" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            <Input type="number" placeholder="Jornada" value={form.jornada} onChange={(e) => setForm({ ...form, jornada: +e.target.value })} min={1} />
            <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="live">En vivo</SelectItem>
                <SelectItem value="finished">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" className="w-full">
            {editing ? "Actualizar partido" : "Guardar partido"}
          </Button>
        </form>
      )}

      {matches.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {matches.slice(0, 10).map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2 rounded bg-muted/20 text-xs">
              <span>{m.home_team} {m.home_score}-{m.away_score} {m.away_team}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleEdit(m)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

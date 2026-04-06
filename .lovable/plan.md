

## Plan: Auto-actualizar tablas y partidos desde Google via Firecrawl

### Resumen
Crear un sistema que use Firecrawl (ya conectado) para buscar datos de la **Liga Premier de México** en Google, extraer tabla de posiciones y resultados de partidos de **Los Cabos United**, y guardarlos en la base de datos. El frontend leerá de la BD en vez de datos hardcoded.

### Arquitectura

```text
┌──────────────────────┐
│ Edge Function        │
│ scrape-league-data   │
│  1. Firecrawl search │
│  2. AI parse (Gemini)│
│  3. Upsert to DB     │
└──────────┬───────────┘
           │
    ┌──────▼──────┐
    │  Nuevas     │
    │  tablas BD  │
    │  standings  │
    │  top_scorers│
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │  Frontend   │
    │  Lee de BD  │
    └─────────────┘
```

### Paso 1: Crear tablas de standings y top scorers

**`league_standings`**: `id`, `team`, `pos`, `jj`, `jg`, `je`, `jp`, `gf`, `gc`, `dg`, `pts`, `group` (nullable, para grupos), `season`, `updated_at`

**`top_scorers`**: `id`, `player_name`, `team`, `goals`, `season`, `updated_at`

RLS: lectura publica. Escritura solo via service role (edge function).

### Paso 2: Edge function `scrape-league-data`

1. Usa Firecrawl search para buscar: `"Liga Premier de México tabla de posiciones"` y `"Los Cabos United resultados Liga Premier"`
2. Extrae el markdown de los resultados
3. Envía el markdown a Lovable AI (Gemini Flash) con un prompt estructurado que pida JSON con formato `{ standings: [...], matches: [...], topScorers: [...] }`
4. Parsea el JSON y hace upsert en las tablas `league_standings`, `top_scorers`, y `matches`
5. Usa Supabase service role key para escribir

### Paso 3: Actualizar frontend

- **`LeagueTables.tsx`**: reemplazar datos hardcoded por queries a `league_standings` y `top_scorers` con `useQuery`
- Tabla General: `where group is null` o todos los registros
- Grupos: `where group = '1'`, etc.
- Goleo: query a `top_scorers`
- Mostrar skeleton mientras carga
- Mantener resaltado cian para "Los Cabos United"

### Paso 4: Botón manual + cron opcional

- En la UI agregar un botón discreto "Actualizar datos" que invoque la edge function (protegido, solo admin)
- Opcionalmente configurar cron job para ejecutar cada 6-12 horas automáticamente

### Detalle tecnico

- Firecrawl ya está conectado (FIRECRAWL_API_KEY disponible)
- Se usa Gemini Flash (via Lovable AI) dentro de la edge function para parsear el contenido scrapeado a JSON estructurado, ya que los datos de Google vienen en formatos inconsistentes
- La edge function hace todo el procesamiento server-side; el frontend solo lee de la BD


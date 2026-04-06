

## Plan: Match Zone - Sistema de datos de partidos (Manual + Scraping)

### Resumen
Crear un sistema completo para la página Match Zone que combine ingreso manual de resultados con scraping automático de Google como respaldo, usando Firecrawl para extraer datos de partidos de tercera division.

### Arquitectura

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Panel Admin    │────>│  Base de datos   │<────│  Firecrawl  │
│  (manual entry) │     │  (matches table) │     │  (scraping) │
└─────────────────┘     └──────┬───────────┘     └─────────────┘
                               │
                        ┌──────▼───────────┐
                        │  Match Zone UI   │
                        │  (público)       │
                        └──────────────────┘
```

### Paso 1: Crear tablas en la base de datos

**Tabla `matches`** - almacena todos los partidos:
- `id`, `season` (temporada), `jornada` (matchday number)
- `home_team`, `away_team`
- `home_score`, `away_score`
- `match_date`, `match_time`, `venue`
- `status` (scheduled / live / finished)
- `is_home_game` (si el equipo del club es local)
- `source` (manual / scraped) para saber de donde viene el dato
- `created_at`, `updated_at`

**Tabla `match_events`** - eventos minuto a minuto (goles, tarjetas, etc.):
- `id`, `match_id` (FK), `minute`, `event_type` (goal/yellow/red/substitution)
- `player_name`, `description`

RLS: lectura publica para ambas tablas, escritura solo para admins (via edge function protegida).

### Paso 2: Conectar Firecrawl

- Usar el conector de Firecrawl para scraping
- Crear edge function `scrape-match-results` que:
  1. Busque en Google "resultados [nombre del equipo] tercera division mexico"
  2. Use Firecrawl search/scrape para extraer los datos
  3. Parse los resultados y los inserte en la tabla `matches` con `source = 'scraped'`
- Se puede invocar manualmente desde el admin o programar con cron

### Paso 3: Panel Admin (ingreso manual)

- Componente protegido para usuarios con rol admin
- Formulario para agregar/editar partidos: equipos, marcador, fecha, jornada
- Formulario para agregar eventos del partido (goles, tarjetas)
- Botón "Buscar en Google" que invoca el scraping como respaldo

### Paso 4: UI publica de Match Zone

- **Próximo partido**: cuenta regresiva al siguiente partido programado
- **Resultados recientes**: lista de últimos partidos con marcador
- **Tabla de posiciones**: clasificación de la liga (editable desde admin)
- **Calendario**: vista por jornada con todos los partidos

### Detalle tecnico

- Firecrawl se usa via edge function (no en el frontend)
- Los datos scrapeados se guardan en la BD, nunca se muestran directamente
- El admin siempre puede corregir datos scrapeados
- La página publica lee solo de la base de datos

### Orden de implementacion
1. Crear tablas y RLS
2. Conectar Firecrawl
3. Edge function de scraping
4. Panel admin con formularios
5. UI publica de Match Zone


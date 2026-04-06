

## Plan: Match Zone — Interfaz Premium de Modo Previa

Reemplazar la página placeholder `ZonaPartido.tsx` con una interfaz completa y animada que lee datos de la tabla `matches` existente y presenta la experiencia descrita.

### Estructura de archivos

1. **`src/pages/ZonaPartido.tsx`** — Página principal, orquesta las secciones
2. **`src/components/match-zone/MatchHeroCard.tsx`** — Tarjeta hero con logos, countdown y detalles
3. **`src/components/match-zone/MatchTabs.tsx`** — Navegación por texto con subrayado cian (Próximos Partidos / Tablas de la Liga)
4. **`src/components/match-zone/UpcomingMatches.tsx`** — Lista de próximos partidos desde la BD
5. **`src/components/match-zone/LeagueTables.tsx`** — Sub-navegación (Tabla General, Grupos, Goleo) con contenido dinámico
6. **`src/components/match-zone/StandingsTable.tsx`** — Tabla minimalista reutilizable con resaltado cian para LCU
7. **`src/components/match-zone/CountdownTimer.tsx`** — Contador digital animado (días:horas:min)

### Sección Hero (MatchHeroCard)

- Tarjeta con fondo `#1f1f1f`, borde sutil, y resplandor cian mesh gradient detrás (via CSS radial-gradient)
- Logos grandes de LCU (izq) y rival (der) — placeholder con Shield icon hasta tener logos reales
- `CountdownTimer` gigante al centro con fuente sans-serif gruesa, animado con `useEffect` cada segundo
- Debajo: nombre del estadio, ciudad, fecha/hora en texto blanco bold
- Botón FAB "COMPRAR BOLETOS" con bg cian saturado, sombra glow
- Datos del próximo partido se leen de `matches` donde `status = 'scheduled'` ordenados por `match_date ASC LIMIT 1`

### Navegación por texto (MatchTabs)

- Dos labels: "Próximos Partidos" y "Tablas de la Liga"
- Texto blanco limpio, sin botones rectangulares
- Tab activo con underline cian sólido animado con `motion.div layoutId="underline"`
- Al seleccionar "Tablas de la Liga", aparece segunda fila animada con sub-tabs: Tabla General, Grupo 1-3, Líderes de Goleo

### Contenido dinámico

- Cambios de sección con `AnimatePresence` + fade/slide
- **Próximos Partidos**: query a `matches` con `status = 'scheduled'`, cards minimalistas
- **Tablas de la Liga**: datos estáticos por ahora (hardcoded) ya que no hay tabla de standings en la BD — con nota de que se puede migrar después
- **Resaltado LCU**: fila con barra lateral cian y fondo cian/10 cuando `team === "Los Cabos United"`

### Tablas minimalistas

- Sin bordes pesados, texto sobre fondo oscuro
- Encabezados: JJ, DG, PTS, etc.
- Tipografía Poppins bold (ya configurada en el proyecto)

### Datos

- Lee de la tabla `matches` existente via Supabase client
- Si no hay datos, muestra estado vacío elegante
- Las tablas de posiciones serán datos placeholder hardcoded por ahora (se conectarán a BD en siguiente iteración)

### Animaciones

- `framer-motion` para todas las transiciones entre tabs y aparición de contenido
- Countdown con transición numérica suave
- Tarjeta hero con entrada `initial={{ opacity: 0, y: 20 }}`


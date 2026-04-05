

## Plan: Crear la página MATCH ZONE completa

### Visión general
Transformar la página placeholder en una experiencia inmersiva estilo app deportiva (como FotMob/OneFootball) con dos modos: **Modo Previo** y **Modo Día de Partido**. Toda la data será mock/hardcoded inicialmente, lista para conectar a backend después.

### Arquitectura de archivos

```text
src/pages/ZonaPartido.tsx          -- Página principal (orquesta modos)
src/components/matchzone/
  ├── MatchHero.tsx                -- Card grande del próximo partido + countdown
  ├── HeadToHead.tsx               -- Frente a frente estadístico
  ├── StandingsModule.tsx          -- Tablas con tabs (general, grupo 1/2/3, goleo)
  ├── RecentAndUpcoming.tsx        -- Últimos 3 resultados + próximos 3 partidos
  ├── LiveScoreboard.tsx           -- Marcador en vivo (modo día de partido)
  ├── MinuteByMinute.tsx           -- Timeline de goles
  ├── InteractiveLineup.tsx        -- Cancha gráfica con formación
  ├── LiveStreamButton.tsx         -- Botón flotante "Ver en vivo"
  ├── mockData.ts                  -- Datos mock centralizados
```

### Modo Previo (default)

**1. MatchHero — Card del próximo partido**
- Card grande con gradiente sutil, logos de ambos equipos (placeholders con iniciales), nombre de equipos
- Countdown animado (días, horas, minutos, segundos) con dígitos estilo flip/bento
- Fecha, hora local del usuario (usando `Intl.DateTimeFormat` con `timeZone` del browser), sede con estadio y dirección
- Animación de entrada con stagger

**2. HeadToHead — Frente a Frente**
- Comparativo visual con barras: goles, posesión, victorias
- Últimos enfrentamientos (mini lista con resultados)
- Forma reciente: 5 badges circulares G/E/P con colores (verde/amarillo/rojo)
- Posición en la tabla de cada equipo

**3. StandingsModule — Módulos Bento con Tabs**
- Tabs horizontales: General | Grupo 1 | Grupo 2 | Grupo 3 | Goleo
- Tabla con fila de LCU resaltada con borde primary
- Tabla de goleo con jugador, equipo, goles
- Diseño compacto tipo bento card

**4. RecentAndUpcoming — Últimos y próximos**
- Grid de 2 columnas: izquierda = últimos 3 resultados, derecha = próximos 3 partidos
- Cards pequeñas con logos, marcador/fecha, resultado (W/D/L badge)

### Modo Día de Partido

**5. LiveScoreboard — Centro de Mando**
- El countdown se reemplaza por marcador grande con tiempo corriendo (ej. 45'+2)
- Indicador "LIVE" pulsante en rojo
- Minuto a minuto debajo: timeline vertical con iconos de gol (balón), solo goles

**6. InteractiveLineup — Alineación**
- Cancha SVG/CSS con gradiente verde
- Jugadores posicionados según formación (4-3-3, etc.)
- Al tocar un jugador: modal/sheet con stats del torneo (goles, asistencias, minutos, tarjetas)

**7. LiveStreamButton — Transmisión**
- Botón flotante fixed en la esquina inferior derecha (encima del nav)
- Gradiente primary con icono de play, pulso animado
- Link configurable a la transmisión

### Organización del scroll (evitar scroll infinito)

- **Modo Previo**: MatchHero ocupa la primera vista completa. Debajo, HeadToHead y RecentAndUpcoming en grid bento. StandingsModule al final con tabs para no ocupar tanto espacio vertical.
- **Modo Partido**: LiveScoreboard arriba, MinuteByMinute y Lineup en tabs debajo para mantener todo compacto.
- Toggle para cambiar entre modos (dev/demo) con un switch discreto en la parte superior

### Estilo visual
- Colores LCU (azul #00abc4, rosa #f298c0) para elementos principales
- Verde para victorias, rojo para derrotas, amarillo para empates
- Cards con `bento-card` y `bento-card-sm` existentes
- Animaciones framer-motion: stagger en entrada, fade-in por sección
- Tipografía del sistema existente (text-display, text-headline, etc.)

### Datos mock
- Partido: LCU vs Dorados de Sinaloa, fecha futura configurable
- Tabla de posiciones con 12 equipos ficticios
- 5 últimos partidos con resultados variados
- Alineación 4-3-3 con 11 jugadores mock
- Stats de jugadores mock

### Detalle técnico
- `useState` para toggle entre modos (previo/live) — permite demo
- Countdown con `useEffect` + `setInterval`
- Hora local con `new Date().toLocaleTimeString()` usando timezone del navegador
- No se necesitan tablas de DB por ahora — todo mock
- Componentes separados para mantener el archivo principal limpio


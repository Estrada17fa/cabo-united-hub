# Match Zone: chips compactos, módulo Liga estilo app deportiva y login unificado

## 1. Chips superiores más compactos
- `MatchTabs`: mantener 2 columnas al 50% del ancho, bajar la altura (de `h-14` a ~`h-10`), texto e icono más pequeños y padding reducido. Se conserva la píldora animada y los tokens del tema.

## 2. Quitar "Visita Los Cabos" de Match Zone
- Eliminar el botón/enlace a `/conoce-los-cabos` en `MatchHeroCard` (dos apariciones: fila de acciones y bloque inferior) y en `LiveMatchPlayer`.
- Reacomodar la fila de acciones para que "Ver en vivo / Resumen" ocupe el ancho disponible sin huecos. La sección Conoce Los Cabos sigue existiendo en el resto del sitio.

## 3. Rediseño del módulo "Liga" (estilo app deportiva)
Reducir las pestañas de Liga a tres: **Partidos**, **Posiciones**, **Goleo** (se retiran "Nuestros Partidos", "Partidos de la Liga" por grupo y "Equipos"; se dejan de usar `LeagueMatchesByGroup` y `LeagueTeamsByGroup`).

### Partidos
- Un solo listado con **todos** los partidos de la liga, con subfiltros **Próximos** / **Resultados**.
- Agrupados por jornada, con encabezado de jornada tipo app deportiva.
- Cada fila: escudos y nombres de ambos equipos (usando `useTeamLogos` + `TeamCrest`), fecha y hora, sede (`venue`), y marcador cuando el partido terminó.
- Los partidos de Los Cabos United se resaltan (borde/fondo con el color primario y etiqueta).
- En los partidos de LCU **de local** (`is_home_game`) se muestra un enlace compacto "Comprar boletos" hacia la página de boletos; en los de visita no aparece.

### Posiciones
- Tabla de posiciones general (`StandingsTable`) con escudos, resaltando LCU. Se elimina el sub-tabulado por grupos.

### Goleo
- Tabla de goleadores actual, con escudo del equipo y resalte de jugadores de LCU.

Nota: el panel `/admin/match-zone` ya administra partidos, fases, marcadores y links; no cambia su alcance en este trabajo.

## 4. Inicio de sesión con opción de crear cuenta
- El modal que abre "Inicia sesión para ver el partido en vivo" (hoy `AuthFlow`, que solo registra) pasa a mostrar primero dos opciones claras: **Iniciar sesión** y **Crear cuenta**.
- "Iniciar sesión": correo + contraseña (más Google/Apple y recuperar contraseña), como el modal existente.
- "Crear cuenta": el mismo formulario de registro de 3 pasos que ya se usa en Mi Pase / Accesos (`AuthFlow`), que escribe en las mismas tablas de perfil y pase. No se crea un formulario alterno.
- Alcance del cambio: presentación y ruteo entre ambas vistas en `ZonaPartido`; sin tocar la lógica de registro ni el esquema.

## Detalles técnicos
- Archivos: `MatchTabs.tsx`, `MatchHeroCard.tsx`, `LiveMatchPlayer.tsx`, `LeagueTables.tsx`, nuevo `LeagueFixtures.tsx` (reemplaza el uso de `LeagueMatchesByGroup`), `StandingsTable.tsx` (sin cambios de API), `ZonaPartido.tsx`.
- Datos: se sigue leyendo `matches` (incluye `venue`, `is_home_game`, `jornada`, `phase`, marcadores), `league_standings`, `top_scorers` y `teams` para escudos.
- Solo tokens semánticos del tema (primary cian, superficies oscuras), tipografía Poppins, mobile-first.

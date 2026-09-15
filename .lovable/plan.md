# Boletos en Inicio

## Diagnóstico

- El orden actual de Inicio es: **Hero → Match Zone → Tu Club → Tienda → Visita Los Cabos → Fan Zone**.
- Match Zone ya muestra el partido destacado con `useFeaturedMatch()`, por lo que **Boletos encaja mejor inmediatamente después de Match Zone y antes de Tu Club**: continúa la intención natural de quien consulta el próximo partido sin separar ambos bloques.
- Inicio todavía no consulta la lista completa de partidos. La página `/boletos` sí usa `useMatches()`, filtra cuando LCU es local mediante `home_team.is_ours` y toma el enlace individual de `tickets_url`.
- El torneo activo tiene próximos partidos de local reales con rival, jornada, fecha y sede. Los primeros partidos consultados todavía tienen `tickets_url` vacío, así que el estado **“Próximamente”** será visible hasta que se capturen esos enlaces en el admin.
- Hay piezas reutilizables para mantener consistencia: `Crest`, `SectionHeader`, `formatKickoff` y las clases de botón `lcuButtonClasses`. La tarjeta completa de `/boletos` es interna de esa página, así que no se modificará esa página para esta tarea.

## Plan

### 1. Agregar el bloque en la ubicación recomendada

- Insertar `TicketsBlock` en Inicio, justo después de `MatchBlock` y antes de `ClubBlock`.
- Encabezado **“Boletos”** con CTA **“Ver todos los boletos”** hacia `/boletos`.

### 2. Usar los mismos partidos reales

- Consultar con `useMatches()`, que ya queda limitado al torneo activo mediante el flujo existente de `useActiveSeason()`.
- Filtrar únicamente partidos donde LCU sea local, excluir partidos finalizados/cancelados y ordenar por `kickoff_at` ascendente.
- Mostrar como máximo los **3 próximos partidos**; en móvil usar una lista/carrusel compacto y en escritorio una cuadrícula estable.

### 3. Tarjetas compactas de partido

- Mostrar escudo de LCU, escudo y nombre completo del rival, jornada, fecha/hora local y sede.
- Si existe `tickets_url`, mostrar **“Comprar boletos”** y abrir el enlace en una pestaña nueva con protección `noopener noreferrer`.
- Si falta el enlace, mostrar **“Próximamente”** como estado no interactivo.
- Mantener fondo, hairline, tipografía y cyan mediante los tokens y componentes actuales del sitio.

### 4. Estados de carga y vacío

- Durante la carga, reservar el mismo espacio con tarjetas esqueleto para evitar saltos.
- Si no hay próximos partidos de local, mostrar un estado compacto y cuidado con enlace a `/boletos`, sin dejar un hueco vacío.

## Alcance técnico

- Modificar únicamente `src/pages/Index.tsx`.
- No cambiar `/boletos`, la navegación, el admin ni la base de datos.
- No crear datos alternos ni repetir consultas directas: se reutiliza `useMatches()` y el campo `tickets_url` existente.

## Verificación

- Comprobar escritorio y móvil: orden de secciones, máximo de tres partidos, textos sin recortes y CTA sin solapamientos.
- Verificar tanto el estado actual “Próximamente” como un enlace de compra mediante datos controlados, confirmando que abre una pestaña nueva.
- Confirmar que `/boletos` sigue siendo el destino de “Ver todos los boletos” y que no cambió ninguna otra página.
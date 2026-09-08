# Diagnóstico medido: por qué la información tarda en aparecer

## Lo que medí (no supuesto)

**1. Las consultas en sí son rápidas.** Ejecutadas directamente contra la base:

| Consulta | Tiempo |
|---|---|
| Torneo activo | 6.9 ms |
| Partidos de la temporada (234 filas) | 19.0 ms |
| Tabla de posiciones + equipos | 7.6 ms |
| Plantel | 7.0 ms |
| Noticias | 6.8 ms |
| Lugares | 8.2 ms |
| Patrocinadores | 6.8 ms |

**2. Los índices NO son el problema.** Las tablas son diminutas: partidos 234 filas, plantel 30, equipos 18, posiciones 18, tipos de lugar 10, patrocinadores 3, noticias 1, lugares 1, afición 0, juvenil 1. Con estos tamaños la base ni usaría un índice aunque lo agregara; escanear 30 filas es instantáneo. Agregar índices aquí no daría velocidad medible.

**3. La base NO está suspendida ni en plan gratuito con "dormida".** Está en Lovable Cloud, instancia tamaño "Tiny", estado activo (no pausada). No hay suspensión por inactividad como en el free tier de Supabase; no es una decisión de plan lo que te está frenando. Subir de tamaño de instancia **no** arreglaría esto.

**4. La región SÍ está lejos: la base está en `eu-west-3` (París, Francia).** Tus usuarios están en Los Cabos. Cada ida y vuelta a París cuesta aproximadamente 150-250 ms *antes* de que la base haga su trabajo de 7 ms. Este es el costo dominante.

**5. La portada dispara ~10 peticiones separadas, y varias están encadenadas.** En `Index.tsx`: torneo activo, partido destacado, eventos del partido, plantel, afición, noticias, juvenil, lugares, tipos de lugar, patrocinadores, más el catálogo de la tienda (Shopify, otra red externa). Peor: partidos y posiciones **esperan** a que primero responda "torneo activo" (`useSeasonKey` depende de `useActiveSeason`), así que se pagan dos viajes a París en fila. Y `QueryClient` está sin configurar (`staleTime: 0`), sin persistencia: cada carga en frío vuelve a pedir todo desde cero.

**Conclusión honesta:** no son consultas lentas ni falta de índices. Es **distancia (París) x número de viajes encadenados**, sin caché entre visitas.

## Plan de optimización (según lo medido)

1. **Romper el encadenamiento.** Quitar la dependencia "primero torneo activo, luego partidos/posiciones": pedir el torneo activo y los datos de liga en paralelo (una sola función que devuelva torneo + partidos + posiciones + goleo en un viaje, o resolver la temporada del lado de la base). Elimina un viaje completo a París de la ruta crítica.

2. **Caché entre visitas (el mayor golpe percibido).** Configurar `QueryClient` con `staleTime` razonable por tipo de dato (contenido editorial 5 min, liga 1 min, partido en vivo se mantiene fresco) y persistir la caché en el navegador. Resultado: la segunda visita y las navegaciones internas muestran la información al instante y se actualiza en segundo plano.

3. **Consultas más ligeras.** Reemplazar los `select *` que quedan (partidos, posiciones, lugares, patrocinadores, banners) por listas explícitas de columnas, poner límite a partidos (por jornada / próximos, no las 234), y en la portada pedir solo los campos que esa sección pinta. Menos bytes por viaje largo.

4. **Independencia por bloque.** Asegurar que cada sección de la portada pinte en cuanto llegan SUS datos, con esqueleto propio, sin que la tienda (Shopify) o el plantel bloqueen a las demás. Ya hay esqueletos parciales; completar los que faltan.

5. **Región.** Reportado arriba: la base está en París. Cambiar la región de una base ya poblada no es un ajuste de código y no lo haría sin tu aprobación explícita; el punto 2 (caché) más el punto 1 (menos viajes) compensan buena parte del retraso. Si después de esto quieres bajar el piso de latencia, evaluamos mover la base a una región de América del Norte como paso aparte.

**Índices: descartado con datos.** No agrego índices porque las tablas son demasiado pequeñas para que sirvan; sería ruido sin beneficio.

## Detalles técnicos

- `src/App.tsx`: `new QueryClient()` → opciones por defecto (`staleTime`, `gcTime`, `refetchOnWindowFocus: false`) + persistencia con `localStorage`.
- `src/hooks/useLeague.ts`: `useSeasonKey()` alimenta `useMatches`/`useStandings`/`useScorers` → refactor a una consulta combinada; `MATCH_SELECT` con `*` en tres tablas → columnas explícitas.
- `src/hooks/useClub.ts`, `useVisitaLosCabos.ts`, `useSponsors.ts`, `useShopContent.ts`: columnas explícitas y `staleTime` por consulta.
- Sin cambios de diseño, de funcionalidad ni de esquema; no se requieren migraciones.

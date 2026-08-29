# Ajustes: pase, patrocinadores editables y detalles de Inicio

## 1. "Ver mi pase" en Inicio

La ruta `/mi-pase` existe y el enlace del hero apunta bien, y en la base de datos los 4 usuarios tienen su pase creado, así que la causa todavía no está confirmada. Primer paso: reproducir el clic en el preview con sesión iniciada y ver qué pasa (¿no navega?, ¿navega y la página se ve vacía?, ¿aparece "Aún no tienes tu pase" porque la consulta se bloquea por permisos?).

Según lo que muestre esa prueba, se corrige lo que corresponda:
- Si el clic no navega: arreglar el bloqueo de la capa de imagen/degradado del hero.
- Si navega pero no muestra el pase: corregir la lectura del pase (permisos de lectura del propio pase) y dejar la pantalla vacía con un mensaje útil.

## 2. Carrusel de patrocinadores editable desde el panel

Hoy los 6 logos están escritos a mano en el código. Se vuelve administrable sin cambiar el comportamiento visual (misma banda fija abajo, misma altura de logos, mismo loop continuo).

- Nueva tabla de patrocinadores: nombre, logo, enlace opcional, orden y activo/inactivo.
- Almacenamiento público para los logos PNG (fondo transparente, sin marcos ni círculos).
- Nueva pestaña "Patrocinadores" en `/admin`: subir logo, nombre, orden con arrastrar/subir-bajar, activar/desactivar, borrar.
- El carrusel lee de la base de datos; si aún no hay registros, usa los 6 logos actuales como respaldo para que nunca se vea vacío.
- Los 6 logos actuales se cargan como datos iniciales para que arranque ya poblado.

### Sobre el límite de logos
No hay un límite técnico duro, pero para que siga corriendo igual de fluido:
- El loop se mantiene fluido y sin cortes hasta unos 20-25 logos activos (la banda se duplica automáticamente para cerrar el ciclo).
- La velocidad se ajustará en proporción al ancho total, así que con más logos la banda no se ve "acelerada" ni se corta.
- Recomendación: máximo ~20 activos, PNG de menos de 200 KB y ~120 px de alto para que carguen ligeros. Si algún día se pasa de eso, se pueden desactivar logos en lugar de borrarlos.

## 3. Texto de Visita Los Cabos

Cambiar "El paraíso, según la afición" por "Conoce y recorre Tu Paraíso".

## 4. Tarjeta de Fuerzas juveniles

La información está pegada al borde inferior por un relleno superior fijo. Se cambia a una tarjeta con alto definido y el contenido centrado verticalmente sobre la foto, con el degradado ajustado para que el texto se lea bien y quede equilibrado en móvil y escritorio.

## Detalles técnicos

- `sponsors` (tabla pública): `name`, `logo_url`, `link_url`, `sort_order`, `is_active`; RLS con lectura pública (anon + authenticated) y escritura solo para admin vía `has_role`, más los `GRANT` correspondientes.
- Bucket público `sponsors` con políticas de subida/actualización/borrado solo para admin.
- Hook `useSponsors` con React Query; `SponsorCarousel` consume el hook, mantiene el cálculo de `travelDistance` y escala la duración de la animación según el ancho del set.
- Nueva sección admin `src/pages/admin/sections/Patrocinadores.tsx` registrada en `AdminShell` (lazy), reutilizando `ImageUploadField` y `AdminUI`.
- Cambios de UI en `src/pages/Index.tsx` (título de Visita y tarjeta juvenil). No se toca ninguna otra sección ni el resto del admin.

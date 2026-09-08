# Arreglar los lugares que no aparecen en el mapa

## Qué está pasando (confirmado)

El mapa y el código están bien. El problema es de permisos en la base:

- Al pedir los lugares sin iniciar sesión, la base responde con error:
  `permission denied for function is_admin`. Por eso la lista llega vacía y no
  se dibuja ningún pin, ni el de Cabo Wabo Cantina (que sí existe publicado,
  con coordenadas correctas).
- Causa: en la revisión de seguridad reciente se quitó a los visitantes
  anónimos el permiso de ejecutar la función `is_admin`, pero la regla de
  lectura pública de varias tablas todavía la usa (`publicado OR es admin`).
  Al no poder ejecutarla, la lectura entera falla.

Mismo error afecta a estas secciones para quien no ha iniciado sesión:

| Tabla | Sección del sitio |
|---|---|
| places | Lugares del mapa de Visita Los Cabos |
| fan_routes, fan_route_stops | Rutas de afición |
| fan_posts | Afición en Tu Club |
| shop_hero_slides, shop_banners | Carrusel y banners de la Tienda |
| youth_team | Fuerzas Juveniles |

(Solo hay 1 lugar dado de alta en total, así que tras el arreglo se verá ese
pin; los demás se agregan desde el panel de admin.)

## El arreglo

Reescribir la regla de lectura pública de esas 7 tablas para que no dependa de
`is_admin`, sin abrir nada de más:

- Visitante anónimo: puede leer únicamente las filas publicadas/visibles.
- Usuario con sesión: puede leer las publicadas, y los administradores además
  las no publicadas (ahí sí se sigue usando `is_admin`, que los usuarios con
  sesión sí pueden ejecutar).

Se mantiene intacto el permiso de administración (crear/editar/borrar) y el
hallazgo de seguridad resuelto: los anónimos siguen sin poder ejecutar
`is_admin`.

## Detalles técnicos

Una sola migración que, por cada tabla afectada, reemplaza la política SELECT
actual (`TO public`) por dos políticas:

```sql
-- ejemplo para places
DROP POLICY "Published places are viewable by everyone" ON public.places;

CREATE POLICY "Anon reads published places"
  ON public.places FOR SELECT TO anon
  USING (published);

CREATE POLICY "Auth reads published places"
  ON public.places FOR SELECT TO authenticated
  USING (published OR public.is_admin(auth.uid()));
```

Se aplica el mismo patrón a `fan_routes`, `fan_route_stops` (con su EXISTS a
rutas publicadas), `fan_posts`, `shop_hero_slides`, `shop_banners` y
`youth_team`. Se confirma que los GRANT de SELECT a `anon`/`authenticated`
existen en esas tablas.

## Verificación

1. Consulta pública con la llave anónima a las 7 tablas: debe responder 200
   con datos, sin el error de `is_admin`.
2. En el navegador, sin sesión: `/conoce-los-cabos` muestra el pin de Cabo
   Wabo Cantina y su ficha; Tienda muestra su carrusel; Tu Club muestra
   Afición y Fuerzas Juveniles.
3. Revisar que no queden errores en la consola del navegador.

# Plan: Navbar móvil con 6 secciones + "Conoce tu Club" destacado en hamburguesa

## Diagnóstico (cómo está hoy)

Todo vive en `src/components/layout/Header.tsx`. No existe barra inferior; la navegación está arriba en dos líneas (línea 1: hamburguesa · escudo · mini pase; línea 2: nav). Escritorio ya muestra las 6 secciones en el orden acordado y no se toca.

**Fila de navegación móvil (línea 2):** hoy muestra solo 5 columnas: Inicio · Boletos · Tienda · Match Zone + botón "Más" (que abre el drawer). Visita Los Cabos, Fan Zone y Tu Club están escondidas dentro del drawer (`mobileNavLinks = primaryNavLinks.slice(0, 4)`).

**Menú hamburguesa (drawer), de arriba a abajo hoy:**
1. Bloque de perfil/auth (saludo + mini pase, o botones de iniciar sesión / crear cuenta)
2. Sección "Más secciones": Visita Los Cabos · Fan Zone · Tu Club
3. Ver Carrito
4. "Extras": Patrocinios · Contáctanos + redes sociales

Tu Club vive hoy solo como ítem normal dentro de "Más secciones", sin protagonismo.

## Cambios (solo `Header.tsx`, páginas intactas)

### 1. Navbar móvil: 6 secciones visibles, sin "Más"

- La fila usa las 6 secciones en este orden: **Inicio · Boletos · Tienda · Match Zone · Visita Los Cabos · Fan Zone**.
- Etiquetas cortas para que quepan (393 px): Inicio · Boletos · Tienda · **Match** · Visita · Fans.
- Grid de 6 columnas con ícono + etiqueta; se compacta ligeramente (ícono y texto un poco menores, padding horizontal reducido) para que ninguna se corte ni encime.
- Se elimina el botón "Más" de la fila (el drawer sigue accesible desde la hamburguesa, línea 1).
- Se conserva el subrayado activo animado (`layoutId="nav-underline"`) y la animación de escala del ícono activo.
- La navbar se mantiene arriba; no se crea ninguna barra inferior.

### 2. Menú hamburguesa: nueva estructura

Orden de arriba a abajo:

1. **Entrada destacada "CONOCE TU CLUB"** hasta arriba del drawer:
   - Banner/tarjeta de mayor presencia que un ítem normal: ícono **Shield** (escudo), texto grande, chevron, fondo resaltado con borde en cyan y relleno de superficie.
   - Lleva a `/club`. Es la única ruta a Tu Club (se quita Tu Club de cualquier lista).
2. **Encabezado "NAVEGACIÓN"**: label pequeño, mayúsculas, tracking amplio, gris muted (mismo estilo que el label "Extras" actual).
3. **Lista de las 6 páginas**: Inicio · Boletos · Tienda · Match Zone · Visita Los Cabos · Fan Zone (mismo estilo de ítem que el drawer ya usa, con íconos y subrayado lateral cuando están activas).
4. **Lo que ya vive en el menú, como está**: bloque de perfil/auth (saludo + mini pase / iniciar sesión / crear cuenta), Ver Carrito con badge, "Extras" (Patrocinios, Contáctanos) y redes sociales.

### 3. Lo que no cambia

- Escritorio: mismo orden ya acordado (Inicio · Boletos · Tienda · Match Zone · Visita · Fan Zone) + Tu Club en hamburguesa vía el banner.
- Mini pase, carrito, perfil, cierre del drawer, animaciones y todos los estilos existentes.
- Ninguna página ni su contenido.

## Verificación

- Playwright móvil (393 px): comprobar que las 6 secciones caben sin cortarse, que "Match" se abrevia, que no existe "Más", y captura del drawer con el banner de Tu Club arriba + encabezado NAVEGACIÓN.
- Playwright escritorio: comprobar que el orden y subrayado siguen intactos.
- Revisión de build (build-errors.log sin errores).

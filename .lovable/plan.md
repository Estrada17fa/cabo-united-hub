# Reordenar el menú hamburguesa (drawer) — Perfil hasta arriba

## Diagnóstico

El drawer vive en `src/components/layout/Header.tsx` (bloque `<Sheet>`). El orden actual de bloques es:

1. "Conoce tu Club" (banner destacado con escudo)
2. "Navegación" + las 6 páginas
3. Perfil / Auth (saludo + mini pase con sesión, o Iniciar sesión / Crear cuenta sin sesión)
4. Ver Carrito
5. "Extras" (Patrocinios, Contáctanos) + redes sociales

El usuario pide el bloque de PERFIL/CUENTA primero.

## Cambio

Solo mover bloques dentro del `<SheetContent>`; cero cambios de contenido, estilos ni comportamiento:

1. **Perfil / Auth** (div `mb-5` con el saludo + FanPassMini + admin + cerrar sesión, o los botones de Iniciar sesión / Crear cuenta) — pasa hasta arriba, justo después del `<SheetHeader>`. Cambia su margen superior a `mt-1` para alinear con lo que hoy tiene el banner.
2. **"Conoce tu Club"** (banner con escudo) — segundo; se ajusta su margen para conservar el espaciado (`mt-0`, mantiene `mb-5`).
3. **"Navegación"** + las 6 páginas — tercero, sin cambios.
4. **Ver Carrito**, separador, **"Extras"** + redes sociales — quedan igual al final.

Detalles de coherencia (sin tocar estilos existentes):
- El bloque de Perfil hoy termina en `mb-5`; se conserva ese espaciado inferior.
- El banner "Conoce tu Club" hoy tiene `mb-5 mt-1`; el `mt-1` ya no es necesario al no ir primero (queda `mb-5`).
- Todo lo demás (clases, íconos, handlers, animaciones, mini pase, carrito, redes) queda byte-idéntico.

## Verificación

- Build correcto.
- Playwright: abrir el drawer en móvil con y sin sesión y confirmar el nuevo orden visual (Perfil arriba, luego Conoce tu Club, luego Navegación, luego Carrito/Extras/redes).

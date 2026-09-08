# Pantalla de carga inicial (splash)

## Diagnóstico

- Hoy `index.html` tiene `<div id="root"></div>` completamente vacío: hasta que el bundle de JavaScript carga y React monta, el navegador muestra una pantalla en negro/vacía. Es el hueco que se percibe como "sitio roto".
- `src/main.tsx` monta React con `createRoot(...).render(<App />)` — ese es el punto donde el splash debe apagarse.
- El escudo ya existe en el proyecto (`src/assets/lcu-crest.png`, 19 KB PNG 619×719), pero para que el splash sea instantáneo no puede depender del bundle de Vite: hay que servirlo desde `public/`.
- No hay ningún splash actualmente. Los skeletons por bloque son otra capa (datos); esto no los toca.

## Plan

1. **Copiar el escudo a `public/`**: mover una copia de `lcu-crest.png` a `public/splash-crest.png` (19 KB, sin peso nuevo real) para que el HTML base lo cargue directo, sin esperar a Vite/React.

2. **Splash en `index.html` (HTML + CSS puro, dentro del `<body>` antes de `#root`)**:
   - Overlay fijo a pantalla completa, fondo `#060708`, z-index alto.
   - Escudo centrado con animación de pulso suave (escala 1 → 1.04, CSS `@keyframes`, sin librerías).
   - Debajo, una barra/punto de carga discreta en cyan `#00ABC4` (animación CSS pura).
   - `<style>` inline en el propio `index.html` (~1 KB) para que pinte en el primer frame, antes de cualquier JS.
   - Respeto a `prefers-reduced-motion`: si el usuario lo pide, sin pulso.

3. **Apagado cuando React monta**: en `src/main.tsx`, tras `createRoot().render()`, el splash hace `fade-out` (opacidad 0, ~300 ms, transición CSS) y luego se elimina del DOM. Se activa al montar, no por temporizador — si la app tarda, el splash espera; si es rápida, desaparece al instante.
   - Salvaguarda: un `setTimeout` de respaldo (~8 s) que lo quita aunque algo falle, para que nunca quede pegado.

4. **Verificación**: compilar y comprobar con el navegador de pruebas que al cargar con red lenta aparece el splash de inmediato, desaparece solo al montar la app (sin parpadeo) y que los skeletons por bloque siguen igual.

## Qué NO se toca

- Nada de diseño de páginas, skeletons de datos, ni funcionalidad.
- Sin librerías nuevas; ~2 KB totales (CSS + PNG existente).
- Cero impacto en velocidad de carga real: es solo lo que se ve mientras arranca lo que ya se cargaba.

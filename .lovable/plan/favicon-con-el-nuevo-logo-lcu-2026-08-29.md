# Favicon con el nuevo logo LCU

## Objetivo
Usar el logo subido (`LOGO_LCU.png`) como favicon de la página en las pestañas del navegador.

## Cambios
1. **Procesar el logo**: convertir el PNG subido a un favicon cuadrado de 64×64 px en `public/favicon.png`, manteniendo proporciones con padding (no estirar).
2. **Actualizar `index.html`**: reemplazar el `<link rel="icon">` actual por `/favicon.png` con `type="image/png"`.
3. **Limpiar**: eliminar el `public/favicon.ico` por defecto para que el navegador use el nuevo PNG.

## Verificación
- Build OK.
- El favicon nuevo aparece en la pestaña del preview.

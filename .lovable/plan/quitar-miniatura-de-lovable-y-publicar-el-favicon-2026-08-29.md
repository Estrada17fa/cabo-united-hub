# Quitar miniatura de Lovable y publicar el favicon

## Diagnóstico
1. **Favicon**: el logo nuevo ya está en `public/favicon.png` y enlazado en `index.html`, pero los cambios de frontend solo llegan a la web publicada al hacer **Publish** — no está desplegado todavía.
2. **Miniatura de Lovable en WhatsApp**: `index.html` todavía tiene `og:image` y `twitter:image` apuntando a `https://lovable.dev/opengraph-image-p98pqg.png` (imagen genérica de Lovable). Por eso el preview del enlace muestra la tarjeta de Lovable.

## Cambios
1. **Quitar el og:image genérico de Lovable** de `index.html` (líneas `og:image` y `twitter:image`). Sin og:image propio, el hosting inyecta automáticamente el screenshot del sitio como preview.
2. **Publicar el sitio** para que el favicon del logo y los metadatos nuevos lleguen a loscabosunited.mx.

## Notas
- Los favicons los cachean los navegadores: si no aparece de inmediato, basta un hard-refresh (Cmd/Ctrl+Shift+R).
- WhatsApp/Twitter cachean el preview del enlace; después de publicar puede tardar en refrescarse o forzarse con el debugger de links de cada plataforma.

## Verificación
- Publicar y abrir la URL publicada para confirmar el favicon en la pestaña.

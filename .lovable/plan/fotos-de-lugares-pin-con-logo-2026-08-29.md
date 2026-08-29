# Fotos de lugares + pin con logo

## Diagnóstico (verificado)

- La subida falla por permisos de almacenamiento: la regla de admin del bucket `avatars` solo permite las carpetas `teams`, `tournaments` y `players`. El editor de lugares sube a la carpeta `places`, así que el almacenamiento la rechaza. No es un bug del formulario.
- La tabla `places` no tiene columna de logo; el pin del mapa se dibuja hoy con el ícono de la categoría (y dorado + estrella para patrocinador).

## Qué se hace

1. **Permitir la subida**: ampliar la regla de admin del bucket para incluir las carpetas `places` y `place-logos`. Con eso, "Subir imagen" funciona igual que en Plantel/Equipos.
2. **Nuevo campo Logo en Lugares (admin)**: se agrega `logo_url` a la tabla `places` y un campo de subida "Logo del lugar" en la hoja de alta/edición, junto a la foto. La foto sigue siendo la imagen grande del detalle; el logo es la marca que se usa en el pin.
3. **Pin del mapa con logo**: cuando el lugar tiene logo, el pin muestra el logo recortado en un círculo/cuadro redondeado con borde del color de su categoría (dorado si es patrocinador, con su estrella). Si no hay logo, se conserva exactamente el pin actual de ícono por categoría, sin cambios visuales.
   - Tamaños: patrocinador 36px, destacado 30px, básico 24px (sube del punto de 12px solo cuando hay logo, para que la marca se distinga).
   - El estado seleccionado mantiene el mismo anillo blanco de hoy.
   - Logos PNG se muestran sin fondo extra, según la regla del sitio.
4. La lista del admin muestra el logo como miniatura cuando existe, y la foto si no.

## Notas técnicas

- Migración: `ALTER TABLE public.places ADD COLUMN logo_url text` (nulable) + reemplazo de la política de almacenamiento para admitir `places`.
- Archivos: `src/components/admin/ImageUploadField.tsx` (agregar carpeta permitida al tipo), `src/pages/admin/sections/Visita/Lugares.tsx`, `src/components/visita-los-cabos/MapView.tsx`, hooks/tipos de `useVisitaLosCabos.ts` y `visita-los-cabos-data.ts` para exponer `logoUrl`.
- Verificación: build, subir una foto y un logo reales desde el panel, y revisar el pin en móvil (393px) y desktop.

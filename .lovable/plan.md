# Cargar los 6 logos de patrocinadores al panel

Hoy la tabla de patrocinadores está vacía: la banda de abajo muestra los 6 logos de respaldo que viven en el código, por eso en `/admin` no aparece ninguno.

## Qué haré

1. Subir los 6 PNG actuales (sponsor-05 a sponsor-10) al almacenamiento público, en la carpeta `sponsors`.
2. Darlos de alta en la tabla de patrocinadores con su orden (1 a 6) y activos, para que aparezcan listados en la pestaña "Patrocinadores" de `/admin` y puedas renombrarlos, reordenarlos, ocultarlos o reemplazar el logo desde ahí.
3. Dejarte también los 6 archivos descargables desde el panel de archivos, por si quieres editarlos o volverlos a subir.

Como el nombre real de cada marca no está en el código, quedarán como "Patrocinador 1…6" y los renombras en el panel en un minuto (o me dices los nombres y los pongo yo).

La banda de abajo se verá exactamente igual: al haber registros, deja de usar el respaldo y lee de la base de datos con los mismos logos.

## Detalles técnicos

- Subida al bucket público `avatars`, prefijo `sponsors/`, con los mismos parámetros que usa `ImageUploadField` (cache largo, content-type image/png).
- Inserción en `public.sponsors` con `name`, `logo_url` (URL pública), `link_url` nulo, `sort_order` 1-6, `is_active` true. Sin cambios de esquema ni de RLS.
- Copia de los archivos a `/mnt/documents/patrocinadores/` para descarga.
- Sin cambios en `SponsorCarousel` ni en la sección de admin.

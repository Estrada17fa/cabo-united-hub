# Correcciones al admin de Torneo

Cinco ajustes sobre lo ya aprobado, dentro de la misma reestructura del panel (una sola página, secciones perezosas).

## 1. Subir logos en PNG (no URL)

- **Equipos**: campo de subida de imagen con vista previa; se guarda el archivo y la URL pública queda en el equipo. Se elimina el campo de URL manual.
- **Liga/Torneo**: mismo control en Configuración del torneo, para el logo del torneo (hoy no existe ese campo).
- Nota técnica: el bucket nuevo `team-logos` quedó **privado** porque este espacio de trabajo no permite buckets públicos, y un bucket privado no sirve imágenes en el sitio público. Por eso los logos se guardan en el bucket público que ya existe (`avatars`), bajo las carpetas `teams/` y `tournaments/`. Sube PNG/JPG/WEBP hasta 2 MB, con nombre único.

## 2. Editar equipos

- La lista de equipos pasa a lista + hoja lateral de edición: nombre, nombre corto, ciudad, grupo, **sede**, logo y marca "nuestro equipo". Guardar y eliminar desde la misma hoja.

## 3. Sede por equipo, autollenada en el partido

- Nuevo campo **sede** en cada equipo (su estadio o cancha habitual).
- Al crear o editar un partido, en cuanto se elige el equipo local la sede se llena sola con la sede de ese equipo; se puede sobrescribir a mano (si la tocas, ya no se vuelve a autollenar).

## 4. Alta de jornada completa

- Además del alta partido por partido, un modo **"Jornada completa"**: eliges número de jornada, fecha y hora base, y armas los cruces de la jornada en filas (local vs visitante) con hora y sede propias por partido (sede autollenada por el local).
- Botón de "agregar fila", validación de equipos repetidos dentro de la jornada, y guardado en una sola operación.

## 5. Editar partidos

- Cada partido de la lista abre una hoja de edición completa: jornada, local, visitante, fecha/hora, sede, grupo, fase, estado, marcador, penales, link de boletos, **link de transmisión y en vivo**, y los eventos del timeline (gol, autogol, penal, tarjeta, cambio, MT, final) con minuto.
- La lista se agrupa por jornada para editar rápido.

## Detalles técnicos

- **Migración**: `teams.venue` (texto), `seasons.logo_url` (texto). Políticas de `storage.objects` para el bucket `avatars` que permitan a administradores subir/reemplazar en los prefijos `teams/` y `tournaments/`, con lectura pública ya existente.
- **Componente compartido**: `src/components/admin/ImageUploadField.tsx` (subida, validación de tipo/tamaño, vista previa, borrado) reutilizado por equipos, torneo y plantel.
- **Formularios**: `TeamSheet`, `MatchSheet` y `MatchdayBuilder` en `src/pages/admin/sections/Torneo/`, con `upsert` a `teams` / `matches` e inserción por lotes para la jornada completa. Invalidación quirúrgica por `queryKey`.
- **Autollenado de sede**: al cambiar el local se copia `teams.venue` al campo sede solo si el usuario no lo editó manualmente.
- Sin cambios en el sitio público más allá de que ahora lee los logos ya subidos.

# Corregir definitivamente el negro al cambiar de página

## Diagnóstico confirmado

- Al cambiar de Tu Club a Tienda, el indicador aparece técnicamente, pero solo durante unos **70 ms**.
- El indicador está dentro del contenedor animado de la página. La transición reduce la opacidad de todo ese contenedor: durante la medición bajó de 88% a 52%, y la página nueva llegó a apenas 16% de opacidad.
- Cuando el archivo de una sección ya está en caché, `Suspense` termina casi inmediatamente y desmonta el indicador antes de que el ojo alcance a percibirlo.
- El espacio negro no proviene de un error de red ni de compilación; los registros no muestran fallos. Lo produce la combinación de un loader demasiado breve con el fade de `AnimatePresence`.

## Plan de corrección

1. **Sacar la carga de la animación de la página**
   - Mover el indicador al nivel del layout, fuera del contenedor que cambia de opacidad.
   - Mantenerlo siempre al 100% de opacidad, centrado entre la cabecera y los patrocinadores.

2. **Activarlo en cada cambio de ruta**
   - Detectar directamente cada cambio de página, aunque el archivo ya esté en caché y `Suspense` no alcance a mostrarse.
   - Mostrar escudo, barra cyan y “Cargando” durante un intervalo mínimo corto y perceptible.
   - Retirarlo con fade cuando la nueva vista esté lista, evitando tanto el destello negro como una espera larga.

3. **Evitar contenido semitransparente**
   - Simplificar la transición para que la nueva página no permanezca casi invisible mientras el loader desaparece.
   - Conservar un fade suave, pero sin usar el modo que deja vacía el área mientras sale la página anterior.

4. **Verificación cuadro por cuadro**
   - Medir nuevamente las primeras fracciones de segundo al navegar entre todas las secciones principales.
   - Confirmar que el loader permanezca visible y opaco durante todo el cambio.
   - Revisar escritorio y móvil, incluyendo páginas ya visitadas y páginas aún no descargadas.
   - Confirmar que no haya errores y que el indicador nunca quede pegado.

## Alcance

- Solo cambia la transición visual entre páginas.
- No se modifica contenido, datos ni funcionalidad.

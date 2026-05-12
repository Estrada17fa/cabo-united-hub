## Mejoras al Pase Digital LCU

### 1. Nuevo formato de código de pase
Cambiar la función `generate_pass_code()` en la base de datos para que reciba `tier` y `full_name` y produzca:

```
LCU-<TIER><INICIALES><N>
```

- `<TIER>`: 1 letra → F (fan), G (gold), P (premium), X (platino, para no chocar con premium)
- `<INICIALES>`: 1ª letra del nombre + 1ª letra de cada apellido (ej. "Eduardo Espinoza Fernández" → EEF). Si solo hay 2 palabras, repito la última (Juan Pérez → JPP). Se limpian acentos y se forzan mayúsculas.
- `<N>`: número aleatorio 1–10. Si el código ya existe, se reintenta el aleatorio; si tras varios intentos sigue colisionando, se amplía el rango automáticamente a 1–99 y luego 1–999 como red de seguridad (sin cambiar el formato visible para el caso normal).

Se actualiza también el trigger `handle_new_user` para llamar a la nueva firma `generate_pass_code(v_tier, v_full_name)`. El código se guarda en `fan_passes.pass_code` (ya existe esa columna), por lo que se reutiliza.

### 2. Cambio de etiqueta en el pase
En `FanPassCard.tsx`, reemplazar el texto **"Titular"** por **"Amo del Paraíso"** sobre el nombre del aficionado. Se respeta el mismo tracking/uppercase y color del tier.

### 3. Pase "instagrameable" (descarga + story)
Se añade en la parte inferior del `FanPassCard` una fila con dos botones glass-pill:

- **Descargar pase** → exporta el frente del pase como PNG vertical (1080×1714, ratio 0.63:1) listo para WhatsApp/feed.
- **Compartir story** → exporta una imagen 1080×1920 (9:16) con el pase centrado sobre un fondo decorado: gradiente del color del tier, crest LCU grande con baja opacidad, glow neón cyan/pink (paleta del proyecto) y un footer pequeño "lcu.com.mx · #SoyLCU".

Implementación:
- Se usa `html-to-image` (ligero, ya compatible con SVG/QR) para capturar el nodo del frente del pase a PNG con `pixelRatio` alto para una imagen nítida.
- Para el modo story se renderiza un componente oculto `PassStoryCanvas` (1080×1920) que envuelve una copia del frente del pase con el fondo decorado, se exporta y se descarga.
- En navegadores móviles que soportan `navigator.share` con `files`, los botones intentan compartir directamente; si no, hacen descarga clásica.
- Importante: durante la captura se desactiva la animación de flip para garantizar que se exporta el frente.

### 4. Detalles técnicos

```text
generate_pass_code(tier pass_tier, full_name text) → text
  tier_letter := CASE tier WHEN 'fan' THEN 'F' WHEN 'gold' THEN 'G'
                           WHEN 'premium' THEN 'P' WHEN 'platino' THEN 'X' END
  initials    := primera letra de cada palabra de unaccent(upper(full_name)),
                 limitada a 3; si solo hay 2 palabras, repetir la 2ª.
  loop 20 veces con N en 1..10  → si libre, devolver
  loop 20 veces con N en 1..99  → si libre, devolver
  loop hasta 50 veces con N en 1..999 → último recurso
```

Frontend:
- Nueva carpeta `src/components/pass/share/` con `PassStoryCanvas.tsx` y helper `exportPass.ts` (envuelve `html-to-image` + descarga / share API).
- Dependencia nueva: `html-to-image`.
- `FanPassCard.tsx` añade `ref` al frente, props para mostrar/ocultar botones, y la barra de acciones.

### 5. Fuera de alcance
- No se toca el flujo de pago, el QR del partido ni el wizard de registro.
- No se cambian los colores de tier ni el layout vertical existente.
- No se exportan los códigos antiguos (los pases ya creados conservan su `LCU-XXXXXX`); solo aplica al alta de nuevos usuarios.

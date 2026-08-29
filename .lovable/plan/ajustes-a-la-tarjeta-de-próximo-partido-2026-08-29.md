# Ajustes a la tarjeta de próximo partido

## 1. Quitar el botón "Recordarme"

El "Recordarme" actual descarga un archivo .ics que el usuario tendría que abrir a mano — no agrega el partido al calendario automáticamente (no es posible sin backend de notificaciones o suscripción de calendario). Como la descarga no es la experiencia deseada:

- Se elimina el botón "Recordarme" y la lógica `.ics` de `NextMatchCard.tsx`.
- En partidos de local con link de boletos, el botón "Comprar boletos" se mantiene igual.
- En partidos sin boletos, la tarjeta simplemente termina en el chip Local/Visita, sin botón inferior.
- Se limpian los imports que queden sin uso (`Bell`, `toast`, `buildIcs`/`downloadIcs`).

## 2. CTA de transmisión en rosa #F199C1

El bloque "La transmisión en vivo es exclusiva para miembros" cambia de acento cyan a rosa:

- Botón "Crear cuenta gratis" con fondo `#F199C1` y texto oscuro (se implementa con estilo inline/clase local, no con el token `primary`, para no afectar el resto del sitio donde el acento sigue siendo cyan).
- Link "Ya tengo cuenta, iniciar sesión" en el mismo rosa.
- El borde/fondo de la tarjeta contenedora se mantiene neutro (hairline + surface), sin decoración extra.

Solo se toca `src/components/match-zone/NextMatchCard.tsx`. Sin cambios en base de datos ni en otros componentes.

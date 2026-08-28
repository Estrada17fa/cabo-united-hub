# Mi Pase: sección propia + reverso dual (Estadio / Comercios)

## Parte 1 — Navegación

- El ítem del menú principal con ícono de boleto pasa de "Accesos" → "Mi Pase" y apunta a `/mi-pase`.
- Nueva página `/mi-pase`: solo la tarjeta del pase (frente + reverso, click para girar). Sin XP, sin Cabo Coins, sin verificaciones, sin transacciones. Layout compacto, pensado para abrirse y usarse de pie.
- Estado vacío: si el usuario no tiene `fan_pass`, mensaje "Aún no tienes tu pase" + botón a `/abonos`. Si no hay sesión, botón para iniciar sesión.
- La página de elegir/comprar nivel sigue existiendo igual (`/accesos` sigue accesible por URL y desde botones existentes; el acceso destacado queda en Fan Zone y en el estado vacío de `/mi-pase`).
- `FanPassMini` (menú hamburguesa) ahora enlaza a `/mi-pase`.
- Mi Perfil: se conserva la vista actual del pase y se agrega un botón "Ver mi pase completo" → `/mi-pase`. Nada más cambia ahí.

## Parte 2 — Reverso con dos modos

Selector de dos pestañas en el reverso: **Estadio** y **Comercios**.

Estadio (se conserva todo lo actual):
- Mismo QR de `issue-match-qr`, mismo aviso de "No hay próximo partido programado", mismos botones descargar/compartir/regenerar.
- Se agrega debajo del QR una línea de acceso/zona como placeholder por nivel: Fan/Gold → "Acceso General"; Premium/Platino → "Zona Preferencial". Queda como un solo valor derivado, fácil de sustituir por zona/asiento real más adelante.

Comercios (nuevo):
- QR de membresía que se regenera automáticamente cada 3 minutos, con anillo circular de cuenta regresiva alrededor del QR.
- Si falla la regeneración (sin red), se mantiene el último QR visible con aviso pequeño "actualizado hace X min" en lugar de pantalla vacía; reintento al recuperar conexión.
- Debajo del QR: foto de perfil (o iniciales) y nombre del titular en grande, más insignia con nivel y porcentaje de descuento.
- El `SponsorCarousel` no se toca.

## Parte 3 — Backend

- `issue-member-qr` (nueva edge function): misma firma HMAC que `issue-match-qr`, `kind: 'member'`, sin partido, expira en 3 minutos, guarda el hash en `qr_tokens`. Requiere pase activo.
- `redeem-member-qr` (nueva edge function): valida firma, expiración y que no se haya usado; marca el token como redimido, inserta `checkins` con `type: 'consumption'` y el `location_id` del negocio; aplica el límite de un canje por pase por negocio por día (ya existe `checkin_day` en `checkins`).
- Portal `/comercios`: login con cuenta de `business_users`, UI minimalista de mostrador — campo para escanear/escribir el código, y al validar muestra foto, nombre, nivel/descuento y botón de confirmar canje.

## Notas técnicas

- Se extrae el helper de firma/hash a `supabase/functions/_shared/qr.ts` y lo usan las tres funciones (`issue-match-qr` se ajusta solo para importar, sin cambio de comportamiento).
- El "descuento por nivel" se lee de las columnas `discount_fan/gold/premium/platino` de `locations` cuando hay negocio; en el pase se muestra el valor genérico del nivel.
- El QR de comercios usa un `setInterval` de 3 min con refresh al volver a foco/visibilidad; el anillo se dibuja con SVG `stroke-dashoffset`.
- Posible migración menor: índice/constraint de unicidad para el límite diario por (pase, negocio, día) si no existe ya con ese alcance; se verifica antes de crearla.

## Qué NO cambia

Frente del pase, `issue-match-qr` y su lógica, XP/Cabo Coins/niveles, resto de Mi Perfil, carrusel de patrocinadores y el resto del sitio.

## Orden de ejecución

1. Ruta `/mi-pase`, navegación, `FanPassMini`, botón en Mi Perfil, estado vacío.
2. Modo Estadio: línea de zona/acceso.
3. `issue-member-qr` + modo Comercios con anillo de cuenta regresiva.
4. `redeem-member-qr` + portal `/comercios`.


# Logística Accesos: Registro, Pase Digital y QR

## 1. Registro del Fan (flujo)

Wizard de 4 pasos en `/accesos/registro`, mobile-first, estética glass-pill cyan/pink:

1. **Cuenta**: Email + contraseña (Supabase Auth ya existente). Si ya está logueado, salta.
2. **Datos personales**: Nombre completo, fecha de nacimiento (date picker), teléfono (con lada MX), validación con zod.
3. **Jugador favorito**: Grid horizontal scrollable con foto, dorsal y nombre — viene de tabla `players`.
4. **Nivel + pago**:
   - Cards de Fan (gratis), Gold, Premium, Platino.
   - Si elige Fan → confirma y crea pase.
   - Si elige pago → modal "Pago simulado" con botón "Confirmar pago de prueba" (mock: marca `payment_status='mock_paid'` para iterar el flujo real más adelante con Stripe).

Al finalizar: se crea `fan_pass`, se redirige a `/accesos/mi-pase`.

## 2. Pase Digital (flip card)

Página `/accesos/mi-pase`, animación Framer Motion `rotateY` con perspective. Tap o botón "Voltear".

**Frente** (look "boarding pass deportivo"):
- Banner de color por nivel (gradient cyan→pink en Platino, dorado en Gold, etc.)
- Logo Marlins + "PASE OFICIAL"
- Nombre del fan, foto del jugador favorito en marca de agua
- Nivel grande con tipografía Poppins black
- ID del fan (`MARLIN-2026-XXXX`)
- QR maestro permanente (acceso/identificación)

**Reverso**:
- Lista compacta de beneficios activos del nivel
- Vencimiento del abono / temporada
- Sección "Próximo partido" con CTA "Generar QR de entrada" (solo si nivel incluye acceso al estadio)
- Historial corto: últimos 3 canjes (partido X, comercio Y)
- Botón "Añadir a Apple/Google Wallet" (placeholder UI por ahora)

Diseñado responsive (1080x1920 base, escala bonito en desktop como tarjeta centrada con sombra cyan).

## 3. Sistema de QR (mezcla permanente + evento)

**Dos tipos:**

- **QR Maestro del Fan** — permanente, contiene `pass_id` firmado (HMAC). Sirve como identificación general (entrada al club, comercios sin canje específico, recoger kit).
- **QR de Evento** — generado bajo demanda al tocar "Generar QR" para:
  - Entrada a un partido específico (uno por partido, vence al iniciar el partido + 3h)
  - Canje de beneficio puntual (ej. bebida gratis en Bar X)
  - Experiencia exclusiva (meet & greet)
  
  Cada QR de evento es un token único almacenado en `qr_tokens` con `redeemed_at` para evitar doble uso.

Visualmente: QR negro sobre fondo blanco con micro-logo Marlins centrado (usar `qrcode.react`).

## 4. Panel de Validación Staff

Ruta protegida `/staff/scan`:
- Login con rol `staff` o `admin` (tabla `user_roles` con enum `app_role`).
- Vista pantalla completa con cámara (`html5-qrcode`), overlay cyan.
- Al escanear: llamada a edge function `validate-qr` que:
  1. Verifica firma HMAC
  2. Busca el token (maestro o evento)
  3. Verifica vigencia + nivel + permiso para ese partido/comercio
  4. Marca `redeemed_at` si es de un solo uso
  5. Devuelve: ✅ Verde (datos del fan + nivel + foto) o ❌ Rojo (motivo)
- Filtro contextual: el staff selecciona "Hoy escaneo para: Partido X / Comercio Y" antes de empezar.

## 5. Plantel (tabla `players`)

Tabla nueva editable a futuro desde admin:
- nombre, dorsal, posición, foto, bio_corta, activo
- Seed con 5-8 jugadores de ejemplo para que el selector funcione hoy.
- Componente `<PlayerPicker />` reutilizable.

## 6. Sugerencias adicionales (qué más conviene)

- **Referidos**: cada fan tiene código único; al traer 3 amigos al plan Fan gratis, sube de tier por 1 mes.
- **Puntos "Marea"**: cada canje/asistencia suma puntos canjeables en tienda Shopify (vincula con la tienda existente).
- **Notificaciones**: email transaccional al registrarse + recordatorio 24h antes de cada partido con botón directo a generar QR.
- **Renovación**: badge en el pase 30 días antes de vencer + flujo de renovación en 1 tap.
- **Privacidad**: el QR maestro nunca expone datos del fan en la URL; siempre va por token firmado.
- **Compartir el pase**: link público read-only `marlins.app/fan/MARLIN-2026-XXXX` solo con nombre + nivel + jugador favorito (estilo "carta coleccionable") para presumir en redes.
- **Historial**: timeline en el reverso del pase con asistencia a partidos y beneficios usados — refuerza pertenencia.

---

## Detalles técnicos

**Migraciones nuevas:**
- `players` (id, name, jersey_number, position, photo_url, short_bio, active)
- `app_role` enum (`fan`, `staff`, `admin`) + tabla `user_roles` + función `has_role` security definer
- `fan_passes` (id, user_id, full_name, birth_date, phone, favorite_player_id, tier enum, status, payment_status, pass_code unique, issued_at, expires_at)
- `qr_tokens` (id, pass_id, token_hash, kind enum `master|match|benefit|experience`, ref_id nullable, expires_at, redeemed_at, redeemed_by_staff)
- `pass_redemptions` (id, pass_id, qr_token_id, kind, ref_id, created_at) — para historial
- RLS: cada fan ve solo su pase/historial; staff puede leer pases vía función `has_role`; nadie puede update directo a `redeemed_at` (solo edge function con service role).

**Edge functions:**
- `issue-pass`: crea fan_pass + master qr_token tras registro/pago mock.
- `generate-event-qr`: emite token de evento firmado HMAC con `expires_at`.
- `validate-qr`: verifica firma, vigencia, permiso por nivel; marca canje atómicamente.

**Secret nuevo:** `QR_SIGNING_SECRET` (HMAC para firmar tokens).

**Libs a añadir:** `qrcode.react`, `html5-qrcode`.

**Páginas/componentes nuevos:**
- `/accesos/registro` (wizard 4 pasos)
- `/accesos/mi-pase` (flip card)
- `/staff/scan` (cámara + validación)
- `<PlayerPicker />`, `<FlipPass />`, `<QrDisplay />`, `<TierGate />`

**Mock de pago:** un solo botón que setea `payment_status='mock_paid'`. Cuando quieras pasar a real, cambia ese paso por Stripe Checkout sin tocar el resto.

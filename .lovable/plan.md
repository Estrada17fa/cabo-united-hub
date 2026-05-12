
# Sistema de Abonos, Pase Digital y QR de Acceso

## Objetivo
Construir un flujo seguro de registro/inicio de sesión donde el aficionado elige su nivel (Fan gratis, Gold, Premium, Platino), recibe un **Pase Digital** con frente (datos) y vuelta (QR único por partido), y queda persistido en la base de datos con roles correctos.

---

## 1. Flujo de usuario

1. En `/accesos`, al pulsar "Quiero ser parte" o el CTA de cualquier nivel → abre **modal de registro** preseleccionando ese tier.
2. Wizard en 3 pasos:
   - **Paso 1 — Datos personales:** Nombre completo, Usuario, Email, Contraseña, Fecha de nacimiento, Teléfono, Jugador favorito (selector con jugadores de la tabla `players`).
   - **Paso 2 — Nivel:** confirma tier (Fan gratis / Gold / Premium / Platino) con resumen de beneficios y precio.
   - **Paso 3 — Pago:** si Fan → activación inmediata. Si pagado → checkout (placeholder por ahora, se marca `payment_status = pending` y se permite simular "pagado" en dev; se deja la puerta lista para Stripe).
3. Al confirmar → cuenta creada, sesión iniciada, redirección a `/mi-perfil` mostrando el **Pase Digital**.
4. Login existente: botón "Iniciar sesión" en header/Accesos.

## 2. Pase Digital (componente `FanPassCard`)

- Tarjeta con efecto flip (Framer Motion) entre **frente** y **vuelta**.
- **Frente:** logo del club, nombre completo, usuario, nivel (badge con color de tier), número de pase (`pass_code`), fecha de emisión, jugador favorito, foto/avatar opcional.
- **Vuelta:** QR grande **único por partido** (regenerado automáticamente para el próximo partido en `matches`), válido hasta `expires_at`, leyenda "Muestra este código en la entrada", contador del partido (vs equipo, fecha).
- El QR codifica un token firmado HMAC (no PII): `{ pass_id, match_id, exp, nonce }` + firma con `QR_SIGNING_SECRET` (ya existe en secrets).
- Generado por edge function `issue-match-qr` que: valida sesión, verifica que el pase esté activo, crea fila en `qr_tokens` con `token_hash` y devuelve el token plano una sola vez al cliente.

## 3. Cambios de base de datos

Las tablas principales **ya existen** (`fan_passes`, `qr_tokens`, `pass_redemptions`, `user_roles`, `profiles`, `players`). Migración mínima:

- Añadir a `profiles`: `username` ya existe, agregar UNIQUE índice case-insensitive; `phone TEXT`, `birth_date DATE`, `favorite_player_id UUID REFERENCES players(id)`.
- Añadir trigger `handle_new_user` ya crea profile; extenderlo para leer `username`, `phone`, `birth_date`, `favorite_player_id` desde `raw_user_meta_data` y crear automáticamente fila en `fan_passes` con tier elegido y `pass_code` generado (`LCU-XXXXXX`).
- Función `generate_pass_code()` (security definer) para códigos únicos.
- Política RLS en `qr_tokens` para INSERT vía edge function (service role).
- Verificar que `fan_passes.tier` y `payment_status` aceptan los valores requeridos.

## 4. Edge functions

- **`issue-match-qr`** (verify_jwt activado en código): emite QR firmado para el próximo partido del usuario autenticado.
- **`redeem-qr`** (staff): valida firma, marca `qr_tokens.redeemed_at` y crea `pass_redemptions`. Queda preparado para staff scanner (no se construye UI de scanner ahora).
- **`create-checkout`** (placeholder): stub que marca pago como completado en dev; se conectará a Stripe después si el usuario lo pide.

## 5. Frontend nuevo

- `src/components/accesos/SignupWizard.tsx` — modal de 3 pasos con validación zod.
- `src/components/accesos/PaymentStep.tsx` — UI de pago (mock por ahora).
- `src/components/pass/FanPassCard.tsx` — pase con flip frente/vuelta y QR.
- `src/components/pass/PassQR.tsx` — usa `qrcode.react` (instalar) para renderizar el QR del token.
- `src/pages/MiPerfil.tsx` — rediseño: muestra el pase digital, datos del aficionado, botón "Generar QR para próximo partido", historial de canjes.
- `AuthModal` existente: añadir validación zod, longitudes máximas, mensaje en español más claro, link a "Crear cuenta con nivel" que dispara el wizard.

## 6. Seguridad

- Validación con zod (cliente y servidor) en wizard y edge functions.
- RLS ya enforce `user_id = auth.uid()` en `fan_passes`.
- Contraseñas: mínimo 8, activar **Password HIBP check** en Auth.
- QR token: solo el `token_hash` se guarda; el plano se entrega una vez. Expira con el partido.
- Roles vía tabla `user_roles` + `has_role()` (ya implementado). El sistema NO usa flags en profile.
- **No** se habilita auto-confirm email; el usuario debe verificar email (configurable). Se sugiere mantenerlo.

## 7. Detalles técnicos

```
Tabla fan_passes (existente)
  user_id, tier, payment_status, pass_code, full_name, birth_date, phone,
  favorite_player_id, status, expires_at

Edge issue-match-qr
  Input: { } (usa JWT)
  1. SELECT fan_pass por auth.uid() → si status≠active → 403
  2. SELECT next match (status=scheduled, match_date >= today) ORDER BY date LIMIT 1
  3. payload = { pid, mid, exp, nonce }; sig = HMAC-SHA256(payload, QR_SIGNING_SECRET)
  4. token = base64url(payload).sig
  5. INSERT qr_tokens (pass_id, kind='match', ref_id=match_id, token_hash=sha256(token), expires_at)
  6. Return { token, match }

Frontend QR
  <PassQR value={token} /> → qrcode.react SVG
  Refetch automático cuando cambia el próximo partido.
```

## 8. Qué queda fuera de este plan
- UI de escáner de staff (solo edge function lista).
- Integración real de Stripe (se deja stub; pedir confirmación después).
- Renovación/expiración automática de pases por temporada.

## Pregunta para el usuario antes de implementar
- ¿Activamos **auto-confirm de email** para que el registro entre directo sin verificación de correo? (recomendado: NO en producción, SÍ para pruebas).
- ¿Procedemos con **stub de pago** (marca como pagado en dev) y dejamos Stripe para una iteración siguiente, o quieres conectar Stripe ahora?


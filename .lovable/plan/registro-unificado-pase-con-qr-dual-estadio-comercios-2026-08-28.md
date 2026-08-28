# Registro unificado + Pase con QR dual (Estadio / Comercios)

No se toca el frente de `FanPassCard` ni la función `issue-match-qr`. Las tablas existentes (`fan_passes`, `qr_tokens`, `locations`, `checkins`, `business_users`) se extienden, no se recrean. RLS y triggers de puntos/nivel quedan intactos.

## 1. Base de datos (aditiva)

- `profiles`: `first_name`, `last_name_p`, `last_name_m`, `marketing_consent boolean default false`, `marketing_consent_at`, `terms_accepted_at`. `display_name` / `fan_passes.full_name` se siguen generando concatenando los tres nombres.
- `fan_passes.status`: se empieza a usar el valor `waitlist` y se agrega restricción que permita `active`, `pending_payment`, `waitlist`, `expired`, `cancelled`. Estructura lista para pasar `waitlist → pending_payment → active` cuando se active el cobro, sin tocar el formulario.
- `locations`: `discount_fan`, `discount_gold`, `discount_premium`, `discount_platino` (enteros, nullable — se llenan cuando definan los porcentajes; mientras no haya valor, el pase muestra "Beneficio del nivel" en lugar de un %).
- `business_users`: `user_id uuid` para ligar la cuenta de acceso; RLS por `user_id = auth.uid()` y rol `business` (el enum ya lo tiene).
- `checkins`: índice único parcial que impide más de un canje por pase, por negocio, por día.
- Función `check_username_available(_username text)` (security definer) para la verificación en vivo sin exponer la tabla.

## 2. Seguridad de cuentas

- Correo obligatorio para el QR: si `email_verified` es falso, el reverso del pase muestra overlay "Verifica tu correo para activar tu QR" y las edge functions rechazan emitir tokens. Botón "Reenviar correo de verificación".
- Contraseñas filtradas: se activa el rechazo de contraseñas comprometidas en la configuración de autenticación (sin código).
- Usuario único: disponibilidad en vivo con debounce de 400 ms, usando el índice único en minúsculas ya existente.
- Teléfono: se captura y guarda en E.164 con selector de país (default +52, buscador). `phone_verified` queda en falso — el OTP por SMS se omite por ahora, según lo acordado; el punto de integración queda aislado para activarlo después.
- Anti-bots: el Paso 1 se construye con un punto de montaje para Cloudflare Turnstile (widget + validación en un endpoint), inactivo hasta que existan las llaves. No se pide ninguna llave hoy.

## 3. Wizard único de registro (3 pasos)

Nuevo `src/components/auth/AuthFlow.tsx`, usado desde Header, Home, Fan Zone y Abonos. `AuthModal` se conserva solo como vista de inicio de sesión (login + Google/Apple + olvidé mi contraseña). El `SignupWizard` de `/accesos` deja de usarse; su age-gate, medidor de contraseña, picker de jugador y sub-paso de tutor se reutilizan dentro de `AuthFlow` sin cambios de lógica.

Barra de progreso de 3 segmentos, validación en vivo por campo.

- **Paso 1 — Identidad y contacto:** Nombre, Apellido Paterno, Apellido Materno (campos separados), usuario con disponibilidad en vivo, correo, teléfono con lada por bandera, fecha de nacimiento con el age-gate actual (mínimo 13), contraseña con medidor de fuerza (8+, mayúscula, minúscula, número, símbolo).
- **Paso 2 — Elegir abono:** mismas 4 tarjetas de nivel con sus kits y colores. Gold/Premium/Platino llevan cinta diagonal "Próximamente" sin ocultar precio ni beneficios. Al seleccionar, glow con el acento del nivel. El nivel se guarda como intención (`waitlist`; FAN se activa de inmediato).
- **Sub-paso tutor (13–17):** el formulario existente, sin cambios, entre Paso 2 y Paso 3, con la misma edge function `parental-consent-request`.
- **Paso 3 — Confirmación:** resumen de datos con botón "Editar" que regresa al paso correspondiente, previsualización real del pase con nombre y color del nivel (`FanPassPreview`), checkbox de términos y checkbox de marketing (obligatorio elegir sí/no, "no" no bloquea). Botón "Crear mi pase" (FAN) o "Unirme a la lista de espera de [Nivel]".
- **Pantalla final:** el pase armado con las opciones de compartir/exportar que ya existen.

La cuenta se crea al confirmar el Paso 3 (un solo `signUp` con toda la metadata), de modo que `handle_new_user` cree perfil y pase en una sola pasada.

## 4. Pase: reverso con dos modos

El frente no cambia. El reverso pasa a tener pestañas:

- **Estadio:** exactamente lo actual (`issue-match-qr`, HMAC, un uso, expira el día del partido).
- **Comercios (nuevo):** QR de membresía que se regenera cada 3 minutos mientras la pantalla está abierta, con anillo de progreso circular vaciándose como cuenta regresiva. Debajo, foto de perfil y nombre del titular en grande para verificación visual del empleado, más insignia de nivel y su beneficio/descuento.

Backend nuevo (extiende, no reemplaza):

- `issue-member-qr`: misma firma HMAC que `issue-match-qr`, `kind: 'member'`, sin partido, expira en 3 minutos, exige pase activo y correo verificado.
- `redeem-member-qr`: valida firma y expiración, marca el token como usado, registra `checkin` (`visit` o `consumption`) con el `location_id` del negocio, aplica el límite de un canje por pase por negocio por día y otorga XP/CC con las funciones existentes.

## 5. Portal de comercios `/comercios`

Página protegida, minimalista y de uso rápido de pie en mostrador: login con correo y contraseña (cuenta normal + rol `business`, ligada a `business_users.user_id`), botón "Escanear pase" con cámara y opción de escribir el código a mano. Al validar: foto, nombre, nivel y beneficio del titular, con botón "Confirmar canje" y confirmación/errores claros (expirado, ya canjeado hoy, pase inactivo). No comparte el sistema visual completo del sitio de fans.

## Notas técnicas

- La migración corre primero y por separado; el código que lea las columnas nuevas se escribe después de regenerar los tipos.
- Nada se elimina: `create-checkout`, `payments-webhook`, `StripeEmbeddedCheckout` y `/abonos/exito` se conservan intactos para reactivar el cobro.
- Los porcentajes de descuento quedan como datos configurables por local; en cuanto los definan se llenan sin cambiar código.

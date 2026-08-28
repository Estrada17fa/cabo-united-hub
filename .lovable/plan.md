# Unificar registro y fusionar /accesos en /abonos

Objetivo: un solo flujo de registro en todo el sitio y una sola página de niveles (`/abonos`), convertida en pre-registro de interés (lista de espera) sin cobro.

## 1. Base de datos (no destructivo)

- `profiles`: agregar `marketing_consent boolean NOT NULL DEFAULT false` y `marketing_consent_at timestamptz`.
- `fan_passes.status` es una columna de texto (hoy solo existe el valor `active`), así que no hace falta tocar ningún enum: se empieza a usar el valor `'waitlist'` y se agrega una restricción que permita `active`, `pending_payment`, `waitlist`, `expired`, `cancelled`.
- No se borra ninguna columna, tabla ni dato. `award_points`, `award_points_v2`, `compute_level` y los triggers de nivel quedan intactos.
- `handle_new_user()` sigue igual (crea el pase cuando el signup trae teléfono y fecha de nacimiento). Cuando el registro venga solo del Paso 1, el pase se crea/actualiza al completar el Paso 2.

## 2. AuthFlow: componente único de registro

Nuevo `src/components/auth/AuthFlow.tsx` que reemplaza a `AuthModal` en Header, Index, FanZone, MiPerfil y Abonos. `AuthModal` se conserva internamente como vista de "Iniciar sesión" (login + Google/Apple + olvidé mi contraseña), sin duplicar lógica.

Props: `open`, `onClose`, `mode` ("login" | "signup"), `context` ("header" | "home" | "fanzone" | "abonos"), `initialTier`, `onComplete`.

Paso 1 — Cuenta (mínima fricción)
- Nombre completo, correo, contraseña con la misma validación fuerte del wizard actual (8+, mayúscula, minúscula, número, símbolo) y su checklist en vivo.
- Botones Google / Apple tal como están hoy.
- Al enviar se crea la cuenta de inmediato (`supabase.auth.signUp`).

Paso 2 — Perfil de aficionado
- Teléfono, fecha de nacimiento (age-gate: se rechaza menor de 13), ciudad (opcional), jugador favorito (opcional, reutilizando el grid visual con foto y dorsal del wizard actual).
- Checkbox explícito de promociones por correo y WhatsApp: se debe elegir sí o no; si dice no, se guarda `marketing_consent = false` y el registro continúa.
- Guarda en `profiles` y crea/actualiza el `fan_passes` correspondiente.
- Si la edad es 13–17: se muestra el mismo sub-paso de tutor que ya existe (nombre, correo, teléfono opcional, parentesco, confirmación de mayoría de edad) y se llama a la misma edge function `parental-consent-request`. Ese bloque se extrae del wizard actual a `TutorConsentStep` sin cambiar su lógica ni su UI.
- Visibilidad del Paso 2: obligatorio cuando el registro se inicia desde Abonos o Fan Zone; desde Header y Home aparece con botón "Completar después" y se vuelve a pedir la próxima vez que el usuario intente reclamar un abono o entrar a Fan Zone (se detecta por perfil sin teléfono o sin fecha de nacimiento).

`SignupWizard` deja de usarse desde Header y Accesos; su código de picker de jugador, validación de contraseña y consentimiento de tutor se reutiliza dentro de `AuthFlow`.

## 3. Nueva `/abonos`

- Se elimina la página `Accesos` y su ruta se convierte en redirección permanente a `/abonos`. El enlace "Accesos" del menú apunta a `/abonos`.
- `/abonos` toma el diseño visual de las 4 tarjetas de nivel que hoy vive en `/accesos` (Fan/Gold/Premium/Platino con kits, beneficios y colores), sin cambios de diseño.
- Flujo al elegir un nivel:
  1. Se abre `AuthFlow` con el nivel preseleccionado (Paso 1 + Paso 2 obligatorio). Si ya hay sesión, se salta directo a lo que falte.
  2. Al confirmar: cuenta creada si no existía; el interés en el nivel se guarda con `status = 'waitlist'` y `payment_status = 'pending'`.
  3. Si el nivel es FAN (gratis), el pase se activa de inmediato (`status = 'active'`, `payment_status = 'free'`), como hoy.
  4. Pantalla de confirmación con check visual: "Ya estás en la lista para [nivel]. Te avisaremos por correo o WhatsApp en cuanto se abran los pagos." Sin mención de pagos ni checkout.
- Se dejan de usar `PaymentTestModeBanner` y `StripeEmbeddedCheckout` en este flujo (los componentes, la edge function `create-checkout`, el webhook y `/abonos/exito` se conservan intactos para reactivarlos cuando el cobro esté listo).
- Para usuarios con sesión se mantiene lo que ya funciona en `/accesos`: preview del pase, sección de boletos partido a partido, puntos de venta físicos y la card de upgrade cuando el nivel es Fan (ahora apuntando al flujo de lista de espera).

## No cambia

Sistema de diseño (Dark Bento, Poppins, dock flotante), lógica de XP / Cabo Coins / niveles, lógica del consentimiento de tutor, y ninguna otra página (Club, Index, Tienda, Fan Zone más allá del punto de registro).

## Notas técnicas

- La migración corre primero y por separado; el código que lea `marketing_consent` se escribe después de que se regeneren los tipos.
- `AuthFlow` centraliza estado con un único `useState` de paso y reusa `ForgotPasswordForm`.
- La redirección `/accesos` → `/abonos` se hace con `<Navigate replace />` en el router.

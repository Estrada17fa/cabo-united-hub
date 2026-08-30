# Arreglar el enlace de verificación de correo

## Diagnóstico

- En la base de datos hay registros de hoy que **sí** se confirmaron (varios `email_confirmed_at` con fecha de hoy) y dos que quedaron sin confirmar. Es decir, el envío funciona, pero el enlace falla de forma intermitente según dónde y cuándo se abra.
- Hoy los tres puntos de registro mandan el enlace a rutas que **no están preparadas para procesar la confirmación**:
  - `AuthFlow` y `SignupWizard` apuntan a `/mi-perfil`
  - `useAuth.signUp` apunta a la raíz `/`
  Ninguna de esas rutas lee el token del enlace ni muestra un resultado; si el token viene como parámetro (`?code=` / `?token_hash=`) simplemente se ignora y la persona ve "nada" o una pantalla que le pide iniciar sesión otra vez.
- No existe ninguna ruta de callback de autenticación en la app (revisé todas las rutas en `App.tsx`).
- Además, el campo `email_verified` del perfil no se sincroniza con la confirmación real de la cuenta, así que aunque confirmen, el perfil sigue mostrándose "pendiente".

## Qué se va a construir

1. **Página de confirmación dedicada** (`/confirmar-correo`), homologada al look del sitio, que:
   - Procesa cualquier formato de enlace que envía el backend (`code`, `token_hash` + `type`, o tokens en el hash).
   - Muestra tres estados claros: verificando, ¡cuenta verificada! (con botón para entrar a su perfil / ver su pase), o enlace inválido/expirado.
   - En el caso de enlace expirado, ofrece **reenviar el correo de verificación** ahí mismo, sin tener que volver a registrarse.
2. **Apuntar todos los registros a esa página**: `AuthFlow`, `SignupWizard` y `useAuth.signUp` usarán la misma ruta de confirmación, con la dirección pública correcta.
3. **Sincronizar el estado de verificación**: el perfil reflejará el correo verificado real de la cuenta, para que las insignias y el flujo posterior dejen de mostrar "pendiente" a quien ya confirmó.
4. **Verificación**: pruebo la ruta con enlaces válidos, inválidos y expirados, y confirmo en la base que el usuario queda como confirmado.

## Notas

- No se toca el diseño del pase, el registro en 3 pasos ni el panel de admin — solo la ruta de confirmación y los destinos del enlace.
- Esto es independiente del dominio de correo propio: sigue pendiente para el volumen de registros masivos (límite por hora), y lo podemos hacer después de este arreglo.

## Detalles técnicos

- Nueva `src/pages/ConfirmarCorreo.tsx` + ruta en `App.tsx`; usa `exchangeCodeForSession` / `verifyOtp({ token_hash, type })` según los parámetros presentes, con fallback al hash (`detectSessionInUrl`).
- `emailRedirectTo` unificado a `${window.location.origin}/confirmar-correo` en los tres puntos de registro; reenvío con `supabase.auth.resend({ type: 'signup' })`.
- Sincronización de `profiles.email_verified` con `auth.users.email_confirmed_at` mediante trigger/migración, más lectura defensiva desde la sesión en el cliente.

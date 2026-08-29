# Mi Perfil — rediseño de lanzamiento

## Diagnóstico (lo que hay hoy)

**`/mi-perfil` (`src/pages/MiPerfil.tsx`)** mezcla cosas que ya no aplican para lanzar:
- Duplica el **pase completo** (`FanPassCard`) además de un botón "Ver mi pase completo".
- Muestra **XP, Cabo Coins, barra de nivel** (`LevelProgress`) e **historial de transacciones** (`TransactionsList`) — datos de Fan Zone, que hoy es teaser.
- Muestra insignias de verificación (`VerificationBadges`) y dispara `OnboardingFlow`.
- Usa estilos genéricos (`bg-card`, `border-border`, títulos sin Space Grotesk), no el look actual del sitio.
- **No** permite editar nombre y **no** tiene cambio de contraseña.

**Piezas que ya existen y se reutilizan:**
- `MiniPassChip` (`src/components/pass/MiniPassChip.tsx`): lee el tier del pase real, colorea con `tierStyle()` y enlaza a `/mi-pase`. Si no hay sesión muestra "Quiero Mi Pase".
- `/mi-pase` **ya existe** como página del pase completo (`src/pages/MiPase.tsx`).
- `AvatarUploader` (`src/components/profile/AvatarUploader.tsx`): sube foto al bucket `avatars` y actualiza `profiles.avatar_url`.
- Auth: `useAuth()` da `user`, `profile` (incluye `display_name`, `avatar_url`), `signOut`, `refreshProfile`.
- Cambio de contraseña: **no existe un flujo para usuario ya dentro**. Sí existe `/reset-password` (por correo) que usa `supabase.auth.updateUser({ password })`, y en `AuthFlow` ya está la **lista de requisitos de contraseña** (8+, mayúscula, minúscula, número, símbolo). Se reutiliza esa misma validación con `updateUser`.
- Accesos rápidos: **no hay ruta `/boletos`**. Los boletos hoy salen a Boletomóvil (`https://www.boletomovil.com`, ya usado en Accesos). Tienda es `/tienda`.

## Qué queda Mi Perfil

Página mobile-first, `max-w-2xl`, superficies `#0D0F13` con hairline `#1F2329`, títulos en Space Grotesk, cyan solo en acciones primarias.

1. **Encabezado + mini pase**: avatar (con iniciales de respaldo), nombre y correo; debajo una tarjeta con el `MiniPassChip` reutilizado y el código de pase + nivel derivados del pase real. Si no hay pase: mensaje corto y botón a `/accesos` para obtenerlo. El mini pase enlaza a `/mi-pase`; **no** se dibuja el pase completo aquí.
2. **Datos de cuenta**: foto (`AvatarUploader`) y nombre editable (`profiles.display_name`) con guardar/cancelar; correo en solo lectura. Sin campos nuevos.
3. **Cambiar contraseña**: bloque plegable con nueva contraseña + confirmación, la misma lista de requisitos que el registro, y `supabase.auth.updateUser`. Enlace secundario "Recibir enlace por correo" que usa el `resetPassword` existente.
4. **Accesos rápidos**: Tienda Oficial (`/tienda`) y Boletos (Boletomóvil, enlace externo).
5. **Cerrar sesión**: botón claro al final (usa `signOut` de `useAuth`).

**Sin sesión**: tarjeta de acceso con el `AuthModal` ya existente (igual que hoy).

## Se quita de esta página

- XP, Cabo Coins, nivel, transacciones, insignias de verificación y el `OnboardingFlow` automático.
- El pase completo duplicado.
- Nada de notificaciones, historial de compras ni features nuevas.

## Notas técnicas

- Solo se edita `src/pages/MiPerfil.tsx` (y, si hace falta, un pequeño componente nuevo `src/components/profile/PasswordChangeCard.tsx` que solo agrupa el flujo ya existente). No se toca el pase, el header, otras páginas ni el admin.
- `LevelProgress`, `TransactionsList` y `VerificationBadges` quedan en el repo (sin borrar) para cuando Fan Zone se active.
- Validación de contraseña con la misma regla de `AuthFlow`; el botón se habilita solo al cumplir todos los requisitos y coincidir la confirmación.

## Fan Zone — Base System

Construir la base de Fan Zone (sin minijuegos), reutilizando la auth existente de Accesos y agregando perfil extendido, niveles, ledger de transacciones, onboarding e i18n.

---

### 1. Auth unificada (con Accesos)

Hoy ya existe `useAuth` + `AuthModal` + `SignupWizard` en `/accesos`. Toda la app debe leer de la **misma fuente**.

- **Reutilizar** `useAuth` (no crear nuevo contexto). Extender el `Profile` para incluir: `phone`, `birth_date`, `city`, `email_verified`, `phone_verified`, `level`, `xp`, `cc`.
- **Registro**: email + password + teléfono (ya existe en `SignupWizard`). Añadir verificación SMS OTP vía Supabase (`signInWithOtp` por phone) tras crear la cuenta.
- **Verificación email**: ya enviada por Supabase. Añadir UI "Reenviar verificación" en perfil.
- **Login social**: botones Google y Apple en `AuthModal` usando `lovable.auth.signInWithOAuth`.
- **Recuperar contraseña**: link "¿Olvidaste tu contraseña?" en `AuthModal` → flow `resetPasswordForEmail` + nueva ruta `/reset-password`.
- **Auto-confirm email**: NO activar (que verifiquen).

### 2. Perfil extendido

Página `/mi-perfil` muestra:
- Avatar (upload a bucket `avatars` o monograma "LCU" por defecto).
- Nombre, fecha nacimiento, ciudad (editables).
- Badges: email ✓ / teléfono ✓ / identidad ✓.
- Nivel actual + barra de progreso al siguiente.
- XP y CC totales (tabular).
- Badge "2× activo" si su `fan_passes.tier ∈ {premium, platino}`.
- Lista últimas 20 filas de `transactions`.

### 3. Sistema de niveles

```
Visitante         0 XP
Local           500 XP
Cabeño         2000 XP
Amo            5000 XP
Amo del Paraíso 12000 XP
Leyenda        25000 XP
```

- Columna `profiles.xp` y `profiles.level`.
- Trigger BEFORE UPDATE en `profiles`: si cruza threshold, actualiza `level` y enqueue notificación (fila en `notifications`).
- UI: componente `LevelProgress` reutilizable (FanCard ya tiene la barra; se conecta a datos reales).

### 4. Ledger de transacciones

Tabla `transactions` (append-only, sin DELETE/UPDATE policies):
- `user_id`, `type` (enum: bonus, mission, checkin, game, redeem, purchase, adjust), `xp_delta`, `cc_delta`, `source` (text), `description` (text), `created_at`.
- Función `public.award_points(_user_id uuid, _xp int, _cc int, _type tx_type, _source text, _description text)`:
  - Lee multiplicador desde `fan_passes.tier` del usuario (premium/platino = 2×, otros = 1×).
  - Inserta fila en `transactions` con deltas finales.
  - Actualiza `profiles.xp += xp_delta`, `profiles.cc += cc_delta`.
  - Trigger de niveles se dispara solo.
- RLS: usuario lee sólo sus transacciones.

### 5. Onboarding + misiones iniciales

- Componente `OnboardingFlow` (5 slides en `Dialog` full-screen): qué es XP, qué es CC, niveles, canjes, "empieza".
- Tabla `user_onboarding (user_id, completed_at)` para no repetir.
- Trigger `handle_new_user` extendido: `award_points(user, 50, 10, 'bonus', 'welcome', 'Bienvenido al Paraíso')`.
- Tabla `missions` (seed con 4 misiones iniciales) + `user_missions (user_id, mission_id, completed_at)`.
- Funciones que llaman `award_points` cuando: email verificado, phone verificado, perfil completo, primer check-in.

### 6. UI base

- Mantener tokens y FanCard ya consolidados.
- Cuando NO logueado: en FanZone, juegos primero, luego CTA sticky "Inicia sesión", luego ranking/premios. (Ya está así — sólo confirmar.)
- Cuando logueado: FanCard arriba con datos reales.

### 7. i18n

- `react-i18next` + `i18next` + `i18next-browser-languagedetector`.
- `src/i18n/index.ts`, `src/i18n/locales/es.json` (default), `src/i18n/locales/en.json`.
- Migrar los strings de FanZone, AuthModal, MiPerfil, Accesos hero. (No migrar TODA la app en este pase — sentar base + páginas tocadas.)
- Selector de idioma en Header (menú hamburguesa).

---

### Detalles técnicos

**Migraciones SQL (un solo migration):**
1. `ALTER TABLE profiles ADD COLUMN city text, xp int default 0, cc int default 0, level smallint default 0, email_verified bool default false, phone_verified bool default false, identity_verified bool default false;`
2. `CREATE TYPE tx_type AS ENUM (...);`
3. `CREATE TABLE transactions (...)` + RLS (SELECT propio, sin INSERT/UPDATE/DELETE — sólo `award_points` SECURITY DEFINER inserta).
4. `CREATE TABLE notifications (id, user_id, kind, title, body, read_at, created_at)` + RLS.
5. `CREATE TABLE missions (...)` + seed + `user_missions` + RLS.
6. `CREATE FUNCTION award_points(...) SECURITY DEFINER`.
7. `CREATE FUNCTION update_level_on_xp() SECURITY DEFINER` + trigger BEFORE UPDATE en profiles.
8. `CREATE BUCKET avatars` (público) + policies (usuario sube/edita su carpeta).
9. Extender `handle_new_user` para llamar `award_points` welcome.

**Archivos nuevos / editados:**
- `src/i18n/{index.ts, locales/es.json, locales/en.json}`
- `src/hooks/useAuth.tsx` — extender Profile, añadir signInWithOAuth helpers, resetPassword.
- `src/hooks/useFanProfile.tsx` — nuevo: trae profile + xp/cc/level + transactions + realtime.
- `src/components/auth/AuthModal.tsx` — botones Google/Apple, link forgot password.
- `src/components/auth/ForgotPasswordForm.tsx`, `src/pages/ResetPassword.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`
- `src/components/profile/AvatarUploader.tsx`, `LevelProgress.tsx`, `TransactionsList.tsx`, `VerificationBadges.tsx`
- `src/pages/MiPerfil.tsx` — refactor con todo lo anterior.
- `src/components/fan-zone/FanCard.tsx` — conectar a datos reales (`useFanProfile`).
- `src/lib/levels.ts` — definición de niveles + helpers.
- `src/App.tsx` — ruta `/reset-password`, montar i18n.
- `src/components/layout/Header.tsx` — language switcher.

**Lo que NO se hace en esta entrega:**
- Minijuegos (sólo estructura).
- Verificación de identidad (KYC) — sólo el badge/columna.
- Catálogo de canjes (redenciones).
- Notificaciones push reales (sólo persistencia + UI).

---

### Resultado

Al final el usuario podrá: registrarse con email+teléfono+OAuth, recuperar contraseña, completar onboarding, ver su perfil con avatar/nivel/XP/CC/transacciones, recibir bonus de bienvenida y misiones iniciales, y la app cambiará a inglés desde el header.

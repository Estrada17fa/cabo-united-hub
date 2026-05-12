## Objetivo

Hacer la página `/accesos` consciente del estado de sesión. El hero y secciones de boletos/puntos de venta se mantienen, pero la experiencia del medio cambia según si el usuario tiene pase o no.

---

## 1. Logged-out: CTA "Ya soy parte"

En el hero, debajo de los botones **"Quiero ser parte"** y **"Conoce los 4 niveles"**, añadir un enlace sutil (no botón pesado, para no competir con el CTA principal):

```
¿Ya tienes pase? · Iniciar sesión →
```

- Estilo: link de texto centrado, color `text-white/60` con la palabra "Iniciar sesión" en `#00abc4` y subrayado al hover.
- Acción: abre el `Dialog` de `AuthModal` ya existente (`setAuthOpen(true)`).
- Quitar el botón flotante "Ya tengo cuenta" de abajo-derecha — queda redundante y se siente como banner de cookies.

---

## 2. Logged-in: hero recortado + pase + secciones recontextualizadas

### 2.1 Hero
Mantener fondo, kicker, h1 y video. **Ocultar** los botones "Quiero ser parte" y "Conoce los 4 niveles" cuando hay sesión (no tienen sentido si ya está dentro). Reemplazar el párrafo de bienvenida por una variante más corta y personal: "Bienvenido de regreso, {display_name}. Tu paraíso te esperaba."

### 2.2 Sección "Tu pase" (reemplaza `TierCarousel` y storyMoments)

Decisión recomendada: **mostrar un preview compacto del pase + botón "Ver mi pase"** que lleva a `/mi-perfil`. Razones:
- Evita duplicar el `FanPassCard` completo (que tiene flip, QR, exportación) y el costo de mantenerlo en dos páginas.
- El preview ya existe (`FanPassMini`), solo lo agrandamos para esta página.
- El perfil sigue siendo el "home" del pase (donde están las acciones, redenciones, etc.).

Estructura de la sección:

```
┌────────────────────────────────────────────────┐
│  TU PASE                                       │
│  ┌──────────────────────────────────────────┐  │
│  │ [Crest]  AMO DEL PARAÍSO · GOLD          │  │
│  │          LCU-GEEF7                        │  │
│  │          Activo · Temporada 2025-26      │  │
│  │                                  [Ver →] │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Si tier === 'fan']                           │
│  ┌──────────────────────────────────────────┐  │
│  │ ⚡ Sube de nivel                          │  │
│  │ Estás como Fan. Desbloquea entrada al    │  │
│  │ estadio, kit oficial y experiencias.     │  │
│  │ [Ver niveles disponibles →]              │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

- Nuevo componente ligero `FanPassPreview` (o ampliar `FanPassMini` con prop `size="lg"`): mismo diseño del mini pero con padding mayor, crest 56px, código en `text-2xl`, badge tier más grande, y botón "Ver mi pase" explícito que navega a `/mi-perfil#pase`.
- El bloque de upgrade solo se muestra si `pass.tier === 'fan'`. Al click, hace scroll a un acordeón / modal con los tiers Gold/Premium/Platino reutilizando el `TierCarousel` (filtrando 'fan'), o más simple: navega a `/accesos?upgrade=1` y al detectar el query muestra el carousel debajo. Implementación elegida: **mostrar el `TierCarousel` (sin la card Fan) embebido directamente debajo, con título "Sube de nivel"**. Sin navegación extra.

### 2.3 Sección Boletomovil — copy alterno cuando hay pase

Mismo layout, copy nuevo:

- Kicker: `BOLETOS EXTRA · INVITA A LOS TUYOS`
- H3: `¿Vienes acompañado?`
- Párrafo: "Tu pase ya te garantiza tu lugar. Si quieres traer a tu pareja, tu familia o un amigo que aún no es parte, compra sus boletos para el próximo partido en Boletomóvil."
- Botón: "Comprar boletos extra"

### 2.4 Sección Puntos de venta — copy alterno cuando hay pase

- H3: `Puntos de venta físicos`
- Subtítulo: "Si prefieres efectivo o quieres ayudar a un amigo a entrar al paraíso, en estos puntos pueden comprar boletos sueltos."

---

## 3. Detalles técnicos

### Archivos a editar
- `src/pages/Accesos.tsx`
  - Importar `FanPassPreview` (nuevo) y `useAuth` ya está.
  - Bifurcar render principal según `user`:
    - Hero: ocultar bloque de botones cuando `user`; cambiar párrafo.
    - Insertar `<UserPassSection />` antes de Boletomovil cuando `user`; ocultar `storyMoments` y `TierCarousel` (excepto cuando `tier === 'fan'`, donde se renderiza filtrado debajo).
    - Pasar prop `loggedIn` a un nuevo sub-componente `<TicketsBlock loggedIn />` y `<PointsOfSale loggedIn />` para copy alterno (o simplemente leer `user` desde `useAuth` dentro).
  - Quitar floating button "Ya tengo cuenta".
  - Añadir link "¿Ya tienes pase?" en el hero (solo cuando `!user`).

- `src/components/pass/FanPassPreview.tsx` (nuevo)
  - Variante grande de `FanPassMini`. Mismo fetch de `fan_passes`. Props: `userId`, opcional `onNavigate`.
  - Muestra: crest, badge tier, "Amo del Paraíso", `pass_code`, estado, botón "Ver mi pase" → `/mi-perfil`.
  - Usa los mismos `TIER_ACCENT` que `FanPassMini`.

- `src/components/accesos/UpgradePrompt.tsx` (nuevo, opcional — puede vivir inline en Accesos)
  - Card de upgrade visible cuando `tier === 'fan'`, con CTA que hace `scrollIntoView` al carrusel filtrado.

### Sin cambios de backend
- No tocar tablas, RLS, edge functions, ni `FanPassCard`/`MiPerfil`.
- Reusar `TierCarousel` filtrando `tiers.filter(t => t.id !== 'fan')` para el modo upgrade.

### Estados a manejar
- `user` cargando: mientras `loading`, renderizar la versión logged-out (evita flash de upgrade).
- Si `user` existe pero `fan_passes` no devuelve pase (caso raro tras signup sin teléfono/fecha): mostrar fallback "Completa tu registro" → link a `/mi-perfil`.

---

## 4. Fuera de alcance

- Flujo de pago/upgrade real (Stripe) — el botón solo lleva al `SignupWizard` con tier preseleccionado, igual que hoy hace `handleSelectTier`.
- Cambios al `FanPassCard` o `MiPerfil`.
- Cambios al wizard de registro.

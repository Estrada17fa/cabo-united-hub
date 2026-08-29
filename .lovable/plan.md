# Cuenta regresiva con invitación a registrarse

## Contexto: cómo funciona hoy el en vivo

El admin pega el link de YouTube/Facebook Live en el panel y al cambiar la fase a 1T el público ve el Live Room: el video solo para usuarios con sesión, marcador y timeline abiertos. El cambio de cuenta regresiva → Live Room es automático (realtime), sin recargar.

## Cambio propuesto (solo frontend)

En `NextMatchCard` (la tarjeta de próximo partido con cuenta regresiva), agregar **solo cuando el usuario NO tiene sesión** un bloque de invitación bajo el contador:

- Texto redactado: "La transmisión en vivo es exclusiva para miembros. Crea tu cuenta gratis y estará listo cuando arranque el partido."
- Botón principal: "Crear cuenta gratis" → abre `AuthFlow` (el mismo flujo de registro de 3 pasos que ya usamos en todo el sitio).
- Link secundario: "Ya tengo cuenta" → abre el dialog con `AuthModal` en modo login.
- Si el usuario ya tiene sesión, este bloque no se muestra (la tarjeta queda exactamente como está).

## Detalles técnicos

- Se reutiliza el mismo patrón que ya tiene `StreamGate.tsx` (Dialog + `AuthModal` loginOnly + `AuthFlow`), así no se duplica lógica de auth.
- Se usa `useAuth()` para decidir si se muestra; nada cambia en la base de datos ni en el panel de admin.
- Copy y estilos siguiendo el sistema LCU: botón cyan sólido, texto secundario con subrayado, sin elementos nuevos de ornamentación.
- El bloque se coloca debajo del countdown y encima de la fecha/sede, sin mover nada más de la tarjeta.

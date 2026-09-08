# Abrir la transmisión sin registro (temporal)

## Contexto
Mientras se termina de arreglar el correo de verificación, la transmisión en vivo debe poder verse **sin crear cuenta ni iniciar sesión**. El código del gate de login se conserva intacto para reactivarlo después.

## Cambio

1. **Interruptor temporal en `StreamGate`**: agregar una constante `STREAM_OPEN = true` (bandera única, bien comentada) en `src/components/match-zone/StreamGate.tsx`.
   - Cuando está en `true`: si hay `stream_url`, el video se muestra directamente a todos, sin pedir login.
   - Cuando está en `false`: vuelve el comportamiento actual (login requerido, con el AuthFlow intacto).
2. **Texto**: sin cambios de copy; simplemente ya no aparece el bloque de "Inicia sesión o crea tu cuenta".
3. **Sin tocar**: `AuthFlow`, `AuthModal`, `StreamGate` (resto de la lógica), ni nada del arreglo de correo en curso.

## Cómo se revierte después
Cambiar `STREAM_OPEN` a `false` (una línea) cuando el correo de verificación ya funcione, y el gate de login vuelve exactamente como estaba.

## Detalles técnicos
- `src/components/match-zone/StreamGate.tsx`: la condición `embed && user` pasa a `embed && (user || STREAM_OPEN)` para el iframe y las clases del contenedor; el resto del componente no cambia.
- No requiere migración ni cambios en base de datos.

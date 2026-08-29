# Plan: Resolver "email rate limit exceeded" en el registro

## Diagnóstico (confirmado)
- El error de la captura es un **429: email rate limit exceeded** del backend de auth (visible también en los logs: varios `/signup` rechazados hoy).
- Causa: el proyecto **no tiene dominio de correo propio configurado**, así que los correos de confirmación salen con el remitente genérico compartido de Lovable, que tiene un límite por hora muy bajo (pensado para pruebas, no para producción).
- Los registros de prueba recientes agotaron ese límite; por eso "Connor Test" no pudo crear su cuenta.

## Solución
1. **Configurar el dominio de correo** con el dominio que ya es tuyo (`loscabosunited.mx` o un subdominio como `notify.loscabosunited.mx`) mediante el diálogo de configuración de email. Esto activa el envío propio del proyecto (los registros DNS se agregan/verifican automáticamente).
2. **Subir el límite de correos de auth por hora** (registros, recuperación de contraseña, magic links) una vez activo el envío — de 1 dígito a un valor razonable para producción (~100/hora).
3. **Verificar** haciendo un registro de prueba y confirmando que llega el correo de confirmación (puede requerir esperar la verificación DNS, que suele ser rápida).

## Notas
- Mientras tanto, el límite se reinicia cada hora, así que el registro volverá a funcionar solo — pero volverá a saturarse con pocos registros. La configuración del dominio es la solución real para lanzamiento.
- No se toca nada del flujo de registro, del pase ni del diseño.

## Detalles técnicos
- Herramientas: diálogo de configuración de email (email setup) + `configure_auth` con `rate_limit_email_sent`.
- Emails afectados: confirmación de registro, reset de contraseña, magic links.

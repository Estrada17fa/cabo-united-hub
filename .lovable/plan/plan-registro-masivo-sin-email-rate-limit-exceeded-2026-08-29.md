# Plan: Registro masivo sin "email rate limit exceeded"

## Diagnóstico (confirmado)
- El error de la captura es un **429: email rate limit exceeded** del backend de auth (también visible en los logs: varios `/signup` rechazados hoy).
- Causa: el proyecto **no tiene dominio de correo propio**; los correos de confirmación salen con el remitente genérico compartido, que tiene un límite por hora muy bajo (pensado para pruebas). Con registro masivo se satura en minutos.
- Para volumen real de aficionados se necesita: dominio propio de envío + límite por hora alto.

## Solución (en este orden)
1. **Configurar el dominio de correo** usando `loscabosunited.mx` (típicamente un subdominio como `notify.loscabosunited.mx`, gestionado automáticamente). Se abre el diálogo de configuración de email; tú solo confirmas — los DNS se manejan por delegación automática.
2. **Activar la infraestructura de envío del proyecto** (cola de correos con reintentos), que se configura sola al registrar el dominio.
3. **Subir el límite de correos de auth** a un volumen acorde al lanzamiento (hasta 1000/hora; sugiero 500–1000 para aguantar picos de registros el día del partido).
4. **Verificar** con un registro de prueba real una vez verificado el DNS (suele ser rápido; puede tardar hasta 72 h en el peor caso).

## Notas
- Mientras el DNS verifica, los correos siguen saliendo por el remitente por defecto con el límite bajo — conviene hacer esto cuanto antes del lanzamiento.
- No se toca el flujo de registro, el pase ni el diseño.
- Después de esto, si quieres, podemos personalizar el correo de confirmación con el branding de LCU (logo, colores) — opcional, paso aparte.

## Detalles técnicos
- Herramientas: diálogo de configuración de email + `setup_email_infra` + `configure_auth` con `rate_limit_email_sent` alto.
- Emails cubiertos: confirmación de registro, reset de contraseña, magic links.

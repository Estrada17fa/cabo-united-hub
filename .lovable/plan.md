# Mover la base de datos a Norteamérica: diagnóstico, procedimiento y riesgos

No ejecuto nada. Esto es solo el mecanismo real, los riesgos y mi recomendación honesta.

## Contexto medido (de la revisión anterior)

- Región actual: **`eu-west-3` (París, Francia)**. Instancia "Tiny", activa (no se duerme).
- Las consultas en sí son rápidas: torneo activo 6.9 ms, partidos (234 filas) 19 ms, posiciones 7.6 ms, plantel 7 ms, noticias 6.8 ms, lugares 8.2 ms, patrocinadores 6.8 ms.
- Tablas diminutas (partidos 234, plantel 30, equipos 18, noticias 1, lugares 1). Los índices no cambian nada aquí.
- Lo que se paga es **distancia**: ~150-250 ms por ida y vuelta a Francia, multiplicado por ~10 peticiones de la portada, varias **encadenadas** (partidos y posiciones esperan a que responda "torneo activo").
- Tamaño total a mover: base **17 MB**, Storage **65 archivos / 9 MB** (avatares), **61 usuarios registrados** (39 con correo confirmado).

## 1. ¿Cómo se cambia de región en Lovable Cloud?

**No existe un botón de "cambiar región" ni una herramienta que lo haga.** Postgres administrado no se "mueve" entre regiones: la instancia vive físicamente en el centro de datos donde nació. El único camino real es:

1. Crear una **instancia nueva** en la región destino.
2. **Migrar** todo el contenido: esquema, datos, usuarios de autenticación, archivos de Storage, funciones, políticas, secretos.
3. **Repuntar** el sitio a la URL y llaves nuevas.
4. Apagar la vieja cuando esté verificado.

En Lovable Cloud la región del backend la asigna la plataforma; **no la puedo elegir yo desde aquí**. Para una instancia nueva en Norteamérica hay que pedírselo al equipo de Lovable (soporte). Sin eso, el paso 1 no se puede completar y lo demás no aplica. Ese es el punto honesto que hay que resolver antes que nada.

## 2. Región destino recomendada

**`us-west-2` (Oregón)** o **`us-west-1` (California)**. Los Cabos sale a internet por la costa oeste de EE. UU.: la latencia baja de ~180-250 ms a **~30-60 ms**. `us-east` (Virginia) daría ~80-110 ms — mejor que París, pero peor que el oeste. Si hubiera opción `mx-central`, sería la ideal, pero rara vez está disponible.

## 3. ¿Habrá sitio caído?

Sí, una ventana corta pero real. Con este tamaño (17 MB + 9 MB de archivos):

- Copiar base y archivos: **10-20 min**.
- Migrar usuarios de autenticación: **5-15 min**.
- Repuntar el código y publicar: **5-10 min**.
- Verificación: **15-30 min**.

**Ventana total realista: 45-90 min**, de la cual el sitio queda inconsistente o caído unos **10-20 min** (entre el corte de escrituras y el sitio ya publicado apuntando a la instancia nueva). Se hace de madrugada, nunca en día de partido.

## 4. Qué se puede perder o romper (lista completa a migrar)

Además de las tablas:

1. **Usuarios de autenticación (61)** — lo más delicado. Los hashes de contraseña se pueden copiar solo con acceso administrativo al esquema de autenticación; si no se copian bien, **los 61 usuarios tendrían que restablecer contraseña**. Los `user_id` deben conservarse idénticos o se rompe todo lo que apunta a ellos (perfiles, pases, transacciones, roles).
2. **Archivos de Storage** — 65 avatares (9 MB) en el bucket `avatars`, más el bucket privado `team-logos`. Hay que recopiarlos con la misma ruta o **cada URL de imagen guardada en la base queda rota**.
3. **Todo el esquema no-tabla**: 47 tablas, ~20 tipos enumerados, **más de 40 funciones de base de datos** (`has_role`, `award_points`, `recalculate_standings`, `handle_new_user`, etc.), **~32 disparadores** (incluidos los del esquema de autenticación: `on_auth_user_created`, `on_auth_user_confirmed_grant_founder_admin`), **todas las políticas RLS** y **todos los `GRANT`**. Un `GRANT` olvidado deja una sección sin datos aunque la tabla esté copiada.
4. **Secretos y funciones de servidor**: 8 funciones (Stripe, QR, consentimiento) y sus secretos (`QR_SIGNING_SECRET`, tokens de Shopify, llaves de Stripe). Las llaves `SUPABASE_*` se regeneran; el resto hay que volver a capturarlas.
5. **Webhooks externos**: la URL del webhook de Stripe (`payments-webhook`) cambia; si no se actualiza en Stripe, los pagos dejan de registrarse en silencio — falla peligrosa porque no da error visible.
6. **Configuración de autenticación**: URL del sitio, redirecciones permitidas (`/confirmar-correo`, `/reset-password`), plantillas de correo, protección anti-bot.
7. **Ordenes/datos en Shopify**: no se tocan (viven en Shopify), pero el carrito y la sesión de compra sí dependen de las llaves nuevas.

Riesgo de pérdida silenciosa: **filas escritas por usuarios durante la ventana de migración** (un registro nuevo, un voto). Por eso hay que cortar escrituras (modo lectura / aviso de mantenimiento) antes de copiar.

## 5. Respaldo completo antes de empezar

1. **Base**: exportación completa desde Cloud → Ajustes avanzados → Exportar datos, más un volcado por tabla en CSV como red secundaria, guardado fuera de la plataforma.
2. **Storage**: descarga de los 65 archivos de `avatars` y todo `team-logos`, conservando las rutas exactas.
3. **Autenticación**: exportación de la lista de usuarios (id, correo, fecha de confirmación, metadatos) para poder comparar 1 a 1 después; y confirmar por escrito con soporte si los hashes de contraseña viajan o no.
4. **Definiciones**: guardar el SQL completo de esquema, funciones, disparadores, políticas y `GRANT`s en un archivo versionado.
5. **Punto de retorno**: la instancia de París **no se borra** hasta 7-14 días después de la verificación. Ese es el verdadero respaldo: revertir = volver a apuntar el código a la vieja.

## 6. Qué se actualiza en el código

Solo tres valores, en `.env` (los regenera la plataforma, no se escriben a mano):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Y fuera del código: `project_id` en la configuración de funciones, los secretos de las funciones de servidor, y la URL del webhook en el panel de Stripe.

## 7. Orden seguro y puntos de reversión

```text
0. Confirmar con soporte de Lovable que hay instancia en us-west   <- si no, se detiene aquí
1. Respaldo completo (base + archivos + usuarios + definiciones)   <- reversible
2. Crear instancia destino, vacía                                  <- reversible
3. Aplicar esquema: tablas, tipos, funciones, disparadores,
   políticas, GRANTs                                               <- reversible
4. Copiar datos y archivos de Storage                              <- reversible
5. Migrar usuarios de autenticación y verificar 61 = 61            <- reversible
6. AVISO DE MANTENIMIENTO + corte de escrituras                    <- inicia la ventana
7. Copia final incremental (lo escrito desde el paso 4)
8. Repuntar código a las llaves nuevas y publicar                  <- ULTIMO punto de retorno
9. Verificar: login, registro, pase, panel de admin, tienda,
   mapa, imágenes, pagos de prueba
10. Actualizar webhook de Stripe y secretos
11. Vigilar 7-14 días; recién entonces apagar París
```

**Reversión**: en cualquier punto hasta el 8, se abandona la instancia nueva y no pasó nada. Después del 8, se revierte volviendo a apuntar el código a París (5-10 min), **pero** se pierde lo que los usuarios escribieron en la instancia nueva mientras estuvo activa. De ahí en adelante la reversión ya es costosa.

## Mi recomendación honesta

**Hoy no lo haría.** Razones concretas:

- El beneficio real es de **~200 ms por petición**. Con la caché y el desencadenamiento del plan anterior (menos viajes, datos servidos al instante en la segunda visita), el usuario percibe una mejora **mayor** que esos 200 ms, con **riesgo cero**.
- El riesgo concentrado está en los **61 usuarios registrados con contraseña** y en el **webhook de Stripe**: si los hashes no viajan, 61 personas pierden acceso; si el webhook no se actualiza, los pagos fallan sin avisar. Ambas son roturas visibles para tu público.
- Depende de que **soporte de Lovable** provisione la región; no es algo que yo pueda ejecutar aquí.

**Orden que sí recomiendo:**

1. Aplicar el plan de velocidad de datos (caché entre visitas, romper el encadenamiento, columnas explícitas). Riesgo bajo, ganancia grande e inmediata.
2. Medir de nuevo desde Los Cabos con datos reales.
3. Si después de eso la latencia de París sigue molestando de verdad, **entonces** planear la mudanza — idealmente **antes** de que crezcan mucho los usuarios registrados, porque cada usuario nuevo hace más caro y riesgoso el paso 5. Si vas a mudarte algún día, conviene hacerlo pronto, no con 5.000 usuarios.

Alternativa intermedia sin mudanza: caché agresiva en el navegador para el contenido editorial (plantel, noticias, lugares, patrocinadores — casi nunca cambia) y datos precalculados para la liga, de modo que la portada casi no dependa de viajes a Francia. Eso cubre el 80% del beneficio de la mudanza.

**Dime cuál camino quieres y lo dejo listo. No ejecuto nada de la mudanza sin tu confirmación explícita.**

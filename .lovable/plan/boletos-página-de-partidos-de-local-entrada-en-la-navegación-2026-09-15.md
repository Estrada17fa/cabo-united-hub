# Boletos: página de partidos de local + entrada en la navegación

## Diagnóstico

**¿Dónde está hoy la página de Boletos y por qué está oculta?**
- Existe la página `/accesos` (registrada en las rutas), pero no aparece en la barra de navegación: la lista de la navbar solo tiene 6 secciones (Inicio, Match Zone, Tu Club, Fan Zone, Visita Los Cabos, Tienda). Por eso está "oculta": solo se llega desde Mi Perfil.
- Esa página no es realmente una página de boletos: es la página de abonos/pases por nivel, con un bloque genérico "Comprar en Boletomóvil" que apunta a `boletomovil.com` (la home, no a un partido), un "próximo partido en casa" **escrito a mano** (Rival FC, Dom 27 Abr, "Desde $150 MXN") y una lista de **puntos de venta inventados en código**.
- El botón "Boletos" que hay hoy en Mi Perfil también manda directo a `boletomovil.com`, no a una página del sitio.

**¿Existen los partidos en el admin de Torneo?**
Sí. En el torneo activo (2026) hay 28 jornadas capturadas con local/visitante, fecha, sede y la marca "nuestro equipo". Los partidos de local de LCU se juegan en ESTADIO DON KOLL (jornadas 2, 4, 6, 10, 12, 15, 17, 19, 21, 23…). Hoy **ningún partido tiene link de boletos capturado** (el campo está vacío en todos).

**Admin: el campo ya existe.** La ficha de edición de partido ya tiene "Link de boletos" y se guarda en el partido. No hay que construir nada nuevo en el admin; solo hay que capturar los links. (Si quieres, lo dejo más visible/validado como URL.)

## Lo que haré

### 1. Página nueva `/boletos`
Con el look del sitio (fondo #060708, hairline, cyan disciplinado, Inter + Space Grotesk para fechas y jornada):
- Encabezado corto: "Boletos" + "Partidos de local en el Paraíso".
- **Lista de partidos de local** de LCU del torneo activo (solo donde LCU es el equipo local), leídos de los mismos partidos del admin. Cada tarjeta: escudo LCU vs escudo rival, nombre completo del rival, jornada, fecha y hora local (UTC-7), sede.
- Botón **"Comprar boletos"** por partido, que abre el link de ese partido en pestaña nueva.
- Si el partido no tiene link: en lugar del botón, una etiqueta discreta **"Próximamente"** (nada clicable ni roto).
- Orden por fecha, próximos primero. Los partidos ya jugados se agrupan al final bajo "Partidos anteriores", sin botón de compra.
- Estados de carga y vacío del mismo tamaño (sin saltos), como en el resto del sitio.
- **Puntos de venta físicos**: bloque con estado "Próximamente" limpio, sin inventar direcciones, listo para llenarse después.

### 2. Navegación
- Agrego "Boletos" a la barra de escritorio: 7 secciones caben ajustando el espaciado y usando etiquetas cortas cuando el ancho aprieta ("Tienda" en lugar de "Tienda Oficial"), sin encimarse.
- En móvil la barra sigue con 6 iconos y **Boletos entra en el menú de hamburguesa**, junto con las demás entradas.
- El botón lleva a `/boletos`, nunca directo a Boletomóvil.

### 3. Admin
- Dejo el campo "Link de boletos" del partido como única captura, con ayuda breve ("pega aquí el link de Boletomóvil de este partido") y validación de URL.

No toco otras páginas: `/accesos` (abonos y pases) se queda igual.

## Detalles técnicos
- Nueva ruta lazy `/boletos` en `src/App.tsx` + `src/pages/Boletos.tsx`.
- Datos vía `useMatches()` / `useActiveSeason()` existentes (una sola fuente: tabla de partidos, campo `tickets_url`); filtro `home_team.is_ours`.
- Reutilizo `Crest`, `SectionHeader`, `LcuButton` y el formato de fecha ya usado en Match Zone.
- Header: agregar el item con `shortName` y ocultarlo del grid móvil (`hidden sm:flex`) + entrada en el drawer.
- Enlaces externos con `target="_blank" rel="noopener noreferrer"`.

## Duda para confirmar
La página nueva vivirá en `/boletos` y `/accesos` (abonos/pases) se queda tal cual. Si preferías que "Boletos" reemplace a `/accesos`, dime y lo ajusto.

# Formularios de marca y contacto + compra con sesión

## 1. Comprar solo con sesión (Tienda)
- El botón "Pagar con Shopify" del carrito y "Agregar al carrito" en la ficha de producto piden sesión: si no hay usuario, se abre el modal de acceso en lugar de continuar.
- Aviso claro: "Inicia sesión para comprar" y, tras entrar, la acción continúa donde quedó.
- El catálogo y las fichas siguen siendo públicos (solo se protege comprar/checkout).

## 2. Ocultar Google y Apple
- Se dejan de mostrar los botones de Google y Apple en el modal de acceso.
- El código de OAuth se conserva intacto (solo oculto) para reactivarlo después.

## 3. Formulario único de marcas (Patrocinios + "Quiero aparecer en el mapa")
Un solo formulario reutilizado en la página de Patrocinios y en Visita Los Cabos, con un campo de interés (patrocinio / aparecer en el mapa / ambos).

Campos: nombre del negocio o marca, categoría/giro, contacto (nombre, puesto), correo, teléfono/WhatsApp, sitio web, Instagram/Facebook, ciudad y dirección, descripción de la marca, qué busca del club, presupuesto aproximado (rango, opcional), cómo nos conoció, y aceptación de aviso de privacidad.

## 4. Formulario de Contáctanos
Campos: nombre, correo, teléfono (opcional), asunto (lista: general, prensa, equipo juvenil, tienda/pedidos, otro) y mensaje.

## 5. Quitar Boletos del menú
- Se retira el enlace "Boletos" del menú hamburguesa. La ruta sigue existiendo, solo no se muestra.

## 6. Panel de admin
Dos secciones nuevas:
- **Solicitudes de marca**: lista con estado (nueva / en contacto / aprobada / descartada), notas internas, ver todos los datos, exportar CSV.
- **Mensajes de contacto**: lista con estado leído/atendido y detalle del mensaje.
Ambas con contador de pendientes.

## Detalles técnicos
- Nuevas tablas `brand_leads` y `contact_messages` con timestamps, `status`, `admin_notes` y trigger de `updated_at`. Grants + RLS: `INSERT` permitido a `anon` y `authenticated` (envío público), `SELECT/UPDATE/DELETE` solo para admin vía `is_admin(auth.uid())`. Sin lectura pública para no exponer datos de contacto.
- Validación con `zod` en cliente (largos máximos, email válido, trim) más límites de longitud en columnas; honeypot simple anti-spam.
- Componentes: `BrandLeadForm` (usado en `Patrocinios.tsx` y en un bloque/CTA en `ConoceLosCabos.tsx`), `ContactForm` en `Contacto.tsx`. Hooks `useBrandLeads` / `useContactMessages` para el admin.
- Tienda: gate de sesión en `CartDrawer.tsx` y `TiendaProducto.tsx` usando `useAuth`, reutilizando el modal de acceso existente.
- Header: se elimina `ticketsLink` del render del menú; `AuthModal` deja de renderizar el bloque social (código comentado/flag `SHOW_SOCIAL_AUTH = false`).
- Secciones de admin registradas en `AdminShell.tsx` con carga lazy, mismo look del panel.

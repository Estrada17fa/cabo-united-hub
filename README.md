# loscabosunited.mx

Crea una web app deportiva pero minimalista (principalmente para móvil, pero también para escritorio) en español para Los Cabos United.

Define el sistema de diseño global y el lenguaje visual para una web app "mobile-first". No llenes las páginas todavía, solo establece las reglas visuales, la tipografía y la paleta de colores que se aplicarán en toda la aplicación.

Tech Stack: React, Tailwind CSS, Lucide React Icons.

Tipografía (Cumplimiento Estricto):

Familia Tipográfica: Usa 'Poppins' para TODOS los elementos de texto (títulos, cuerpo, botones).

Jerarquía: Usa pesos "bold" (negrita) o pesados para los encabezados para crear impacto, y pesos regulares/medios para el texto del cuerpo para facilitar la lectura.

Paleta de Colores (Solo Modo Oscuro):

Fondo de la App: Negro Profundo/Gris (#050505). El lienzo principal debe ser muy oscuro.

Superficie de las Tarjetas: Gris Oscuro (#121212). Usado para los contenedores tipo "Bento" para separarlos del fondo.

Bordes de Tarjetas: Bordes oscuros muy sutiles (#2A2A2A) para dar definición.

Color Primario de Marca (Azul): #00abc4. Úsalo para los botones principales de llamada a la acción (CTA), iconos de navegación activos y resaltados principales.

Color Secundario de Marca (Rosa): #f298c0. Úsalo para acentos, etiquetas, resaltados secundarios o gradientes sutiles.

Color de Texto: Blanco (#FFFFFF) para el texto principal, y Gris Claro (#A0A0A0) para texto secundario/etiquetas.

Filosofía de Layout y Componentes ('Dark Bento Modular'):

Tarjetas Flotantes: Todo el contenido debe estar contenido dentro de tarjetas flotantes y distintas. Nada debe tocar los bordes absolutos de la pantalla.

Esquinas Redondeadas: Usa esquinas grandes y modernas para todas las tarjetas y botones (ej. rounded-3xl o rounded-2xl de Tailwind).

Espaciado: Usa un espacio negativo generoso (padding y margin) para que los elementos respiren.

Estilo de Navegación: La navegación inferior debe ser un 'Floating Dock' (Muelle Flotante). Debe ser un contenedor en forma de píldora que flote ligeramente por encima del borde inferior de la pantalla y contenga los iconos de navegación. NO debe ser una barra sólida pegada al fondo.

Roles: Habrá 2 roles: Club (Admin) y Fan (Usuario).

Páginas: Solo crea las siguientes páginas y ponlas en una barra de navegación superior (Tipo pagina web, pero moderna con iconos minimalistas) para tener acceso rápido, no las llenes de contenido aún:

Inicio
Club
Quiniela
Liga
Tickets
Tienda

En la parte superior con el menu de navegacion, del lado izquierdo pon un escudo (que mas adelante cambiaremos por el del equipo) y del lado derecho un menu de hamburguesa desplegable con las paginas vacias de "Perfil" y "Noticias"

Hasta abajo de todo en todas las paginas (debe ser fijo al pie de pagina, por lo que si se agrega mas info a la pagina, se quede hasta abajo) un carrusel para los logos de los patrocinadores

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e49c35ac-eda9-420a-8e49-cf35396d2a3c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

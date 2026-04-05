
## Plan: rehacer la animación móvil para que la pleca empuje los iconos sin estirarlos

### Problema actual
El estiramiento sigue pasando porque la opción activa todavía cambia su tamaño “desde adentro” y el icono sigue participando visualmente en esa transición. Además, la pleca actual se percibe como un elemento que viaja de una pestaña a otra, no como una que se abre desde el centro.

### Enfoque nuevo
Voy a cambiar la estructura de `MobileNav` para separar por completo estas 3 cosas:

1. **Icono** = bloque fijo, nunca escala ni cambia de tamaño  
2. **Pleca azul** = capa animada independiente  
3. **Texto** = contenido que aparece dentro de la pleca, sin empujar al SVG

Con esto, la pleca será la que genere el espacio y desplace a los demás iconos, mientras los iconos solo acompañan el movimiento de posición.

### Cambios en `src/components/layout/Header.tsx`

#### 1) Quitar la lógica de “pleca viajando”
- Dejar de depender del `layoutId` actual que hace que la pleca se mueva lateralmente entre tabs
- En su lugar, cada tab tendrá su propia pleca local

#### 2) Hacer que la pleca se abra desde el centro
- La pleca azul se animará con origen al centro (`origin-center`)
- Su ancho crecerá hacia ambos lados al activarse
- El cierre también ocurrirá hacia el centro, para que no parezca que corre de izquierda a derecha

#### 3) Convertir cada item en un “shell” de posicionamiento
- El botón exterior solo animará **posición** dentro de la fila
- El icono irá dentro de un contenedor rígido (`w/h` fijos, `shrink-0`)
- El contenedor exterior ya no podrá deformar visualmente el SVG

#### 4) Mover el crecimiento visual a una capa interna
- La pleca y el label vivirán en un wrapper interno separado del icono
- Ese wrapper será el que expanda el ancho visible
- Los iconos vecinos se moverán porque el item activo ocupa más espacio, no porque los iconos se compriman o estiren

#### 5) Evitar el efecto “cortado”
- Quitar `overflow-hidden` del botón exterior
- Dejar el recorte solo en la capa interna de la pleca/texto
- Así la apertura no se verá truncada durante la transición

#### 6) Sincronizar apertura y desplazamiento
- Mantener `LayoutGroup`
- Usar la misma transición para:
  - expansión de la pleca
  - aparición del texto
  - reposicionamiento de iconos vecinos
- Así la apertura y el corrimiento suceden al mismo tiempo, con una sensación más fluida

### Resultado esperado
- El icono activo ya no se verá estirado
- La pleca azul se abrirá desde el centro
- Los iconos laterales solo se desplazarán, sin deformarse
- La animación dejará de verse cortada
- El menú móvil se sentirá más limpio, moderno y “premium”

### Detalle técnico
La clave será cambiar de este modelo:

```text
botón que cambia de tamaño -> icono participa en el resize
```

a este:

```text
icono fijo + pleca interna que expande + botón solo reposiciona
```

Si hace falta, también definiré un ancho expandido estable para cada label (o lo mediré una vez) para evitar saltos cuando el texto entra y asegurar que la pleca abra suave y consistente.

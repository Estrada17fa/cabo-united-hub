
# Match Zone: timeline responsive por dispositivo

## Qué se va a corregir

La línea del tiempo en Match Zone quedará así:

- **Móvil (<768px):** seguir usando la versión **vertical**
- **Tablet y PC (>=768px):** usar una versión **horizontal**
- En horizontal se verán **solo los iconos** sobre la línea
- Al **hacer clic en un icono**, se abrirá una ficha con la información del evento:
  - minuto
  - tipo de evento
  - jugador
  - equipo

## En qué partes se aplicará

No solo en la card nueva del partido en vivo. También en cualquier vista de Match Zone donde se muestre timeline para evitar que en unas vistas siga vertical y en otras no.

Se aplicará en:
- `LiveMatchPlayer.tsx`
- `MatchHeroCard.tsx`

## Implementación propuesta

### 1. Crear un timeline responsive reutilizable
Crear un componente contenedor, por ejemplo `ResponsiveMatchTimeline`, que decida qué renderizar según el ancho:

- `MatchTimeline` para móvil
- `HorizontalMatchTimeline` para tablet/desktop

Usará el hook existente:
- `useIsMobile()` de `src/hooks/use-mobile.tsx`

Esto evita duplicar lógica en varias cards.

### 2. Mejorar `HorizontalMatchTimeline`
La versión horizontal se ajustará para desktop/tablet con este comportamiento:

- solo iconos sobre la línea
- eventos del local arriba / visitante abajo
- sin texto fijo visible debajo de cada icono
- cada icono será clickeable
- al clic, se abrirá un `Popover` con el detalle del evento

Se aprovechará el componente UI ya existente:
- `src/components/ui/popover.tsx`

### 3. Popover de detalle del evento
Cada icono mostrará una ficha compacta con:

```text
45' · GOL
Jugador: Juan Pérez
Equipo: Club Local
```

Detalles visuales:
- fondo oscuro `#121212`
- borde/acento con el color del evento
- tipografía Poppins
- tamaño compacto para no tapar demasiado la card

### 4. Mantener móvil como está
La versión vertical actual ya funciona mejor en pantallas angostas porque muestra la información sin apretar el layout.

Por eso en móvil:
- se conserva `MatchTimeline`
- no se cambia la interacción principal
- sigue legible y natural en scroll vertical

### 5. Evitar choques si hay muchos eventos
En horizontal, si hay muchos eventos muy juntos:
- se mantendrá el posicionamiento por minuto
- se ajustará el alto/espaciado para que local y visitante tengan carriles claros
- si hace falta, se permitirá un leve `overflow-x` dentro del área del timeline para que no se amontonen los iconos

## Archivos a modificar

- `src/components/match-zone/HorizontalMatchTimeline.tsx`
- `src/components/match-zone/LiveMatchPlayer.tsx`
- `src/components/match-zone/MatchHeroCard.tsx`

## Archivo nuevo recomendado

- `src/components/match-zone/ResponsiveMatchTimeline.tsx`

## Resultado esperado

En Match Zone:
- **móvil:** timeline vertical con texto visible
- **tablet y desktop:** timeline horizontal, más limpia y compacta
- los eventos se consultan tocando/clickeando el icono, sin alargar verticalmente la card

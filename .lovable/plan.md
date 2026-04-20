

## Reducir el scroll en móvil de `/club` sin cambiar el look

En móvil (390px), las cards se apilan en una columna y suman ~2,200px de scroll. La estrategia: **compactar alturas, colapsar contenido secundario y agrupar cards relacionadas en tabs internos** — todo solo en breakpoint `< md`. Tablet y desktop quedan idénticos.

### Cambios (solo `src/pages/Club.tsx`)

**1. Hero "ADN Cabeño"**
- `min-h-[320px]` → `min-h-[220px] md:min-h-[320px]`
- Descripción con `line-clamp-3 md:line-clamp-none` + botón inline "Leer más" que expande
- Timeline de hitos: tarjetas más pequeñas en móvil (`min-w-[64px]`)

**2. "Tu Estadio"**
- `min-h-[320px]` → `min-h-[160px] md:min-h-[320px]`
- En móvil queda como banner compacto (chip + título + ubicación)

**3. "Nuestro Plantel" (la card más pesada)**
- "Amo del Partido": en móvil layout vertical compacto, stats en chips inline pequeños
- Grid de jugadores: en móvil mostrar **solo 4** con `useState` y botón "Ver todos (N)" para expandir
- Tabs de posiciones: sin cambio (ya tienen scroll horizontal)

**4. "Academias"**
- Las 3 categorías en móvil pasan a layout horizontal compacto (icon + nombre + `line-clamp-1`)
- Botón "Inscribe a tu hijo" + chip "Cursos verano" en una sola fila

**5. "Desde el Vestuario" + "La Afición en vivo"**
- En móvil: una sola card con 2 tabs internos ("Vestuario" / "Afición"), altura fija ~340px
- En `md+`: se renderizan separadas como ahora (sin cambio visual)
- Esto elimina ~340px de scroll de un solo golpe

### Resultado esperado en móvil (390×844)

```text
Antes (~2,200px scroll)        Después (~1,150px scroll)
─────────────────────         ─────────────────────
Mini posición  ~50            Mini posición  ~50
ADN Cabeño     ~340           ADN Cabeño     ~240  (-100)
Estadio        ~320           Estadio        ~170  (-150)
Plantel        ~520           Plantel        ~360  (-160)
Academias      ~360           Academias      ~220  (-140)
Vestuario      ~340  ┐        Vest+Afición   ~360  (-320)
Afición        ~360  ┘        (tabs)
```

Reducción aproximada: **~50% menos scroll en móvil**, sin tocar tipografías, colores, bordes, gradientes, animaciones ni el layout en tablet/desktop.

### Detalles técnicos

- Solo se modifica `src/pages/Club.tsx`
- Se añaden 2 `useState` (expandir jugadores, tab móvil Vestuario/Afición)
- Todos los cambios usan prefijos `md:` para preservar el desktop intacto
- Sin cambios en colores, fuentes, animaciones ni estructura de datos


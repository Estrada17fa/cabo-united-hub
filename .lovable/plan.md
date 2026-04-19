

El usuario quiere otra opción de rediseño para la card "Temporada actual", distinta a la de scoreboard con field stripe que propuse antes. Voy a proponer un concepto totalmente diferente.

## Opción B — Card estilo "Jersey / Dorsal"

En vez de un scoreboard horizontal, la card se siente como la **espalda de una camiseta** o una **placa metálica de vestidor**: vertical, con jerarquía clara, número grande protagonista y stats secundarios alineados en una banda inferior.

### Concepto visual

```text
┌──────────────────────────────────────┐
│ [escudo LCU]              LIGA       │
│                          PREMIER     │  ← header limpio, logos en esquinas
│                          [logo]      │
│ ─────────────────────────────────── │
│                                      │
│            3°                        │  ← número HERO gigante (60-72px)
│       POSICIÓN ACTUAL                │     centrado, tabular-nums
│                                      │
│ ─────────────────────────────────── │
│                                      │
│   18  ·  W12 E3 D3  ·  32           │  ← banda inferior tipo
│   PJ      RECORD       GF            │     "ficha estadística"
└──────────────────────────────────────┘
```

### Diferencias clave vs propuesta anterior

- **Una stat protagonista** (Posición = 3°) en tamaño gigante, no tres stats iguales compitiendo
- **Header asimétrico**: escudo grande a la izquierda, logo Liga Premier pequeño arriba a la derecha (jerarquía clara)
- **Banda inferior tipo "ficha"**: PJ · Record (W-E-D) · Goles, separados por puntos `·`, todo en una sola línea con tipografía pequeña uppercase tracking-wide
- **Sin chip "TEMPORADA"**, sin field stripe, sin iconos lucide — más minimalista, más editorial
- **Acento verde** solo en el número hero (text-green) y en una línea horizontal divisoria muy fina

### Cambios técnicos

Solo se modifica `StatsCard` en `src/pages/Club.tsx` (líneas ~301-334):

- Header con `flex justify-between items-start`: escudo h-12 a la izquierda, logo Liga Premier h-6 a la derecha
- Divisor horizontal `border-t border-white/5`
- Bloque central: número `text-6xl md:text-7xl font-extrabold tabular-nums text-[hsl(142_76%_55%)]` + label `text-xs uppercase tracking-[0.2em] text-muted-foreground` debajo
- Banda inferior: `flex items-center justify-center gap-3 text-[11px] uppercase tracking-wider`, con `·` como separador y stats inline (número + label pequeño al lado)
- Mantener `CardShell`, paleta, border-radius y responsive del Bento

### Archivos modificados

- `src/pages/Club.tsx` — solo función `StatsCard`


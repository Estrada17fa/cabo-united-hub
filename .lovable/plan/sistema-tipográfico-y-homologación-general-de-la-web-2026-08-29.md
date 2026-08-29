# Sistema tipográfico y homologación general de la web

## Diagnóstico

- La app ya usa Poppins en todo (cargada con pesos 400/500/600/700/800), pero los pesos se usan sin disciplina: hay **226 `font-bold`, 143 `font-semibold`, 104 `font-extrabold`, 52 `font-medium`** repartidos arbitrariamente. Los números hero usan `font-black` (900) que **ni siquiera está cargado**, así que el navegador lo simula.
- El espaciado tampoco es consistente: conviven `space-y-1.5/2/2.5/3/3.5/4/5/6` sin regla clara.
- Decisión de UX: en lugar de editar ~530 clases a mano (riesgoso e interminable), defino la escala en **clases semánticas de utilidad** y homologo los componentes base (`ui-lcu`, headers, tarjetas) que ya concentran la mayoría del texto. El resto se normaliza con reglas simples de sustitución (extrabold/black → bold, medium → regular/semibold según contexto).

## Reglas tipográficas (nueva norma del sitio)

| Rol | Peso Poppins | Clase semántica |
|---|---|---|
| Títulos (H1–H3, números hero, marcadores) | **Bold 700** | `.text-display-*`, `.text-headline`, `.num-hero` |
| Subtítulos, chips/tabs, nombres de página, labels | **Semibold 600** | `.text-subtitle`, `.text-chip` |
| Texto largo, detalles, descripciones | **Regular 400** | `.text-body`, `.text-detail` |

- Se elimina el uso de `font-extrabold` (800) y `font-black` (900): títulos pasan a 700. `font-medium` (500) solo sobrevive en labels muy pequeños donde 400 se lee débil; por defecto se migra a 400/600.

## Cambios

1. **Tokens en `index.css`**: redefinir las utilidades de tipografía existentes y nuevas:
   - `.text-display-xl/lg/md` y `.num-hero` → `font-bold` (700) en vez de extrabold/black.
   - `.text-subtitle` (semibold, tamaños sm–lg), `.text-chip` (semibold, uppercase, tracking) para chips/tabs/eyebrows.
   - `.text-body` y `.text-detail` en regular 400.
   - Ajustar `index.html` para cargar solo los pesos necesarios (400;600;700) — descarga más ligera.

2. **Escala de espaciado homologada** (documentada en `index.css` como comentario guía):
   - Entre label y su título: `4px` · dentro de tarjeta: `12px` · entre bloques de una sección: `16–20px` · entre secciones de página: `24–32px`.
   - Componentes base (`SectionHeader`, `BentoTile`, `MatchCard`, `HeroCard`, `LcuTabs`, `LiveBadge`) se ajustan a esta escala.

3. **Homologación por componentes base** (el grueso del impacto visual):
   - `ui-lcu/*` (SectionHeader, BentoTile, MatchCard, Crest, LiveBadge, LcuTabs, LcuButton, HeroCard).
   - `match-zone/*` (LiveHero, MatchTimelineV2, LeagueTables, StandingsTable, etc.).
   - Layout global (`Header`, menú hamburguesa, `SponsorCarousel`) y encabezados de páginas (`SectionHeader` ya centraliza esto).

4. **Páginas restantes** (Fan Zone, Tienda, Accesos, Mi Pase, Club, etc.): sustitución sistemática de pesos — `font-extrabold/font-black` → `font-bold` en títulos; `font-semibold` se conserva solo en subtítulos/chips/nombres de página; cuerpos y detalles a `font-normal`. Sin tocar layout ni lógica.

5. **Memoria del proyecto**: guardar estas reglas tipográficas/de espaciado para que toda página futura las respete.

## Verificación

- Recorrido visual (Playwright, viewport móvil) por Match Zone, Fan Zone, Tienda y Mi Pase comparando jerarquía título/subtítulo/cuerpo.
- `rg` final para confirmar que no quedan `font-extrabold`/`font-black` fuera de casos justificados.

## Notas técnicas

- Sin cambios de base de datos, auth ni lógica: solo CSS y clases de presentación.
- Google Fonts pasa de 5 pesos a 3 (400/600/700): mejora de rendimiento.

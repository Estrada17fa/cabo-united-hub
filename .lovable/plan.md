## Goal

Make the section titles on the Inicio page feel editorial, premium and consistent — without touching layout, data, or other pages.

Only `SectionHeader` inside `src/pages/Index.tsx` is changed. All sections (Match Zone, Tu Club, Fan Zone, Tienda Oficial, Visita Los Cabos) automatically inherit the new look.

## Visual direction

A magazine-style header that combines:

- A cyan accent eyebrow (kept, refined)
- A large display title with a subtle stacked accent
- A thin underline that sits under the title
- A pill-shaped "Ver todo" link aligned to the right baseline

```text
━━  EYEBROW
TITULO DE LA SECCION
─────────────                       Ver todo  ›
```

## Changes

### 1. Eyebrow
- Slightly smaller and tighter (10px, tracking 0.24em)
- Uppercase, bold, accent color
- Keep the short cyan line before the text but add a tiny dot after for rhythm

### 2. Title
- Display weight 800, `clamp(32px, 4.5vw, 52px)`
- Letter-spacing `-0.035em`, line-height `1`
- White by default, with a soft cyan-to-white gradient on the first word only (using `bg-clip-text`) to add personality without noise
- Add a 2px accent underline (28px wide) directly under the title baseline, using the cyan accent at 80% opacity

### 3. "Ver todo" link
- Convert from plain text into a subtle pill: `border border-white/15`, `rounded-full`, `px-3 py-1.5`
- Hover: border becomes accent cyan, text turns white
- Chevron stays, slightly smaller (14px)
- Vertically aligned to the title baseline

### 4. Spacing
- `mb-5` (was `mb-4`) for a touch more breathing room before the section content
- Title and eyebrow gap reduced from `mb-1.5` to `mb-2` for cleaner stack

### 5. Accessibility
- `<h2>` semantics preserved
- Gradient text falls back to white when unsupported

## Out of scope

- No changes to section order, grids, cards, or content
- No changes to `SectionDivider`, hero, or page-level gap
- No changes to other pages or global styles

## Files

- `src/pages/Index.tsx` — only the `SectionHeader` component

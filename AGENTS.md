# Project architecture rules

- Keep store classification and URL filter logic in `Tienda.tsx`/`store-types.ts`; visual store navigation components receive derived data only, so Shopify mapping remains independent from presentation.
- Resolve store line covers through `import.meta.glob` plus a line-to-path map, so optional uploaded cover files can appear without changing navigation logic.
# Project architecture rules

- Keep store classification and URL filter logic in `Tienda.tsx`/`store-types.ts`; visual store navigation components receive derived data only, so Shopify mapping remains independent from presentation.
- Store line covers and hero slides are admin-managed rows (`store_line_covers`, `shop_hero_slides`); `Tienda.tsx` passes covers to `StoreLineTiles`, which falls back to the first catalog image, so content changes need no deploy.
- Store media uploads go through `STORE_MEDIA_BUCKET` in `src/lib/store-media.ts`, so switching to the dedicated `tienda` bucket is a one-line change.
- All on-screen text derived from Shopify tags/Type goes through `formatTagLabel` (store-types.ts); internal values and URLs stay lowercase.
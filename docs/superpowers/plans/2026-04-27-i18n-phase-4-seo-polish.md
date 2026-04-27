# i18n Phase 4 — SEO polish + verification

**Date:** 2026-04-27
**Status:** Code changes done; manual verification pending.

## Code changes (done)

1. **`app/[locale]/layout.tsx`** — removed EN-only `noindex,nofollow` half-translated guard. EN routes now indexable by default (Phase 2 + 3 closed; translations complete).
2. **`app/[locale]/cookies/page.tsx`** — fixed bug where ES and EN `alternates.languages` both pointed to `/cookies` (no `/en` prefix on EN). Now emits proper hreflang.
3. **`app/sitemap.ts`** — added `/cookies` ↔ `/en/cookies` entry.
4. **`src/shared/i18n/components/language-switcher.tsx`** — fires GA4 `language_switch` event with `{ from, to, variant }` on every switch.

## Manual verification (user actions)

These cannot be done from code; do them after deploying to prod.

### GSC
- [ ] Add `https://athlextraining.com/` and `https://athlextraining.com/en/` as separate properties in Google Search Console.
- [ ] Submit single sitemap (`/sitemap.xml`) under each property.
- [ ] Wait 24–48h, then check **International Targeting** tab → "Language" subtab. Should report 0 hreflang errors.
- [ ] Use the URL inspection tool on `/en` and `/en/training` to confirm Google sees them as indexable.

### Lighthouse
- [ ] Run Lighthouse SEO audit on these 5 EN pages (target ≥ 95):
  - `/en`
  - `/en/what-is-athx`
  - `/en/privacy`
  - `/en/terms`
  - `/en/cookies`

### Title/description audit
Already implemented per page. Spot-check in browser DevTools (`<head>`):
- Each EN page has `<title>` and `<meta name="description">` distinct from ES.
- `<link rel="canonical">` points to itself (NEVER cross-canonical EN→ES).
- `<link rel="alternate" hreflang="es">`, `hreflang="en">`, `hreflang="x-default">` present.

### GA4
- [ ] Confirm `language_switch` event flows into GA4 (Realtime → Events) after clicking the switcher.

## Success criteria (from spec §14)

- ✅ Zero ES URL changes
- ⏳ `/en/*` returns localized content with valid hreflang back to ES counterpart (verify in GSC)
- ⏳ GSC International Targeting reports no hreflang errors
- ⏳ Lighthouse SEO ≥ 95 on top 5 EN pages
- ⏳ German/French/Italian visitors auto-route to EN (already implemented in `proxy.ts`; verify with browser Accept-Language override)
- ✅ Switcher round-trips correctly (uses next-intl `useRouter` + `usePathname`)

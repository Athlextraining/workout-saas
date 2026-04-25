# i18n (ES + EN) with SEO — Design

**Date:** 2026-04-25
**Scope:** Full bilingual support (Spanish default + English) across marketing, app UI, DB-stored content (workout templates, emails), with location-aware SEO best practices.

---

## 1. Goals

- Add English alongside existing Spanish without disturbing current ES SEO equity.
- Best-practice SEO per locale: clean URLs, hreflang, canonicals, per-locale metadata/OG/JSON-LD, sitemaps.
- Sensible default for non-Spanish-speaking visitors (German, French, etc. → EN).
- Phased rollout: ship infra, then UI strings, then DB content, then polish.

## 2. Non-goals

- Auto-translating user-generated `support_messages` content.
- Per-locale Stripe pricing.
- Languages beyond ES and EN.
- Translating admin (`/admin/*`) deeply (UI translated but admins act in ES).

## 3. Decisions (settled in brainstorming)

| # | Decision | Choice |
|---|---|---|
| Q1 | Routing strategy | Subpath localization, translated slugs |
| Q2 | Translation scope | Full (marketing + app UI + DB content) |
| Q3 | DB translation storage | JSONB per-locale wrapper (`{es, en}`) for admin-authored content; user-generated stays as-is |
| Q4 | Library + detection | `next-intl`; Accept-Language auto-redirect + cookie override |
| Q5 | Default URL shape | Path-less ES (`/entrenamiento`), prefixed EN (`/en/training`). next-intl `localePrefix: 'as-needed'` |
| Q6 | Slug map | See section 5 |
| Q7 | Phasing | Phased rollout (4 phases) |
| Extra | Default locale rationale | ES default — preserves SEO equity, zero migration cost, current audience is ES |
| Extra | Non-Spanish detection rule | Treat Accept-Language primary tag ≠ `es*` as EN preference |
| Extra | Switcher | Yes — navbar (desktop) + nav drawer (mobile) + footer of legal pages |

## 4. Architecture

**Library:** `next-intl` (Next.js App Router native; supports server components, metadata, hreflang, middleware locale routing).

**Routing config:** `localePrefix: 'as-needed'`, `locales: ['es', 'en']`, `defaultLocale: 'es'`.

**File layout (DDD-aligned):**

```
src/shared/i18n/
  config.ts        # locales, defaultLocale, pathnames map
  request.ts       # next-intl getRequestConfig (loads messages by locale)
  routing.ts       # createNavigation -> localized Link, redirect, usePathname, useRouter

messages/
  es.json
  en.json

proxy.ts           # Next 16 renamed middleware → proxy. Existing file does auth gating;
                   # i18n is composed INTO it (next-intl handler runs first, then auth check).
                   # Matcher excludes /api/*, /auth/*, static assets.

app/
  [locale]/        # ALL existing routes move here
    layout.tsx     # wraps NextIntlClientProvider, sets <html lang>
    page.tsx
    entrenamiento/...   (route slug; pathnames map handles ES↔EN)
    perfil/...
    preguntanos/...
    que-es-athx/...
    privacidad/...
    terminos/...
    bienvenida/...
    login/...
    onboarding/...
    admin/...
  api/             # locale-neutral
  auth/callback/   # locale-neutral
  sitemap.ts       # emits routes × locales with hreflang alternates
  robots.ts        # unchanged structure, single sitemap
  opengraph-image.tsx + twitter-image.tsx + icon.tsx  -> moved under [locale]/
```

**Cross-cut:**

- `shared/seo/site.ts` exports `localizedMetadata(locale, esPath, enPath)` returning `Metadata` with `alternates.canonical` + `alternates.languages` (hreflang).
- `shared/seo/jsonld.tsx` builders accept `locale` and set `inLanguage`.
- `shared/utils/dates.ts` wired to use `useFormatter` from next-intl for locale-aware date formatting.

## 5. Slug map (next-intl `pathnames`)

| ES | EN |
|---|---|
| `/` | `/en` |
| `/entrenamiento` | `/en/training` |
| `/perfil` | `/en/profile` |
| `/preguntanos` | `/en/contact` |
| `/preguntanos/nuevo` | `/en/contact/new` |
| `/preguntanos/[id]` | `/en/contact/[id]` |
| `/que-es-athx` | `/en/what-is-athx` |
| `/privacidad` | `/en/privacy` |
| `/terminos` | `/en/terms` |
| `/bienvenida` | `/en/welcome` |
| `/login` | `/en/login` |
| `/onboarding` | `/en/onboarding` |
| `/admin/mensajes` | `/en/admin/messages` |
| `/admin/mensajes/[id]` | `/en/admin/messages/[id]` |

## 6. Locale detection (composed in `proxy.ts`)

> **Next 16 note:** `middleware.ts` is deprecated and renamed to `proxy.ts`. The repo's existing `proxy.ts` already handles Supabase auth gating (`/login`, `/perfil`, `/onboarding`, `/entrenamiento` redirects based on session + onboarding state). i18n is composed **into** that file — it does NOT replace the existing logic.

**Composition order inside `proxy()`:**
1. Run next-intl's `createMiddleware` handler first.
2. If it returned a redirect (locale auto-redirect or trailing-slash normalization) → return it immediately. Don't run auth; the redirected request will hit `proxy()` again with the resolved locale.
3. Otherwise, take next-intl's `NextResponse` (carries locale cookie + headers) and thread it through the existing Supabase auth gating. Auth redirect targets MUST be locale-aware — use next-intl's `getPathname({ locale, href })` to build the destination, not hardcoded `/login`/`/entrenamiento`/`/onboarding`.

**Behavior on first visit (no `NEXT_LOCALE` cookie):**

1. Skip locale handling for known bots (Googlebot, Bingbot, etc. via `User-Agent`) — they get the URL as requested.
2. Read `Accept-Language` header.
3. If primary tag starts with `es` (`es`, `es-ES`, `es-MX`, ...) → serve ES (no redirect; default).
4. Otherwise (any non-Spanish primary tag, including `de`, `fr`, `en`, `pt`, ...) → redirect to `/en/...`.
5. Set `NEXT_LOCALE` cookie (1 year) so subsequent visits skip detection.

On any visit with cookie set: cookie wins (overrides Accept-Language).

User-driven override: language switcher (section 8) sets cookie + persists to `profiles.locale` if logged in.

## 7. SEO

**Per-page metadata (via `generateMetadata`):**

```ts
{
  alternates: {
    canonical: `${SITE_URL}${currentLocalePath}`,
    languages: {
      es: `${SITE_URL}${esPath}`,
      en: `${SITE_URL}/en${enPath}`,
      'x-default': `${SITE_URL}${esPath}`,
    },
  },
  openGraph: { locale: locale === 'es' ? 'es_ES' : 'en_US', ... },
  ...
}
```

- `x-default` → ES (largest current market, current SEO equity).
- Each locale's URL is canonical to itself. Never cross-canonical EN→ES (would deindex EN).

**Sitemap (`app/sitemap.ts`):**

```ts
{
  url: `${SITE_URL}/entrenamiento`,
  alternates: {
    languages: {
      es: `${SITE_URL}/entrenamiento`,
      en: `${SITE_URL}/en/training`,
    },
  },
}
```

Next.js sitemap renders `<xhtml:link rel="alternate" hreflang>` automatically.

**robots.txt:** unchanged. Single sitemap at `/sitemap.xml`.

**`<html lang>`:** set in `[locale]/layout.tsx` from route param.

**Per-locale assets:**
- `app/[locale]/opengraph-image.tsx`, `twitter-image.tsx` read locale, render localized copy.
- JSON-LD `inLanguage` field set per locale; `Organization` and `WebSite` `@id` stay single (one entity, multiple language variants).

**GSC:** add `https://athx.com/` and `https://athx.com/en/` as separate properties. Submit single sitemap. Monitor International Targeting tab.

**Anti-patterns avoided:**
- No client-side translation (Google won't index).
- No `?lang=en` query params (split link equity).
- No geo-based redirect for bots (cloaking risk).

**Half-translated guard:** Phase 1 ships `/en/*` with `noindex,nofollow` until Phase 2 ships translated copy for the page. Avoids duplicate-content penalty during transition.

## 8. Language switcher

**Placement:**
- Desktop: navbar, right side near user menu. Inline `ES | EN` text or globe icon.
- Mobile: inside vaul `nav-menu` drawer, dedicated row near top labeled "Idioma / Language".
- Footer of `/privacidad` and `/terminos`: also include (legal accessibility).

**Behavior:**
- Uses next-intl `useRouter()` + `usePathname()` to switch locale while preserving the logical route (e.g., `/entrenamiento` → `/en/training`).
- Sets `NEXT_LOCALE` cookie (1 year).
- If logged in: also persists to `profiles.locale` via server action (fire-and-forget).
- Client-side navigation, no full reload.

## 9. DB + content model

### 9.1 `workout_templates.week_content`

**Migration:**

```sql
update workout_templates
set week_content = jsonb_build_object('es', week_content, 'en', null);
```

New shape: `{ es: WeekContent, en: WeekContent | null }`.

**Repo (`training/infra/template-repository.ts`):**
```ts
const raw = row.week_content as { es: WeekContent; en: WeekContent | null };
return raw[locale] ?? raw.es;  // ES fallback when EN not yet authored
```

**Use case:** `get-current-week-workout.ts` accepts `locale` (read from `getLocale()` in server context).

**Domain:** `WeekContent` shape unchanged. Add `LocalizedWeekContent = Record<Locale, WeekContent | null>` for storage layer only. UI never sees the wrapper.

### 9.2 `profiles.locale` (new column)

```sql
alter table profiles
  add column locale text not null default 'es' check (locale in ('es','en'));
```

- Set on signup from `NEXT_LOCALE` cookie.
- Drives email language and any server-side transactional copy.
- Editable from `/perfil` (or `/en/profile`) and via the language switcher when logged in.

### 9.3 Email templates

Move literal strings in `support/infra/email-client.ts` into `messages/{es,en}.json` under `emails.*`:

```json
{
  "emails": {
    "newMessage": { "subjectAdmin": "...", "bodyAdmin": "..." },
    "reply":      { "subjectUser":  "...", "bodyUser":  "..." },
    "userReply":  { "subjectAdmin": "...", "bodyAdmin": "..." }
  }
}
```

`email-client.ts` reads via `getTranslations({ locale: recipient.locale, namespace: 'emails' })`.

- User-bound emails (replies) → `recipient.locale`.
- Admin notifications → hardcoded `'es'` (admin = internal team).

### 9.4 Support messages

User-generated `support_messages.body` stays as-is (mixed languages OK). Surrounding UI labels translated. No per-message locale tagging.

### 9.5 Categories / enums

DB enums (`Sex`, `Category`) keep their values. UI maps via `messages.*.categories.*`.

### 9.6 Stripe

- Pass `locale: 'es' | 'en'` to Stripe Checkout (`create-checkout-session.ts`) and Billing Portal (`create-portal-session.ts`) so hosted UI matches.
- Single price unchanged. Translate display copy in app via messages.

## 10. Phasing

### Phase 1 — Infra (no user-visible change)
- Install `next-intl`.
- Create `src/shared/i18n/{config,request,routing}.ts`.
- Update root `proxy.ts` to compose next-intl handler with existing Supabase auth gating (see section 6). Add bot-skip + non-`es*` → EN rule. Make all auth-redirect targets locale-aware via next-intl `getPathname`.
- Mass move `app/*` → `app/[locale]/*` (excluding `api/`, `auth/`).
- Update root `layout.tsx` to wrap `NextIntlClientProvider`, set `<html lang>`.
- Replace `next/link` and `next/navigation` imports with localized versions from `@/shared/i18n/routing`.
- Seed `messages/es.json` + `messages/en.json` (minimal — boot only).
- Update `sitemap.ts`, `generateMetadata` everywhere for hreflang/canonical.
- Mark `/en/*` `noindex` until Phase 2 done for that route.
- Verify: ES URLs unchanged, sitemap valid, build passes.

### Phase 2 — UI strings
- Extract every hardcoded ES string in `app/**` and `src/modules/**/ui/**` into `messages/{es,en}.json`. Namespace per route/component (`home.hero.title`, `entrenamiento.cta.subscribe`, etc.).
- Translate to EN.
- Order: marketing (`/`, `/que-es-athx`, `/privacidad`, `/terminos`, `/login`) → app (`/entrenamiento`, `/perfil`, `/preguntanos`, `/onboarding`, `/bienvenida`) → admin.
- Per-locale OG images (`opengraph-image.tsx` reads `[locale]`).
- Per-locale JSON-LD `inLanguage`.
- Lift `noindex` on each EN route as it ships translated.

### Phase 3 — DB content
- Migration: `workout_templates.week_content` JSONB shape change + backfill.
- Repo + use case + domain updates per section 9.1.
- `profiles.locale` column + signup wiring + `/perfil` UI.
- Admin tooling or seed script to author EN content for all 12 templates.
- Email templates: move to messages, wire `email-client.ts` to recipient locale.

### Phase 4 — SEO polish + verification
- Submit both sitemaps to GSC as separate properties.
- Verify hreflang via GSC International Targeting.
- Per-locale `<title>` / `<meta description>` audit.
- Lighthouse SEO on 5 EN pages.
- Add language switcher analytics event (GA4).

## 11. Edge cases

1. **Bots/crawlers** — middleware skips locale auto-redirect for known bots; they get URL as requested.
2. **Direct `/en/training` link share** — works without cookie; cookie set on first switcher click.
3. **404s** — `app/[locale]/not-found.tsx` per locale.
4. **API routes** — middleware excludes `/api/*`. Server-side copy reads recipient/cookie locale explicitly.
5. **Auth callback (`/auth/callback`)** — excluded; reads cookie for post-redirect landing.
6. **Stripe checkout/portal** — `locale` param passed (section 9.6).
7. **OG/Twitter image cache** — locale-keyed URLs (`/en/opengraph-image`) so Slack/Twitter cache per locale.
8. **Sitemap discovery** — single sitemap at `/sitemap.xml`, lists all routes × locales with hreflang.
9. **Date/number formatting** — `useFormatter` from next-intl. `shared/utils/dates.ts` updated.
10. **Dev fallback** — `getMessageFallback` falls back to ES copy in dev only; in prod, missing key renders the key (visible bug → forces fix).

## 12. Out of scope (future)

- Languages beyond ES/EN.
- Per-locale Stripe pricing.
- Auto-translation of user support messages.
- Region-specific marketing copy variants (e.g., `es-MX` vs `es-ES`).

## 13. Risks

| Risk | Mitigation |
|---|---|
| ES SEO equity loss during transition | Path-less ES default, no URL changes, hreflang correctly set, `noindex` on partial-EN routes |
| Half-translated EN pages indexed | `noindex` until Phase 2 ships per route |
| Middleware perf cost | next-intl middleware is lightweight; matcher excludes static + API |
| Translation drift | All copy in `messages/*.json` (single source); CI check (future) for missing keys |
| Stripe checkout language mismatch | Pass `locale` param explicitly |
| German user sees ES (mis-detect) | Custom rule: non-`es*` Accept-Language → EN. Switcher available as fallback. |

## 14. Success criteria

- Zero ES URL changes; existing GSC indexed pages unaffected.
- `/en/*` routes return correct localized content with valid hreflang back to ES counterpart.
- GSC International Targeting reports no hreflang errors after Phase 4.
- Lighthouse SEO ≥ 95 on top 5 EN pages.
- German/French/Italian visitors auto-route to EN (verified via Accept-Language test matrix).
- Switcher round-trips correctly (`/entrenamiento` ↔ `/en/training`) preserving logical route.

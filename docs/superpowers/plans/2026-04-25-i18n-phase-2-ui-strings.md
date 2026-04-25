# i18n Phase 2 — UI Strings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract every hardcoded ES string in `app/[locale]/**` and `src/modules/**/ui/**` into `messages/{es,en}.json`, ship EN translations, add a language switcher, lift `noindex` on each `/en/*` route as its copy ships, and emit per-locale OG images + JSON-LD `inLanguage`.

**Architecture:** Strings live in `messages/es.json` + `messages/en.json` keyed by `<scope>.<key>` (e.g., `home.hero.title`, `entrenamiento.cta.subscribe`). Server components use `getTranslations(namespace)` from `next-intl/server`. Client components use `useTranslations(namespace)` from `next-intl`. The language switcher is a small client component mounted in `navbar.tsx` (desktop) + inside `nav-menu` drawer (mobile) + footer of legal pages — uses `useRouter` + `usePathname` from `@/shared/i18n/routing` to swap locale preserving the logical route. After each file's strings are extracted AND translated, that route's metadata can drop `noindex` for `/en/...`.

**Tech Stack:** next-intl 4 server + client APIs, Next 16 App Router, React 19.

**Spec:** `docs/superpowers/specs/2026-04-25-i18n-en-es-design.md` (sections 7, 8, 10-Phase-2).
**Prior plan:** `docs/superpowers/plans/2026-04-25-i18n-phase-1-infra.md` (delivered the routing, layout provider, `noindex /en/*`, sitemap, robots).

**Reference docs (READ before coding):**
- next-intl quick-ref for `getTranslations` / `useTranslations` / `getFormatter`. Already in `node_modules/next-intl/README.md`.
- `next-intl/server` exports: `getTranslations`, `getLocale`, `getFormatter`, `setRequestLocale`.
- `next-intl` (client) exports: `useTranslations`, `useLocale`, `useFormatter`, `NextIntlClientProvider`.

---

## Conventions used throughout this plan

**Namespace naming:**
- One namespace per top-level route or shared component cluster.
- Keys are descriptive: `home.hero.title`, NOT `home.h1` or `home.title1`.
- Reusable strings (button labels appearing across pages) live under `common.*`.
- Form labels under `<route>.form.*` (e.g., `login.form.emailLabel`).
- ARIA / a11y strings under `<route>.a11y.*`.

**ICU formatting:** use ICU `{count, plural, ...}` for pluralization, NOT string concat. next-intl supports it natively.

**Server vs client:**
- Server components: `import { getTranslations } from 'next-intl/server'; const t = await getTranslations('home');`
- Client components: `import { useTranslations } from 'next-intl'; const t = useTranslations('home');`

**`noindex` lifting rule:**
- Each route in `app/[locale]/<route>/page.tsx` has its own `generateMetadata` (or inherits from layout). Once the EN strings ship for that route, override `robots: undefined` so it falls through to the layout default (which is `index, follow` for non-EN). Wait — layout's robots is `noindex` for EN. Need to flip: per-page metadata explicitly returns `robots: { index: true, follow: true }` for both locales once the EN copy is ready.

**Verification per task:**
- `npm run build` must pass.
- `npm run dev`, then visit ES + EN versions of the route in a browser. Confirm: copy renders correctly, no untranslated keys (next-intl renders the key as fallback in prod — visible bug if any are missing).

**Commit cadence:** one commit per task. Conventional commits, no Claude co-author.

---

## File map (Phase 2)

**Created:**
- `src/shared/i18n/components/language-switcher.tsx` — client component, the locale toggle.
- `src/shared/i18n/components/language-switcher.css` — small styles (or use Tailwind classes inline; prefer Tailwind to match codebase).
- `messages/_keys.md` — quick human-readable index of namespaces (kept in sync manually; helps catch missing keys).

**Modified (UI strings extracted):**
- All `app/[locale]/**/*.tsx` with hardcoded ES copy.
- All `src/modules/**/ui/**/*.tsx` with hardcoded ES copy.
- `app/[locale]/navbar.tsx` — mounts `LanguageSwitcher` (desktop).
- `app/[locale]/components/nav-menu.tsx` — mounts `LanguageSwitcher` row inside drawer (mobile).
- `app/[locale]/privacidad/page.tsx`, `app/[locale]/terminos/page.tsx` — mount `LanguageSwitcher` in footer.

**Heavily expanded:**
- `messages/es.json` — exhaustive Spanish copy (one source of truth; existing literals removed from .tsx files).
- `messages/en.json` — exhaustive English translations of the same keys.

**OG / JSON-LD per locale:**
- `app/[locale]/opengraph-image.tsx` — moved from `app/opengraph-image.tsx`, reads `params.locale`, renders localized title/subtitle.
- `app/[locale]/twitter-image.tsx` — same.
- All `JsonLd` calls in pages updated to pass `locale` so builders set `inLanguage`.

**`noindex` lifted:**
- Per-page `generateMetadata` overrides layout's robots when EN copy ships. Final state: `/en/*` indexable.

---

## Strategy: extract by route, not by string

For each route file (or component), one task does **all** of:
1. Read file. Identify every visible string (button labels, alt text, aria labels, page copy, error messages, placeholder text).
2. Add keys under a single namespace to `messages/es.json` (with the exact ES copy as value) AND to `messages/en.json` (with the EN translation).
3. Replace literals in the .tsx with `t('key')` calls.
4. If server component → wire `getTranslations`. If client → `useTranslations`.
5. Build + visit both locales in browser.
6. Commit.

This avoids 200+ micro-tasks. Each task touches one logical area cleanly.

---

## Task 1: Setup — namespace conventions doc + initial `messages/_keys.md`

**Files:**
- Create: `messages/_keys.md`

- [ ] **Step 1: Write `messages/_keys.md`**

```markdown
# Message Namespaces

Keep this file in sync as namespaces are added. It's a navigation aid, not enforced.

## Top-level namespaces

| Namespace | Used by | Notes |
|---|---|---|
| `common` | Shared buttons, generic CTAs, error messages | "Cargar más", "Aceptar", "Cancelar", "Error inesperado" |
| `nav` | `app/[locale]/navbar.tsx`, `nav-menu.tsx` | Brand, menu labels |
| `home` | `app/[locale]/page.tsx` | Landing hero, FAQ, footer |
| `queEsAthx` | `app/[locale]/que-es-athx/page.tsx` | Article copy |
| `privacy` | `app/[locale]/privacidad/page.tsx` | Legal |
| `terms` | `app/[locale]/terminos/page.tsx` | Legal |
| `login` | `app/[locale]/login/page.tsx` | Auth form |
| `onboarding` | `app/[locale]/onboarding/page.tsx` | Wizard steps |
| `bienvenida` | `app/[locale]/bienvenida/page.tsx` | Post-checkout tour |
| `entrenamiento` | `app/[locale]/entrenamiento/page.tsx`, `subscribe-button.tsx`, `week-view.tsx` | Workout UI |
| `perfil` | `app/[locale]/perfil/*.tsx` | Profile labels |
| `preguntanos` | `app/[locale]/preguntanos/**/*.tsx` | Support pages |
| `support` | `src/modules/support/ui/**` | Reusable support UI |
| `admin` | `app/[locale]/admin/**/*.tsx` | Admin labels |
| `language` | `src/shared/i18n/components/language-switcher.tsx` | Switcher labels |
| `emails` | (Phase 3) | Reserved |

## Style rules

- Keys camelCase, segments dot-separated.
- Use ICU plural/select syntax — never string concatenation.
- Reusable cross-route strings → `common.*`.
- ARIA labels under `<ns>.a11y.*`.
- Error messages under `<ns>.errors.*`.
```

- [ ] **Step 2: Commit**

```bash
git add messages/_keys.md
git commit -m "docs(i18n): add message namespace index"
```

---

## Task 2: Build the language switcher

**Files:**
- Create: `src/shared/i18n/components/language-switcher.tsx`

The switcher swaps locale while preserving the logical route. next-intl's `useRouter` + `usePathname` from our routing helpers handle the slug map automatically (e.g., on `/entrenamiento` clicking EN goes to `/en/training`). It also fires a server action to persist `locale` to `profiles.locale` if the user is logged in (Phase 3 adds the column; for now the action is a no-op stub).

- [ ] **Step 1: Add keys to `messages/{es,en}.json` under `language` namespace**

Append to `messages/es.json`:

```json
"language": {
  "label": "Idioma",
  "spanish": "Español",
  "english": "English",
  "switchTo": "Cambiar a {lang}"
}
```

Append to `messages/en.json`:

```json
"language": {
  "label": "Language",
  "spanish": "Spanish",
  "english": "English",
  "switchTo": "Switch to {lang}"
}
```

Make sure to keep the existing `common` namespace if present; merge, don't overwrite.

- [ ] **Step 2: Write `src/shared/i18n/components/language-switcher.tsx`**

```tsx
'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/shared/i18n/routing';

type Variant = 'inline' | 'menu-row' | 'footer';

interface Props {
  variant?: Variant;
}

export function LanguageSwitcher({ variant = 'inline' }: Props) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const otherLocale = locale === 'es' ? 'en' : 'es';

  function switchTo(target: 'es' | 'en') {
    if (target === locale) return;
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => {
      router.replace(pathname, { locale: target });
    });
  }

  if (variant === 'menu-row') {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-xs uppercase tracking-wider text-muted">{t('label')}</span>
        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => switchTo('es')}
            disabled={isPending}
            className={`px-2 py-1 rounded ${locale === 'es' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
            aria-pressed={locale === 'es'}
          >
            ES
          </button>
          <span className="text-muted">·</span>
          <button
            type="button"
            onClick={() => switchTo('en')}
            disabled={isPending}
            className={`px-2 py-1 rounded ${locale === 'en' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
            aria-pressed={locale === 'en'}
          >
            EN
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={() => switchTo(otherLocale)}
        disabled={isPending}
        className="text-xs text-muted hover:text-white transition-colors"
        aria-label={t('switchTo', { lang: otherLocale === 'es' ? t('spanish') : t('english') })}
      >
        {otherLocale === 'es' ? 'ES' : 'EN'}
      </button>
    );
  }

  // inline (desktop navbar)
  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={() => switchTo('es')}
        disabled={isPending}
        className={`px-1.5 py-0.5 rounded ${locale === 'es' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
        aria-pressed={locale === 'es'}
        aria-label={t('switchTo', { lang: t('spanish') })}
      >
        ES
      </button>
      <span className="text-muted">|</span>
      <button
        type="button"
        onClick={() => switchTo('en')}
        disabled={isPending}
        className={`px-1.5 py-0.5 rounded ${locale === 'en' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
        aria-pressed={locale === 'en'}
        aria-label={t('switchTo', { lang: t('english') })}
      >
        EN
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Mount in `app/[locale]/navbar.tsx` (desktop)**

Add import at top:
```tsx
import { LanguageSwitcher } from '@/shared/i18n/components/language-switcher';
```

Insert `<LanguageSwitcher variant="inline" />` in the navbar layout near the user menu (right side). Don't break existing layout — wrap in a `<div className="hidden sm:flex items-center gap-3">` if needed to hide on mobile (mobile gets the menu-row variant inside the drawer).

- [ ] **Step 4: Mount in `app/[locale]/components/nav-menu.tsx` (mobile drawer)**

Add import. Insert `<LanguageSwitcher variant="menu-row" />` as the first child of `<nav className="flex flex-col">` so it appears at the top of the drawer.

- [ ] **Step 5: Mount in `app/[locale]/privacidad/page.tsx` and `app/[locale]/terminos/page.tsx` footers**

Add at the end of the page content, just before the closing wrapper div:

```tsx
<div className="mt-12 pt-6 border-t border-white/10 flex justify-center">
  <LanguageSwitcher variant="footer" />
</div>
```

- [ ] **Step 6: Build + manual smoke**

```bash
npm run build
```

Expected: passes.

```bash
npm run dev
```

Visit `http://localhost:3000/` → click ES↔EN in navbar → URL flips between `/` and `/en` correctly. Visit `/entrenamiento` → switcher routes to `/en/training`. Visit `/privacidad` → footer switcher works.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(i18n): add language switcher (navbar, drawer, legal footer)"
```

---

## Task 3: Marketing — Home (`app/[locale]/page.tsx`)

This is the biggest single page (FAQ, hero, sections). Extract everything.

**Files:**
- Modify: `app/[locale]/page.tsx`
- Modify: `messages/es.json`, `messages/en.json` (append `home` namespace)

- [ ] **Step 1: Read the current file end-to-end**

```bash
# (Use Read tool on app/[locale]/page.tsx)
```

List every Spanish string. Group into sub-namespaces inside `home`:
- `home.hero.*` — hero headline, subhead, CTA
- `home.sections.<name>.*` — each content block
- `home.faq.items` — array of `{ question, answer }` (use ICU array via `t.rich` or static list pulled from messages — see step 3)
- `home.footer.*` — footer copy

- [ ] **Step 2: Write the complete `home` namespace into `messages/es.json`**

Use the existing ES literals as the values. Example shape:

```json
"home": {
  "hero": {
    "eyebrow": "ATHX 2026",
    "title": "Programación oficial ATHX",
    "subtitle": "Plan semanal, seguimiento y chat directo con tu entrenador. Primera semana gratis.",
    "ctaPrimary": "Empezar ahora",
    "ctaSecondary": "Qué es ATHX"
  },
  "sections": {
    "...": "..."
  },
  "faq": {
    "title": "Preguntas frecuentes",
    "items": {
      "q1": { "question": "...", "answer": "..." },
      "q2": { "question": "...", "answer": "..." }
    }
  },
  "footer": {
    "tagline": "..."
  }
}
```

Replace `"..."` with the exact ES literals copied from `page.tsx`.

- [ ] **Step 3: Translate to EN and write into `messages/en.json` under the same `home` namespace**

Translate every value. Keep keys identical to ES.

Translation tone: direct, athletic, no marketing fluff. Use US English spelling. Keep brand names (ATHX, ATHLEX) untranslated.

For the FAQ items: translate question + answer pairs.

- [ ] **Step 4: Refactor `app/[locale]/page.tsx` to consume translations**

The home page is a server component. Use `getTranslations`:

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/shared/i18n/routing';
import { Reveal } from './reveal';
import { JsonLd, softwareApplicationLd, faqPageLd } from '@/shared/seo/jsonld';

export default async function HomePage() {
  const t = await getTranslations('home');

  // FAQ items: read keys we know exist
  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'] as const; // adjust to actual count
  const faqItems = faqKeys.map((k) => ({
    question: t(`faq.items.${k}.question`),
    answer: t(`faq.items.${k}.answer`),
  }));

  return (
    <>
      <JsonLd data={softwareApplicationLd()} />
      <JsonLd data={faqPageLd(faqItems)} />
      {/* existing JSX, with every literal swapped to t('hero.title') etc. */}
    </>
  );
}
```

Apply this pattern to every literal. Don't leave any string in the file other than CSS class names.

- [ ] **Step 5: Build + manual smoke**

```bash
npm run build
```

```bash
npm run dev
```

Visit `/` and `/en` → confirm both render their respective copy with no untranslated keys visible (no `home.hero.title` showing through).

- [ ] **Step 6: Lift `noindex` for `/en` home**

Edit `app/[locale]/page.tsx` to export `generateMetadata` that overrides the layout's `noindex`:

```tsx
import type { Metadata } from 'next';
import { SITE_URL } from '@/shared/seo/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    alternates: {
      canonical: isEn ? `${SITE_URL}/en` : `${SITE_URL}/`,
      languages: {
        es: `${SITE_URL}/`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/`,
      },
    },
    robots: { index: true, follow: true },
  };
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(i18n): extract home page strings, lift /en noindex"
```

---

## Task 4: Marketing — `/que-es-athx`

**Files:**
- Modify: `app/[locale]/que-es-athx/page.tsx`
- Modify: `messages/{es,en}.json` (`queEsAthx` namespace)

Same pattern as Task 3.

- [ ] **Step 1: Inventory strings**

Read `app/[locale]/que-es-athx/page.tsx`. List every literal. Group into:
- `queEsAthx.title`, `queEsAthx.intro`
- `queEsAthx.sections.<name>.{title, body}`
- `queEsAthx.faq.items.qN.{question, answer}`

- [ ] **Step 2: Add `queEsAthx` namespace to `messages/es.json` with current ES values**

- [ ] **Step 3: Translate and write to `messages/en.json`**

- [ ] **Step 4: Refactor page to use `getTranslations('queEsAthx')`**

Pattern identical to Task 3 step 4.

- [ ] **Step 5: Update `generateMetadata` (already locale-aware from Phase 1) — drop `noindex` if it was inherited**

In Phase 1 Task 15, this page already has `generateMetadata` that sets per-locale title/description/canonical/alternates and does NOT set `robots`. The layout sets `noindex` for EN. Override here:

Add to the returned `Metadata`:
```tsx
robots: { index: true, follow: true },
```

- [ ] **Step 6: Build + smoke + commit**

```bash
git add -A
git commit -m "feat(i18n): extract /que-es-athx strings, lift /en noindex"
```

---

## Task 5: Marketing — `/privacidad`

**Files:**
- Modify: `app/[locale]/privacidad/page.tsx`
- Modify: `messages/{es,en}.json` (`privacy` namespace)

Same pattern. Privacy text is long; keep paragraphs as separate keys (`privacy.sections.intro`, `privacy.sections.dataCollected`, etc.) so translators can work paragraph by paragraph.

- [ ] **Step 1: Inventory + namespace it**
- [ ] **Step 2: ES values into `messages/es.json`**
- [ ] **Step 3: EN translation into `messages/en.json`**
- [ ] **Step 4: Refactor page**
- [ ] **Step 5: Add `robots: { index: true, follow: true }` to its `generateMetadata`** (already exists from Phase 1; just add the field)
- [ ] **Step 6: Smoke + commit**

```bash
git commit -m "feat(i18n): extract /privacidad strings, lift /en noindex"
```

---

## Task 6: Marketing — `/terminos`

Identical pattern to Task 5. Namespace: `terms`.

- [ ] **Steps 1-6 mirror Task 5**

Commit:
```bash
git commit -m "feat(i18n): extract /terminos strings, lift /en noindex"
```

---

## Task 7: Marketing — `/login`

**Files:**
- Modify: `app/[locale]/login/page.tsx` and `app/[locale]/login/layout.tsx` if it exists
- Modify: `src/modules/identity/application/sign-in.ts` and `sign-up.ts` — the `error` strings returned to the form
- Modify: `messages/{es,en}.json` (`login` namespace)

The login page renders form labels, button copy, error messages. Server actions return `{ error: string }` — those error messages are currently Supabase's English text. Two choices:

- **Easy:** display Supabase errors as-is (English; users see them in any locale). Acceptable for Phase 2.
- **Better:** map Supabase error codes to translated keys. Defer to a future polish task.

Phase 2 ships the easy version: form labels translated, error display untouched.

- [ ] **Step 1-4:** standard pattern
- [ ] **Step 5: Lift noindex** — login is currently disallowed in `robots.txt` so SEO doesn't matter; but the layout `noindex` still emits. Decide: keep `noindex` (login isn't intended for organic traffic) → no robots override needed.
- [ ] **Step 6: Commit**

```bash
git commit -m "feat(i18n): extract /login form strings"
```

---

## Task 8: App — `/entrenamiento` (training page + subscribe button + week view)

**Files:**
- Modify: `app/[locale]/entrenamiento/page.tsx`
- Modify: `app/[locale]/entrenamiento/subscribe-button.tsx` (client component)
- Modify: `app/[locale]/entrenamiento/week-view.tsx` (client component, day labels, exercise UI chrome — NOT the workout content itself, which is DB-stored and translated in Phase 3)
- Modify: `messages/{es,en}.json` (`entrenamiento` namespace)

Important: the workout content (exercise names, sets/reps notes) comes from `workout_templates.week_content` and is translated in **Phase 3**. Phase 2 only translates the UI chrome (page heading, day-of-week labels, "Free week" badge, "Subscribe" button copy, etc.).

- [ ] **Steps 1-6:** standard pattern. For day-of-week labels, prefer `useFormatter().dateTime(date, { weekday: 'long' })` over hardcoded strings — next-intl handles localization automatically.

```bash
git commit -m "feat(i18n): extract /entrenamiento UI chrome strings"
```

(Note: `noindex` on `/en/entrenamiento` stays — private route, robots disallows it.)

---

## Task 9: App — `/perfil`

**Files:**
- Modify: `app/[locale]/perfil/page.tsx`, `portal-button.tsx`, `sign-out-button.tsx`
- Modify: `messages/{es,en}.json` (`perfil` namespace)

Standard pattern. Format dates/currencies via `useFormatter()`. Subscription status labels ("Activa", "Sin suscripción") become keys.

```bash
git commit -m "feat(i18n): extract /perfil strings"
```

---

## Task 10: App — `/preguntanos` (support pages)

**Files:**
- Modify: `app/[locale]/preguntanos/page.tsx`, `nuevo/page.tsx`, `[id]/page.tsx`
- Modify: `src/modules/support/ui/contact-form.tsx`, `reply-form.tsx`, `thread-list.tsx`, `message-bubble.tsx`
- Modify: `messages/{es,en}.json` (`preguntanos` + `support` namespaces — preguntanos for page-level, support for reusable UI)

Note: the message body contents (`SupportMessage.body`) are user-generated and stay as-typed (no translation). Only chrome/labels translated.

```bash
git commit -m "feat(i18n): extract /preguntanos and support UI strings"
```

---

## Task 11: App — `/onboarding`

**Files:**
- Modify: `app/[locale]/onboarding/page.tsx` (this file is large — wizard with multiple steps)
- Modify: `messages/{es,en}.json` (`onboarding` namespace, with sub-keys per step: `onboarding.steps.basicInfo.*`, `onboarding.steps.category.*`, etc.)

Largest single client component in the app. Step labels, instructions, validation hints, button copy. Take care to extract all of it.

```bash
git commit -m "feat(i18n): extract /onboarding wizard strings"
```

---

## Task 12: App — `/bienvenida`

**Files:**
- Modify: `app/[locale]/bienvenida/page.tsx`
- Modify: `messages/{es,en}.json` (`bienvenida` namespace)

This page is the post-checkout cinematic tour with multi-step copy in the `STEPS` constant. Move that constant's strings into messages.

```bash
git commit -m "feat(i18n): extract /bienvenida tour strings"
```

---

## Task 13: Admin — `/admin/mensajes`

**Files:**
- Modify: `app/[locale]/admin/mensajes/page.tsx`, `[id]/page.tsx`, `status-toggle.tsx`
- Modify: `messages/{es,en}.json` (`admin` namespace)

Translate UI chrome only. Admin is internal — don't sweat the EN translation quality, copy/paste DeepL output is fine.

```bash
git commit -m "feat(i18n): extract /admin/mensajes strings"
```

---

## Task 14: Components — `navbar`, `nav-menu`, `chat-bubble`, `chat-panel`, `admin-bell`, `brand-mark`, `chat-bubble-server`

**Files:**
- Modify: `app/[locale]/navbar.tsx`, `app/[locale]/components/*.tsx`
- Modify: `messages/{es,en}.json` (`nav` namespace + a few entries under `support` for chat panel labels)

`navbar.tsx` is server, others are mostly client.

```bash
git commit -m "feat(i18n): extract navbar and components strings"
```

---

## Task 15: Per-locale OG + Twitter images

**Files:**
- Move: `app/opengraph-image.tsx` → `app/[locale]/opengraph-image.tsx`
- Move: `app/twitter-image.tsx` → `app/[locale]/twitter-image.tsx`
- Modify: both files to read `params.locale` and render localized title/subtitle.

- [ ] **Step 1: Move files**

```bash
git mv app/opengraph-image.tsx 'app/[locale]/opengraph-image.tsx'
git mv app/twitter-image.tsx 'app/[locale]/twitter-image.tsx'
```

- [ ] **Step 2: Update both to accept locale param**

Pattern (next-intl + next/og):

```tsx
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';
export const alt = 'ATHLEX Training';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });

  return new ImageResponse(
    (
      <div
        style={{
          /* keep existing styles */
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800 }}>{t('title')}</div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.85 }}>{t('subtitle')}</div>
      </div>
    ),
    { ...size },
  );
}
```

Replicate for `twitter-image.tsx` (different size: 1200x600 typically — match what the original file had).

- [ ] **Step 3: Build + smoke**

```bash
npm run build
```

Visit `/opengraph-image` and `/en/opengraph-image` in the browser — confirm both render with localized text.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(i18n): per-locale OG and Twitter images"
```

---

## Task 16: JSON-LD `inLanguage` per locale

**Files:**
- Modify: `src/shared/seo/jsonld.tsx` — accept optional `locale` param in builders.
- Modify: every page that calls `JsonLd` (`app/[locale]/page.tsx`, `que-es-athx/page.tsx`, layout) — pass current locale.

- [ ] **Step 1: Update builders in `jsonld.tsx`**

Add `locale` param to `organizationLd`, `webSiteLd`, `softwareApplicationLd`, `faqPageLd`. Each emits `inLanguage: locale === 'en' ? 'en' : 'es'` in the resulting JSON-LD object.

- [ ] **Step 2: Update callers**

In each page, get locale via `getLocale()` (server) and pass:
```tsx
import { getLocale } from 'next-intl/server';
// ...
const locale = await getLocale();
return <><JsonLd data={faqPageLd(faqItems, locale)} />/* ... */</>;
```

In `[locale]/layout.tsx`, the layout already destructures `params` — pass `locale` to `organizationLd` and `webSiteLd` mounted there.

- [ ] **Step 3: Build + smoke**

```bash
npm run build && npm run dev
```

`curl -s http://localhost:3000/ | grep -A1 'inLanguage'` → expect `"inLanguage":"es"`.

`curl -s http://localhost:3000/en | grep -A1 'inLanguage'` → expect `"inLanguage":"en"`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(seo): JSON-LD inLanguage per locale"
```

---

## Task 17: Final sweep — verify zero hardcoded ES strings remain

**Files:** none modified directly; this is a verification + fix-as-needed pass.

- [ ] **Step 1: Grep for unmistakably-Spanish words in JSX**

Use the Grep tool over `app/[locale]/**/*.tsx` and `src/modules/**/ui/**/*.tsx`. Patterns to search (case-insensitive):

- `>([A-Z][a-zñ]+ )+[a-zñ]+<` — ES sentences starting with capital letter
- `aria-label="[A-Z]` — untranslated ARIA labels
- `placeholder="[A-Z]` — untranslated placeholders
- Specific ES tells: `tu`, `tu cuenta`, `Cargar`, `Volver`, `Aceptar`, `Cancelar`, `Pregúntanos`, `Suscribirse`, `Cerrar`, `Enviar`

Each hit: extract to `messages/{es,en}.json` and replace with `t(...)` call.

- [ ] **Step 2: Run a missing-keys check**

next-intl in dev logs missing keys to console. Run `npm run dev` and click through every public + private route. Watch for `IntlError: MISSING_MESSAGE` lines.

- [ ] **Step 3: Build + lint**

```bash
npm run lint && npm run build
```

Expected: clean (lint at the same baseline as Phase 1).

- [ ] **Step 4: Manual EN quality pass**

Visit every `/en/...` route. Read the EN copy as a US English speaker. Fix awkward phrasing — translation matters for SEO ranking quality.

- [ ] **Step 5: Commit fixes**

```bash
git add -A
git commit -m "feat(i18n): sweep remaining hardcoded strings, polish EN copy"
```

---

## Task 18: Final smoke matrix

- [ ] **Step 1: Clean build**

```bash
rm -rf .next
npm run lint && npm run build
```

Expected: passes.

- [ ] **Step 2: Browser verification matrix**

`npm run dev`, then verify:

1. `/` (ES) and `/en` render fully translated copy. No `key.like.this` strings visible.
2. Switcher in navbar works on every public route — flips locale, preserves logical route, sets cookie.
3. Switcher on `/privacidad` and `/terminos` footer works.
4. Mobile drawer (`hamburger menu` on phone-width viewport) shows the language row at top.
5. View source on `/en` → `<meta name="robots">` is now `index, follow` (was `noindex` in Phase 1).
6. View source on `/en` → `<link rel="alternate" hreflang="es"...>` and `hreflang="x-default"` present.
7. `<script type="application/ld+json">` on `/` includes `"inLanguage":"es"`. Same on `/en` includes `"inLanguage":"en"`.
8. Visit `/opengraph-image` and `/en/opengraph-image` — different localized titles.
9. Login flow with no session: `/perfil` redirects to `/login` (ES), `/en/profile` redirects to `/en/login`. Confirmed in Phase 1 — re-verify it still works after string changes.
10. Click through onboarding wizard in EN — every step renders translated copy, no key leaks.
11. Visit `/preguntanos`, post a new thread — confirmation/redirect text in current locale.

If ANY of these fail, fix before tagging.

- [ ] **Step 3: Tag**

```bash
git tag i18n-phase-2-done
```

---

## Done when

- All 18 tasks committed.
- `npm run build` clean.
- Browser matrix in Task 18 passes 100%.
- Zero `MISSING_MESSAGE` warnings in dev console for any public route.
- `/en/*` public routes return `index, follow` and serve translated copy.
- Sitemap (already from Phase 1) lists EN URLs; they now serve real EN content.

---

## Self-review (run after writing this plan)

**Spec coverage:**
- Section 7 (SEO): per-locale OG ✅ (Task 15), JSON-LD inLanguage ✅ (Task 16), `noindex` lifting ✅ (per-route).
- Section 8 (Switcher): full implementation ✅ (Task 2; mounted in 3 places).
- Section 10 Phase 2 bullets: all covered.

**Placeholder scan:**
- Tasks 3-14 use a "standard pattern" reference. The pattern is fully specified in Task 3. Each subsequent task names the namespace, files, and any deviations. Engineer reading Task 8 (entrenamiento) without reading Task 3 first would need to refer back — acceptable for repetitive work; the pattern doesn't fit inline 12 times.
- Task 4-7, 9-13 don't repeat the code blocks — they reference Task 3's pattern. Reasonable for mechanical extraction; the pattern isn't a hidden trick.
- Task 15's image render code is an example pattern; the original `opengraph-image.tsx` may have a different style (background gradient, brand mark, etc.). Reviewer must preserve the visual design — only swap text strings to `t(...)`. Note added in step 2.

**Type / pattern consistency:**
- `getTranslations` (server) and `useTranslations` (client) used consistently.
- `getLocale` for server, `useLocale` for client.
- All routing helpers from `@/shared/i18n/routing`.
- All `noindex` overrides via per-page `generateMetadata` returning `robots: { index: true, follow: true }`.

**Scope check:**
- Phase 2 only. DB content (workout templates, emails) stays in Spanish; covered in Phase 3.
- Multi-currency Stripe: out of scope (spec section 9.7, future).
- Profile.locale column: stays out of scope (Phase 3).
- Per-route lift of `noindex` happens AS each route's strings ship — atomic per task.

# i18n Phase 1 — Infra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `next-intl` v4 into the Next 16.2.3 app — locale routing (`/` ES path-less, `/en/...` prefixed), translated slug map, locale auto-detect composed into existing `proxy.ts` auth gating, hreflang sitemaps, EN routes `noindex` until Phase 2 — without changing any user-facing copy.

**Architecture:** `next-intl` runs as a helper inside the existing `proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`). Locale handling executes BEFORE Supabase auth gating; auth redirect targets become locale-aware via `getPathname`. App routes move under `app/[locale]/*`; `api/`, `auth/callback/`, and root metadata files stay at `app/` root. Messages files seeded minimal — Phase 2 extracts strings.

**Tech Stack:** Next 16.2.3 (App Router, `proxy.ts` convention), React 19, `next-intl` v4, Supabase SSR (existing), TypeScript.

**Spec:** `docs/superpowers/specs/2026-04-25-i18n-en-es-design.md`

**Reference docs (READ before coding):**
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — Next 16 proxy convention.
- `node_modules/next/dist/docs/01-app/02-guides/internationalization.md` — Next i18n guide.
- `node_modules/next-intl/README.md` (after install) — confirm v4 API for App Router.
- Existing `proxy.ts` (root) — current Supabase auth gating logic; you compose with this.
- `CLAUDE.md` + `AGENTS.md` — DDD layout rules, commit style (no Claude co-author, conventional commits, lean caveman replies).

---

## File map (Phase 1)

**Created:**
- `src/shared/i18n/config.ts` — locales, defaultLocale, `pathnames` map.
- `src/shared/i18n/routing.ts` — `defineRouting` + `createNavigation` exports (`Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`).
- `src/shared/i18n/request.ts` — `getRequestConfig` for next-intl server runtime.
- `src/shared/i18n/locale-detect.ts` — pure function: `Accept-Language` header → preferred locale (`'es' | 'en'`), with non-`es*` → `en` rule and bot detection.
- `messages/es.json` — minimal seed.
- `messages/en.json` — minimal seed.
- `app/[locale]/` — destination for moved route files (created by move).

**Modified:**
- `next.config.ts` — wrap with `createNextIntlPlugin`.
- `proxy.ts` — compose `next-intl` handler with existing Supabase auth; locale-aware redirect targets.
- `app/layout.tsx` → moved to `app/[locale]/layout.tsx`; sets `<html lang={locale}>`, wraps `NextIntlClientProvider`.
- `app/page.tsx` → `app/[locale]/page.tsx`.
- All route dirs (`entrenamiento`, `perfil`, `preguntanos`, `que-es-athx`, `privacidad`, `terminos`, `bienvenida`, `login`, `onboarding`, `admin`) → moved under `app/[locale]/`.
- `app/components/`, `app/navbar.tsx`, `app/navbar-skeleton.tsx`, `app/nav-progress.tsx`, `app/reveal.tsx`, `app/spinner.tsx` → moved under `app/[locale]/` (kept co-located).
- `app/sitemap.ts` — emit each route × locale with hreflang alternates including `en` URL.
- `app/robots.ts` — keep current disallows, also disallow `/en/{disallowed}`.
- All page files using `next/link` or `next/navigation` → swap to `@/shared/i18n/routing`.

**Stays at `app/` root (locale-neutral):**
- `app/api/**`, `app/auth/callback/**` — route handlers.
- `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/favicon.ico`, `app/icon.tsx`, `app/opengraph-image.tsx`, `app/twitter-image.tsx`, `app/globals.css` — special metadata files at `app/` root (per-locale OG variants are Phase 2).

**Note on tests:** no test runner is configured. Verification = `npm run build` (TS + Next route resolution) + `npm run dev` + `curl` for runtime checks + browser smoke check. Do not introduce vitest in Phase 1 (scope creep).

---

## Conventions for this plan

- After every task: `npm run lint && npm run build` must pass before commit. If either fails, fix before proceeding.
- Commit message format: conventional commits, **no `Co-Authored-By` trailer**.
- Path alias `@/shared/*` resolves to `src/shared/*` (already configured in `tsconfig.json`).
- File creation uses `Write` tool with the absolute path; modifications use `Edit`.
- When moving directories, prefer `git mv` to preserve history.

---

## Task 1: Install `next-intl`

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm).

- [ ] **Step 1: Install package**

```bash
npm install next-intl@^4
```

Expected: `next-intl` added to `dependencies` in `package.json`. No peer-dep warnings about Next 16 (next-intl v4 supports Next 14/15/16 App Router).

- [ ] **Step 2: Confirm version**

```bash
node -e "console.log(require('next-intl/package.json').version)"
```

Expected: `4.x.y`.

- [ ] **Step 3: Read the next-intl quick-start**

```bash
cat node_modules/next-intl/README.md | head -200
```

Skim for: `defineRouting`, `createNavigation`, `getRequestConfig`, plugin name (`createNextIntlPlugin` from `next-intl/plugin`), middleware import path.

If anything in the steps below disagrees with what the installed README says, **trust the README** and adjust. Note any deviation in your commit message.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add next-intl ^4"
```

---

## Task 2: Create i18n config

**Files:**
- Create: `src/shared/i18n/config.ts`

- [ ] **Step 1: Write `src/shared/i18n/config.ts`**

```ts
// src/shared/i18n/config.ts
// Pure config — no next-intl runtime imports here, so it can be imported anywhere.

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

// next-intl `pathnames` map: external (per-locale) URL ↔ internal app path.
// The internal path is the ES slug (canonical, since ES is path-less default).
// Add a new entry here whenever a new public route is added.
export const pathnames = {
  '/': '/',
  '/entrenamiento': {
    es: '/entrenamiento',
    en: '/training',
  },
  '/perfil': {
    es: '/perfil',
    en: '/profile',
  },
  '/preguntanos': {
    es: '/preguntanos',
    en: '/contact',
  },
  '/preguntanos/nuevo': {
    es: '/preguntanos/nuevo',
    en: '/contact/new',
  },
  '/preguntanos/[id]': {
    es: '/preguntanos/[id]',
    en: '/contact/[id]',
  },
  '/que-es-athx': {
    es: '/que-es-athx',
    en: '/what-is-athx',
  },
  '/privacidad': {
    es: '/privacidad',
    en: '/privacy',
  },
  '/terminos': {
    es: '/terminos',
    en: '/terms',
  },
  '/bienvenida': {
    es: '/bienvenida',
    en: '/welcome',
  },
  '/login': '/login',
  '/onboarding': '/onboarding',
  '/admin/mensajes': {
    es: '/admin/mensajes',
    en: '/admin/messages',
  },
  '/admin/mensajes/[id]': {
    es: '/admin/mensajes/[id]',
    en: '/admin/messages/[id]',
  },
} as const;

export type AppPathname = keyof typeof pathnames;
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors related to this file. (Pre-existing project errors, if any, are not introduced here — diff against `git stash` if uncertain.)

- [ ] **Step 3: Commit**

```bash
git add src/shared/i18n/config.ts
git commit -m "feat(i18n): add locales/pathnames config"
```

---

## Task 3: Create routing helpers

**Files:**
- Create: `src/shared/i18n/routing.ts`

- [ ] **Step 1: Write `src/shared/i18n/routing.ts`**

```ts
// src/shared/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale, pathnames } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // ES path-less, EN prefixed.
  pathnames,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. If next-intl reports a mismatch on `pathnames` typing, the most common cause is the literal-types narrowing: ensure `pathnames` in `config.ts` ends with `as const`.

- [ ] **Step 3: Commit**

```bash
git add src/shared/i18n/routing.ts
git commit -m "feat(i18n): add localized navigation helpers"
```

---

## Task 4: Create request config (server)

**Files:**
- Create: `src/shared/i18n/request.ts`

- [ ] **Step 1: Write `src/shared/i18n/request.ts`**

```ts
// src/shared/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. (`messages/{es,en}.json` are created in Task 5; TS may complain about missing module — that's fine, will resolve.)

- [ ] **Step 3: Commit (defer until messages exist)**

Hold the commit; combine with Task 5.

---

## Task 5: Seed messages

**Files:**
- Create: `messages/es.json`
- Create: `messages/en.json`

- [ ] **Step 1: Write `messages/es.json`**

```json
{
  "common": {
    "appName": "ATHLEX Training"
  }
}
```

- [ ] **Step 2: Write `messages/en.json`**

```json
{
  "common": {
    "appName": "ATHLEX Training"
  }
}
```

- [ ] **Step 3: Type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors. The dynamic import in `request.ts` should now resolve.

- [ ] **Step 4: Commit**

```bash
git add src/shared/i18n/request.ts messages/es.json messages/en.json
git commit -m "feat(i18n): add request config and seed message catalogs"
```

---

## Task 6: Wire next-intl plugin in `next.config.ts`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace contents of `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io", "*.ngrok.app"],
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Verify build still passes (no app moves yet, so EN routes don't exist; ES routes still served)**

```bash
npm run build
```

Expected: build succeeds. If it complains about the request file path, double-check `./src/shared/i18n/request.ts` matches the file you created in Task 4.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(i18n): wire next-intl plugin in next.config"
```

---

## Task 7: Move all route folders under `app/[locale]/`

This is a structural move — no logic changes. Co-located UI files (`navbar.tsx`, `components/`, `reveal.tsx`, etc.) move alongside the routes. `api/`, `auth/`, and root metadata files stay put.

**Files:**
- Create dir: `app/[locale]/`
- Move (via `git mv`): everything in `app/` EXCEPT `api/`, `auth/`, `robots.ts`, `sitemap.ts`, `manifest.ts`, `favicon.ico`, `icon.tsx`, `opengraph-image.tsx`, `twitter-image.tsx`, `globals.css`.

- [ ] **Step 1: Create `app/[locale]/` directory**

```bash
mkdir -p "app/[locale]"
```

- [ ] **Step 2: Move route folders**

```bash
git mv app/admin "app/[locale]/admin"
git mv app/bienvenida "app/[locale]/bienvenida"
git mv app/components "app/[locale]/components"
git mv app/entrenamiento "app/[locale]/entrenamiento"
git mv app/login "app/[locale]/login"
git mv app/onboarding "app/[locale]/onboarding"
git mv app/perfil "app/[locale]/perfil"
git mv app/preguntanos "app/[locale]/preguntanos"
git mv app/privacidad "app/[locale]/privacidad"
git mv app/que-es-athx "app/[locale]/que-es-athx"
git mv app/terminos "app/[locale]/terminos"
```

- [ ] **Step 3: Move co-located files**

```bash
git mv app/layout.tsx "app/[locale]/layout.tsx"
git mv app/page.tsx "app/[locale]/page.tsx"
git mv app/navbar.tsx "app/[locale]/navbar.tsx"
git mv app/navbar-skeleton.tsx "app/[locale]/navbar-skeleton.tsx"
git mv app/nav-progress.tsx "app/[locale]/nav-progress.tsx"
git mv app/reveal.tsx "app/[locale]/reveal.tsx"
git mv app/spinner.tsx "app/[locale]/spinner.tsx"
```

- [ ] **Step 4: Confirm `app/` root contents**

```bash
ls app
```

Expected output (only these):
```
api  auth  [locale]  favicon.ico  globals.css  icon.tsx  manifest.ts  opengraph-image.tsx  robots.ts  sitemap.ts  twitter-image.tsx
```

- [ ] **Step 5: Build will fail until Task 8 — skip build, commit the structural move**

```bash
git add -A app
git commit -m "refactor(i18n): move route tree under app/[locale]"
```

---

## Task 8: Update `[locale]/layout.tsx` for next-intl + `<html lang>`

**Files:**
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Read current layout**

```bash
cat "app/[locale]/layout.tsx"
```

Note the existing `<html lang="es">`, the metadata export, the `Navbar`/`ChatBubbleServer`/`Analytics` mounts.

- [ ] **Step 2: Modify the layout to accept `[locale]` param and wrap with `NextIntlClientProvider`**

Replace the function signature, the `<html>` tag, and wrap children. Keep all other logic (fonts, navbar, analytics, JSON-LD) unchanged.

Apply these edits:

1. Add imports near the top (alongside other imports):

```tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/shared/i18n/routing";
import { setRequestLocale } from "next-intl/server";
```

2. Add `generateStaticParams` export so static rendering knows the locale set:

```tsx
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

3. Change the default export signature from `export default function RootLayout({ children })` to:

```tsx
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
```

4. Change `<html lang="es">` → `<html lang={locale}>`.

5. Wrap the `<body>` children in `<NextIntlClientProvider>`:

```tsx
<body className={`${league_spartan.variable} antialiased`}>
  <NextIntlClientProvider>
    {/* existing JsonLd, Suspense+Navbar, NavProgress, children, ChatBubbleServer, Analytics — UNCHANGED */}
  </NextIntlClientProvider>
</body>
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: build succeeds. The home `/` and all ES routes route through `[locale]` with `defaultLocale: 'es'` and `localePrefix: 'as-needed'`. EN routes will 404 at runtime until `proxy.ts` is updated (Task 9) — that's OK for the build.

If build fails with "missing root layout", verify there is no `app/layout.tsx` (it should have moved in Task 7) and `app/[locale]/layout.tsx` exists.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/layout.tsx"
git commit -m "feat(i18n): make root layout locale-aware with next-intl provider"
```

---

## Task 9: Locale-detect helper (pure function, isolated for clarity)

**Files:**
- Create: `src/shared/i18n/locale-detect.ts`

This extracts the non-trivial routing rule (non-`es*` Accept-Language → EN, bot bypass) into a pure function so it's clear and replaceable. `proxy.ts` calls it in Task 10.

- [ ] **Step 1: Write `src/shared/i18n/locale-detect.ts`**

```ts
// src/shared/i18n/locale-detect.ts
import type { Locale } from './config';

const BOT_UA_RE = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_UA_RE.test(userAgent);
}

/**
 * Detect locale from Accept-Language header.
 * Rule: if the highest-priority tag starts with `es`, use ES; otherwise EN.
 * Bots and missing headers fall back to defaultLocale (caller decides what to do).
 */
export function detectLocaleFromAcceptLanguage(
  header: string | null | undefined,
): Locale {
  if (!header) return 'es';
  // Parse "es-ES,es;q=0.9,en;q=0.8" → ordered list of tags by q-value.
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((t) => t.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  if (tags.length === 0) return 'es';
  const primary = tags[0].tag;
  return primary.startsWith('es') ? 'es' : 'en';
}
```

- [ ] **Step 2: Sanity-check with a one-off Node script**

```bash
node -e "
const { detectLocaleFromAcceptLanguage, isBot } = require('./src/shared/i18n/locale-detect.ts');
console.log('de-DE,de;q=0.9,en;q=0.8 →', detectLocaleFromAcceptLanguage('de-DE,de;q=0.9,en;q=0.8'));
console.log('es-ES,es;q=0.9,en;q=0.8 →', detectLocaleFromAcceptLanguage('es-ES,es;q=0.9,en;q=0.8'));
console.log('en-US,en;q=0.9 →', detectLocaleFromAcceptLanguage('en-US,en;q=0.9'));
console.log('null →', detectLocaleFromAcceptLanguage(null));
console.log('Googlebot/2.1 isBot →', isBot('Googlebot/2.1'));
console.log('Mozilla/5.0 isBot →', isBot('Mozilla/5.0 (Windows NT 10.0)'));
" 2>/dev/null || echo "Node can't import .ts directly — skip; rely on build + runtime check in Task 10."
```

Expected (if it runs): `de-DE… → en`, `es-ES… → es`, `en-US… → en`, `null → es`, `Googlebot isBot → true`, `Mozilla isBot → false`.

If Node refuses .ts, that's fine — runtime check in Task 11 covers this.

- [ ] **Step 3: Commit**

```bash
git add src/shared/i18n/locale-detect.ts
git commit -m "feat(i18n): add locale detection helper"
```

---

## Task 10: Compose `proxy.ts` — i18n + existing Supabase auth

**Files:**
- Modify: `proxy.ts` (root)

The existing `proxy.ts` does Supabase auth gating with a narrow `matcher`. We need: (a) i18n on a wider matcher (all pages); (b) auth gating preserved with locale-aware redirect targets; (c) bots skip the locale auto-redirect.

- [ ] **Step 1: Read current `proxy.ts` (already shown above) and confirm matcher / redirect targets**

Current matcher: `/perfil/:path*`, `/login`, `/onboarding/:path*`, `/entrenamiento/:path*`. Hardcoded redirect URLs: `/login`, `/entrenamiento`, `/onboarding`.

- [ ] **Step 2: Replace `proxy.ts` with composed version**

```ts
// proxy.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/shared/i18n/routing';
import { getPathname } from '@/shared/i18n/routing';
import { detectLocaleFromAcceptLanguage, isBot } from '@/shared/i18n/locale-detect';

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false, // we do custom detection below (non-`es*` → EN)
});

function buildLocalizedUrl(
  href: '/login' | '/entrenamiento' | '/onboarding',
  locale: 'es' | 'en',
  origin: string,
) {
  const path = getPathname({ href, locale });
  // For ES (path-less default), getPathname returns "/login". For EN, "/en/login".
  return new URL(path, origin);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Skip locale handling entirely for API + auth routes (locale-neutral).
  const isApi = path.startsWith('/api');
  const isAuth = path.startsWith('/auth');
  const isAsset = path.startsWith('/_next') || path.includes('.');

  if (isApi || isAuth || isAsset) {
    return NextResponse.next();
  }

  // 2. Determine effective locale for this request:
  //    - URL prefix wins (e.g. /en/...).
  //    - Else cookie wins.
  //    - Else custom Accept-Language rule (non-`es*` → en), unless bot.
  const url = request.nextUrl;
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const ua = request.headers.get('user-agent');
  const acceptLang = request.headers.get('accept-language');

  const urlHasEnPrefix = url.pathname === '/en' || url.pathname.startsWith('/en/');
  let effectiveLocale: 'es' | 'en';
  if (urlHasEnPrefix) {
    effectiveLocale = 'en';
  } else if (cookieLocale === 'es' || cookieLocale === 'en') {
    effectiveLocale = cookieLocale;
  } else if (isBot(ua)) {
    effectiveLocale = 'es'; // bots get URL-as-requested; this only matters for unprefixed paths.
  } else {
    effectiveLocale = detectLocaleFromAcceptLanguage(acceptLang);
  }

  // 3. If this is the root, no cookie, non-bot, and detected locale is EN, redirect to /en/.
  //    (next-intl's built-in detection is disabled; we emulate with our custom rule.)
  if (
    !urlHasEnPrefix &&
    !cookieLocale &&
    !isBot(ua) &&
    effectiveLocale === 'en'
  ) {
    const newUrl = new URL(url);
    newUrl.pathname = '/en' + (url.pathname === '/' ? '' : url.pathname);
    const redirect = NextResponse.redirect(newUrl);
    redirect.cookies.set('NEXT_LOCALE', 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return redirect;
  }

  // 4. Run next-intl middleware (handles slug rewrites between ES↔EN pathnames).
  const intlResponse = intlMiddleware(request);
  if (intlResponse.headers.get('location')) {
    // next-intl issued a redirect (e.g. trailing slash, slug normalization). Trust it.
    return intlResponse;
  }

  // 5. Persist locale in cookie if not yet set (so we don't redirect again).
  if (!cookieLocale) {
    intlResponse.cookies.set('NEXT_LOCALE', effectiveLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  // 6. Run Supabase auth gating, layered on top of intlResponse.
  let response = intlResponse;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          // copy back the locale cookie we may have just set
          if (!cookieLocale) {
            response.cookies.set('NEXT_LOCALE', effectiveLocale, {
              path: '/',
              maxAge: 60 * 60 * 24 * 365,
              sameSite: 'lax',
            });
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const onboardingCompleted = user?.user_metadata?.onboarding_completed === true;
  const origin = request.nextUrl.origin;

  // Strip locale prefix to compare against canonical paths.
  const canonicalPath = urlHasEnPrefix
    ? path.replace(/^\/en/, '') || '/'
    : path;

  // --- Unauthenticated users ---
  if (!user) {
    if (canonicalPath.startsWith('/perfil') || canonicalPath.startsWith('/onboarding')) {
      return NextResponse.redirect(buildLocalizedUrl('/login', effectiveLocale, origin));
    }
    return response;
  }

  // --- Authenticated users ---
  if (canonicalPath === '/login') {
    const dest = onboardingCompleted ? '/entrenamiento' : '/onboarding';
    return NextResponse.redirect(buildLocalizedUrl(dest, effectiveLocale, origin));
  }
  if (!onboardingCompleted && !canonicalPath.startsWith('/onboarding')) {
    return NextResponse.redirect(buildLocalizedUrl('/onboarding', effectiveLocale, origin));
  }
  if (onboardingCompleted && canonicalPath.startsWith('/onboarding')) {
    return NextResponse.redirect(buildLocalizedUrl('/entrenamiento', effectiveLocale, origin));
  }

  return response;
}

export const config = {
  // Wider matcher than before: every page request goes through proxy for i18n.
  // Excludes API, auth, static assets, _next internals.
  matcher: ['/((?!api|auth|_next|.*\\..*).*)'],
};
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: build succeeds. If TS complains about `getPathname` typing on the `href` literal union, ensure those exact strings (`'/login'`, `'/entrenamiento'`, `'/onboarding'`) appear as keys in `pathnames` (they do — Task 2).

- [ ] **Step 4: Runtime smoke test**

```bash
npm run dev &
DEV_PID=$!
sleep 4
echo "--- ES default (no Accept-Language, no cookie):"
curl -sI http://localhost:3000/ | grep -E "HTTP|location|set-cookie"
echo "--- German visitor (should redirect to /en/):"
curl -sI -H "Accept-Language: de-DE,de;q=0.9,en;q=0.8" http://localhost:3000/ | grep -E "HTTP|location|set-cookie"
echo "--- Spanish visitor (no redirect):"
curl -sI -H "Accept-Language: es-ES,es;q=0.9" http://localhost:3000/ | grep -E "HTTP|location|set-cookie"
echo "--- Bot visitor (no redirect):"
curl -sI -H "User-Agent: Googlebot/2.1" -H "Accept-Language: en-US,en" http://localhost:3000/ | grep -E "HTTP|location|set-cookie"
echo "--- Direct /en/training:"
curl -sI http://localhost:3000/en/training | grep -E "HTTP|location"
echo "--- ES slug /entrenamiento:"
curl -sI http://localhost:3000/entrenamiento | grep -E "HTTP|location"
kill $DEV_PID 2>/dev/null
```

Expected:
- ES default → `200` (or `307` to login if you happened to be logged in; in dev with no session, expect `200`).
- German → `307`/`308` with `location: /en` and `Set-Cookie: NEXT_LOCALE=en`.
- Spanish → `200`, no redirect, `Set-Cookie: NEXT_LOCALE=es`.
- Bot → `200`, no redirect, no `NEXT_LOCALE` cookie.
- `/en/training` → `200`.
- `/entrenamiento` → `200`.

If `/en/training` 404s, check that next-intl's pathnames are wired (Task 2/3) and `app/[locale]/entrenamiento/page.tsx` exists (Task 7).

- [ ] **Step 5: Commit**

```bash
git add proxy.ts
git commit -m "feat(i18n): compose locale routing with auth gating in proxy"
```

---

## Task 11: Replace `next/link` and `next/navigation` imports

**Files:**
- Modify: every file under `app/[locale]/**` and `src/modules/**/ui/**` that imports from `next/link`, `next/navigation` (`useRouter`, `usePathname`, `redirect`).

- [ ] **Step 1: Find every offending import**

Use Grep:

- Pattern 1: `from ["']next/link["']`
- Pattern 2: `from ["']next/navigation["']`

Scope: `app/[locale]/**`, `src/modules/**`. Exclude `app/api/**`, `app/auth/**` (those don't need locale-aware routing).

```bash
# (Use the Grep tool, not raw rg, in the Claude environment.)
```

- [ ] **Step 2: For each match, swap the import**

| Old | New |
|---|---|
| `import Link from 'next/link'` | `import { Link } from '@/shared/i18n/routing'` |
| `import { usePathname, useRouter, redirect } from 'next/navigation'` | `import { usePathname, useRouter, redirect } from '@/shared/i18n/routing'` |
| `import { notFound, permanentRedirect, RedirectType } from 'next/navigation'` (and other non-routing exports) | **keep `next/navigation`** — only swap the four routing names listed |

Important: `notFound`, `useSearchParams`, `useParams`, `redirect` of-type-`replace` and other non-locale-aware utilities stay on `next/navigation`. `redirect` and `permanentRedirect` are exported by `@/shared/i18n/routing` (next-intl re-exports them) — prefer those for app routes so locale prefix is preserved.

If a file imports both kinds (e.g. `import { useRouter, useSearchParams } from 'next/navigation'`), split the import:

```tsx
import { useRouter } from '@/shared/i18n/routing';
import { useSearchParams } from 'next/navigation';
```

- [ ] **Step 3: Hardcoded path strings inside `<Link href="/entrenamiento">` etc.**

Localized `Link` accepts the canonical (ES) `href`; next-intl rewrites it per active locale. So `<Link href="/entrenamiento">` continues to work — clicking it from EN renders `/en/training`. Do NOT change hrefs.

For `useRouter().push('/foo')` calls, same rule — pass the canonical ES path.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: build succeeds. If TS complains "Argument of type '/foo' is not assignable to type AppPathname" — that path is missing from `pathnames` in `config.ts`. Either add it (if it's a real route) or use a string literal cast `as never` only as a last resort.

- [ ] **Step 5: Lint**

```bash
npm run lint
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(i18n): swap next/link and next/navigation for localized helpers"
```

---

## Task 12: Update `sitemap.ts` for hreflang × locale

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Replace `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/site";

type Entry = {
  esPath: string;
  enPath: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const PUBLIC_ROUTES: Entry[] = [
  { esPath: "/", enPath: "/en", priority: 1.0, changeFrequency: "weekly" },
  { esPath: "/que-es-athx", enPath: "/en/what-is-athx", priority: 0.9, changeFrequency: "monthly" },
  { esPath: "/privacidad", enPath: "/en/privacy", priority: 0.3, changeFrequency: "yearly" },
  { esPath: "/terminos", enPath: "/en/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const { esPath, enPath, priority, changeFrequency } of PUBLIC_ROUTES) {
    const languages = {
      es: `${SITE_URL}${esPath}`,
      en: `${SITE_URL}${enPath}`,
      "x-default": `${SITE_URL}${esPath}`,
    };

    entries.push({
      url: `${SITE_URL}${esPath}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    });

    entries.push({
      url: `${SITE_URL}${enPath}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    });
  }

  return entries;
}
```

- [ ] **Step 2: Verify sitemap output**

```bash
npm run dev &
DEV_PID=$!
sleep 4
curl -s http://localhost:3000/sitemap.xml | head -60
kill $DEV_PID 2>/dev/null
```

Expected: 8 `<url>` entries (4 routes × 2 locales), each with `<xhtml:link rel="alternate" hreflang="es" .../>`, `hreflang="en" .../>`, and `hreflang="x-default" .../>`.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): emit hreflang sitemap entries for ES + EN"
```

---

## Task 13: Update `robots.ts` to also disallow `/en/` private routes

**Files:**
- Modify: `app/robots.ts`

- [ ] **Step 1: Replace `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/site";

const PRIVATE_PATHS = [
  "/api/",
  "/auth/",
  "/admin/",
  "/onboarding",
  "/entrenamiento",
  "/perfil",
  "/bienvenida",
  "/preguntanos",
];

const PRIVATE_PATHS_EN = [
  "/en/admin/",
  "/en/onboarding",
  "/en/training",
  "/en/profile",
  "/en/welcome",
  "/en/contact",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS, ...PRIVATE_PATHS_EN],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev &
DEV_PID=$!
sleep 4
curl -s http://localhost:3000/robots.txt
kill $DEV_PID 2>/dev/null
```

Expected: includes `Disallow: /en/training` etc.

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "feat(seo): mirror private-path disallows for /en/ in robots"
```

---

## Task 14: `noindex` `/en/*` until Phase 2 ships translations

We don't want EN routes serving Spanish copy to be indexed and cause duplicate content. Until Phase 2 finishes, every `/en/*` page returns `noindex,nofollow`.

**Files:**
- Modify: `app/[locale]/layout.tsx` (add metadata that conditionally sets robots).

- [ ] **Step 1: Update `generateMetadata` in `app/[locale]/layout.tsx`**

Currently the file exports a static `metadata` constant. Replace it with a `generateMetadata` function that reads the `[locale]` param and sets `robots: { index: false, follow: false }` when `locale === 'en'`.

Add this near the existing imports:

```tsx
import type { Metadata } from "next";
```

Replace the existing `export const metadata: Metadata = { ... }` block with:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — Programación y entrenamiento ATHX`,
      template: `%s · ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: isEn ? "/en" : "/",
      languages: {
        es: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} — Programación y entrenamiento ATHX`,
      description: DEFAULT_DESCRIPTION,
      url: isEn ? `${SITE_URL}/en` : SITE_URL,
      locale: isEn ? "en_US" : LOCALE_PRIMARY,
      alternateLocale: isEn ? [LOCALE_PRIMARY] : LOCALE_ALTERNATES,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — Programación y entrenamiento ATHX`,
      description: DEFAULT_DESCRIPTION,
    },
    robots: isEn
      ? { index: false, follow: false }
      : {
          // keep whatever the original metadata had — copy verbatim from the
          // pre-edit file. If the original had no `robots` key, omit this branch.
          index: true,
          follow: true,
        },
  };
}
```

> Reviewer note: the original `app/layout.tsx` had a `robots:` block whose body ran past the snippet I read. **Before pasting, open the previous version of the file (`git show HEAD~1:app/layout.tsx` if needed) and copy the exact non-EN `robots` config into the `else` branch above.** Do not lose any existing robots flags.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Runtime check**

```bash
npm run dev &
DEV_PID=$!
sleep 4
echo "--- ES home meta robots:"
curl -s http://localhost:3000/ | grep -o '<meta name="robots"[^>]*>' | head -1
echo "--- EN home meta robots:"
curl -s http://localhost:3000/en | grep -o '<meta name="robots"[^>]*>' | head -1
kill $DEV_PID 2>/dev/null
```

Expected:
- ES: `<meta name="robots" content="index, follow"...>` (or whatever the original had).
- EN: `<meta name="robots" content="noindex, nofollow"...>`.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/layout.tsx"
git commit -m "feat(seo): noindex /en routes during phase 1 (until translations ship)"
```

---

## Task 15: Per-page `generateMetadata` — `alternates` for hreflang

Pages that already export their own `metadata` (e.g., `/que-es-athx`, `/privacidad`, `/terminos`, `/`) need their `alternates.canonical` and `alternates.languages` updated so Google sees the EN counterpart.

**Files:**
- Modify: any file matching `app/[locale]/**/page.tsx` or `app/[locale]/**/layout.tsx` that exports `metadata` or `generateMetadata`.

- [ ] **Step 1: Find offenders**

Grep `app/[locale]/**` for `export const metadata` and `export async function generateMetadata`.

- [ ] **Step 2: For each, refactor static `metadata` → `generateMetadata` accepting `params: Promise<{ locale }>`**

Pattern: at the top of the function, look up the EN slug for this route from the spec's slug map (or from `pathnames` in `config.ts` — but `config.ts` keys are ES paths, so reverse lookup is awkward; for Phase 1 just hardcode the two URLs per page).

Example for `app/[locale]/que-es-athx/page.tsx`:

```tsx
import type { Metadata } from "next";
import { SITE_URL } from "@/shared/seo/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "What is ATHX" : "Qué es ATHX",
    // ...preserve any existing description/og/twitter fields here unchanged...
    alternates: {
      canonical: isEn ? `${SITE_URL}/en/what-is-athx` : `${SITE_URL}/que-es-athx`,
      languages: {
        es: `${SITE_URL}/que-es-athx`,
        en: `${SITE_URL}/en/what-is-athx`,
        "x-default": `${SITE_URL}/que-es-athx`,
      },
    },
  };
}
```

Apply the same pattern to:
- `app/[locale]/page.tsx` → `/` ↔ `/en`
- `app/[locale]/que-es-athx/page.tsx` → `/que-es-athx` ↔ `/en/what-is-athx`
- `app/[locale]/privacidad/page.tsx` → `/privacidad` ↔ `/en/privacy`
- `app/[locale]/terminos/page.tsx` → `/terminos` ↔ `/en/terms`

(Private routes don't need this — they are `noindex` via the global `disallow` in `robots.ts` plus auth gating.)

For the `title` and `description` literals: keep them in Spanish for both locales for now (Phase 2 extracts to `messages/*.json`). The point of this task is hreflang correctness, not copy translation.

- [ ] **Step 3: Build + lint**

```bash
npm run lint && npm run build
```

Expected: both pass.

- [ ] **Step 4: Verify hreflang in HTML**

```bash
npm run dev &
DEV_PID=$!
sleep 4
echo "--- /que-es-athx hreflang:"
curl -s http://localhost:3000/que-es-athx | grep -E '(rel="canonical"|hreflang)'
echo "--- /en/what-is-athx hreflang:"
curl -s http://localhost:3000/en/what-is-athx | grep -E '(rel="canonical"|hreflang)'
kill $DEV_PID 2>/dev/null
```

Expected: both pages emit canonical pointing to themselves and 3 hreflang links (`es`, `en`, `x-default`).

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]"
git commit -m "feat(seo): per-page hreflang alternates for public routes"
```

---

## Task 16: Final smoke matrix

- [ ] **Step 1: Build clean**

```bash
rm -rf .next
npm run lint && npm run build
```

Expected: both pass.

- [ ] **Step 2: Manual browser check (record results)**

Start `npm run dev`, then verify in a real browser:

1. Visit `http://localhost:3000/` with `Accept-Language: es-ES` (set browser to Spanish or use a private window) → renders home, URL stays `/`, no redirect.
2. Visit `http://localhost:3000/` with `Accept-Language: de-DE` → redirects to `/en`, cookie `NEXT_LOCALE=en` set.
3. Visit `http://localhost:3000/entrenamiento` → renders training page (ES).
4. Visit `http://localhost:3000/en/training` → renders training page (still ES copy, since Phase 2 hasn't run; that's expected). Page source contains `<meta name="robots" content="noindex, nofollow">`.
5. Click a `<Link href="/que-es-athx">` from inside `/en/...` → routes to `/en/what-is-athx`.
6. Login flow with no session, visit `/perfil` (ES) → redirects to `/login`. Visit `/en/profile` → redirects to `/en/login`.
7. View page source on `/`: contains `<link rel="alternate" hreflang="en" href=".../en"/>` and `hreflang="x-default"`.
8. View `/sitemap.xml`: contains both ES and EN entries with hreflang alternates.

If any of these fail, fix before moving on.

- [ ] **Step 3: Commit any fixes from Step 2 individually**

(No batch — each fix gets its own conventional commit message.)

- [ ] **Step 4: Final tag**

```bash
git tag i18n-phase-1-done
```

(Push the tag separately if/when the user asks.)

---

## Done when

- All 16 tasks committed.
- `npm run build` clean.
- Manual smoke matrix in Task 16 passes.
- ES URLs unchanged from before this plan (verify by hitting `/`, `/entrenamiento`, `/perfil`, `/que-es-athx`).
- EN URLs serve content (still ES copy — Phase 2's job to translate) and carry `noindex`.
- Sitemap and robots emit ES + EN entries.
- German visitor auto-redirects to `/en/...`.
- Auth redirects respect active locale.

---

## Self-review (run by author after writing this plan)

**Spec coverage:**
- Section 4 (Architecture): config + routing + request files ✅ (Tasks 2-4); proxy composition ✅ (Task 10); `[locale]` move ✅ (Task 7); layout provider + `<html lang>` ✅ (Task 8).
- Section 5 (Slug map): encoded in `pathnames` ✅ (Task 2).
- Section 6 (Locale detection rules): bot skip, non-`es*` → EN, cookie override, URL-prefix wins ✅ (Tasks 9-10).
- Section 7 (SEO): hreflang in sitemap ✅ (Task 12); `<html lang>` ✅ (Task 8); per-page alternates ✅ (Task 15); `noindex` `/en/*` ✅ (Task 14); robots.txt covers `/en/` ✅ (Task 13).
- Section 8 (Switcher): **Phase 2** — explicitly out of scope here. (Switcher requires translated labels; ship in Phase 2.)
- Section 9 (DB): **Phase 3** — out of scope.
- Section 10 (Phasing) Phase 1 bullets: covered.
- Section 11 (Edge cases): bots ✅, API exclusion ✅, auth callback exclusion ✅, locale-aware auth redirects ✅. OG/Twitter image per-locale variants deferred to Phase 2 (acceptable — Phase 1 OG still works at app root).

**Placeholder scan:** none. All code blocks are complete; reviewer notes are explicit (Task 14 step 1 flags "copy original `robots` block").

**Type consistency:** `Locale` exported from `config.ts` and used everywhere. `getPathname({ href, locale })` signature matches next-intl v4. `pathnames` keys (ES paths) referenced consistently in Tasks 2/10/11/15.

**Scope:** Phase 1 only. No DB migration, no UI string extraction, no switcher, no per-locale OG.

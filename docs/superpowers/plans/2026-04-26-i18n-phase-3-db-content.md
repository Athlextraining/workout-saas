# i18n Phase 3 — DB Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate all admin-authored DB content (workout templates, email templates) to EN; add `profiles.locale` so signed-in users get a sticky preference; persist switcher choice; admin-only seed flow for EN workout content. After this phase, every public + private surface is fully bilingual.

**Architecture:** `workout_templates.week_content` migrates from a single `WeekContent` JSON to `{ es: WeekContent, en: WeekContent | null }` with ES fallback in the repo. `profiles.locale` (text, default `'es'`) is read by `email-client.ts` to pick the recipient's language; signup writes the active `NEXT_LOCALE` cookie value into the column; the language switcher persists changes via a server action when logged in. Email subject/body strings move into `messages/{es,en}.json` under `emails.*`; user-bound emails use `getTranslations({ locale: recipient.locale, namespace: 'emails' })`; admin notifications hardcode `'es'`. EN workout content is seeded via a TypeScript script (`scripts/seed-en-templates.ts`) that reads admin-authored EN translations from JSON files in `data/template-translations-en/`.

**Tech Stack:** Supabase Postgres + JSONB, next-intl 4 server APIs, Resend, Supabase server client.

**Spec:** `docs/superpowers/specs/2026-04-25-i18n-en-es-design.md` (sections 9.1, 9.2, 9.3, 9.4, 10-Phase-3).
**Prior phases:**
- Phase 1: `docs/superpowers/plans/2026-04-25-i18n-phase-1-infra.md`
- Phase 2: `docs/superpowers/plans/2026-04-25-i18n-phase-2-ui-strings.md`

**Reference docs (READ before coding):**
- Existing migrations under `supabase/migrations/` — confirm the naming convention (3-digit prefix). Highest current is `008_support_read_timestamps.sql`. New migrations in this phase: `009_profiles_locale.sql`, `010_workout_templates_localized.sql`.
- `src/modules/training/infra/template-repository.ts` — current single-locale read.
- `src/modules/training/domain/workout.ts` — `WeekContent`, `DayWorkout`, etc. shapes (field keys stay Spanish — those are domain identifiers, not user-facing text).
- `src/modules/support/infra/email-client.ts` — current literal email subjects/bodies.
- `src/shared/i18n/components/language-switcher.tsx` — Phase 2's switcher; we extend it to call a server action.
- `next-intl/server` `getTranslations({ locale, namespace })` — explicit-locale variant for cases where the recipient's locale ≠ active request locale (emails, admin context).

---

## File map (Phase 3)

**Created:**
- `supabase/migrations/009_profiles_locale.sql` — adds `profiles.locale text not null default 'es' check (locale in ('es','en'))`.
- `supabase/migrations/010_workout_templates_localized.sql` — wraps existing `week_content` in `{ es: <existing>, en: null }`.
- `src/modules/identity/application/update-profile-locale.ts` — server action: writes `profiles.locale` for the current user. Used by the switcher.
- `data/template-translations-en/<category>-<weekNumber>.json` — one file per template (12 files). Authored EN content (admin-authored).
- `scripts/seed-en-templates.ts` — Node script that reads each JSON file and writes `week_content.en` for the matching row via the Supabase service-role client.

**Modified:**
- `src/modules/training/domain/workout.ts` — add `LocalizedWeekContent` type alias for the storage layer (UI never sees the wrapper).
- `src/modules/training/infra/template-repository.ts` — `getTemplate(category, week, locale)` reads `[locale]` with ES fallback.
- `src/modules/training/application/get-current-week-workout.ts` — accepts `locale`, threads it into the repo call.
- `app/[locale]/entrenamiento/page.tsx` — call `await getLocale()` and pass to the use case.
- `src/modules/identity/application/sign-up.ts` — read `NEXT_LOCALE` cookie, persist to `profiles.locale` after auth row creation.
- `src/modules/identity/application/sign-in.ts` — opportunistically backfill `profiles.locale` if null (for users who signed up pre-Phase-3).
- `src/modules/support/infra/email-client.ts` — pull subjects/bodies from `messages/{es,en}.json` `emails.*`; receive `recipientLocale` param; use `getTranslations({ locale, namespace: 'emails' })`.
- `src/modules/support/application/send-new-message.ts` — pass admin's locale (hardcoded `'es'`) to email-client.
- `src/modules/support/application/reply-to-thread.ts` — pass recipient user's `profiles.locale` to email-client.
- `messages/es.json` and `messages/en.json` — add `emails.*` namespace (preserve all existing namespaces).
- `src/shared/i18n/components/language-switcher.tsx` — when user is logged in, fire-and-forget call to `updateProfileLocale` server action.
- `app/[locale]/perfil/page.tsx` — show current locale (read from profile); optional: small "Idioma / Language" badge that defers to the navbar/footer switcher (no separate setter needed since the switcher already does it).
- `package.json` — add a script: `"seed:en-templates": "tsx scripts/seed-en-templates.ts"`.

**Conventions from prior phases (carry forward):**
- Conventional commits, NEVER `Co-Authored-By: Claude` trailer.
- Use Edit tool (not sed) for modifications; Read first if needed.
- `npm run build` is the smoke gate (no test framework configured).
- Path alias `@/shared/*`, `@/modules/*`.
- Server components: `getTranslations`, `getLocale`, `getFormatter` from `next-intl/server`.
- Client components: `useTranslations`, `useLocale`, `useFormatter` from `next-intl`.
- For explicit-locale (emails, cross-locale): `getTranslations({ locale, namespace })`.

---

## Task 1: Migration — `profiles.locale`

**Files:**
- Create: `supabase/migrations/009_profiles_locale.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 009_profiles_locale.sql
alter table public.profiles
  add column locale text not null default 'es'
  check (locale in ('es', 'en'));

comment on column public.profiles.locale is
  'User language preference. Drives email language and any server-side transactional copy. UI follows URL/cookie, not this column.';
```

- [ ] **Step 2: Apply locally**

```bash
npx supabase db reset
```

OR if you already have local data and don't want to nuke it:

```bash
npx supabase migration up
```

(Check the project's current local-dev convention; `db reset` is safer if migrations are reproducible from scratch.)

- [ ] **Step 3: Regenerate Supabase types** (if the project uses generated types)

```bash
npx supabase gen types typescript --local > src/shared/infra/supabase/database.types.ts
```

If the project doesn't have generated types (the existing repo uses hand-written shapes), skip this step.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/009_profiles_locale.sql
git commit -m "feat(db): add profiles.locale column"
```

---

## Task 2: Migration — `workout_templates.week_content` JSONB shape

**Files:**
- Create: `supabase/migrations/010_workout_templates_localized.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 010_workout_templates_localized.sql
-- Wrap existing week_content under .es; .en starts null.
update public.workout_templates
set week_content = jsonb_build_object('es', week_content, 'en', null);

-- Document the new shape.
comment on column public.workout_templates.week_content is
  'JSONB shape: { es: WeekContent, en: WeekContent | null }. ES is canonical/required; EN may be null until seeded.';
```

- [ ] **Step 2: Apply locally**

```bash
npx supabase migration up
```

- [ ] **Step 3: Smoke-check the data**

```bash
npx supabase db query "select category, week_number, jsonb_typeof(week_content->'es') as es_type, jsonb_typeof(week_content->'en') as en_type from workout_templates limit 12;"
```

(If `db query` isn't a real subcommand in this project's Supabase CLI version, use the Supabase Studio UI at `http://localhost:54323` to run the query.)

Expected: every row has `es_type = 'object'` and `en_type = 'null'`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/010_workout_templates_localized.sql
git commit -m "feat(db): localize workout_templates.week_content as { es, en }"
```

---

## Task 3: Domain type — `LocalizedWeekContent`

**Files:**
- Modify: `src/modules/training/domain/workout.ts`

- [ ] **Step 1: Read the current file**

Confirm the existing exports: `WarmupExercise`, `StrengthExercise`, `WodExercise`, `Wod`, `DayWorkout`, `WeekContent` (or whatever it's named — check actual name), `WorkoutTemplate`.

- [ ] **Step 2: Add the storage-layer type**

Add at the bottom of the file (or near the existing WeekContent export):

```ts
import type { Locale } from '@/shared/i18n/config';

/**
 * Storage shape of `workout_templates.week_content` after migration 010.
 * UI code never sees this wrapper — the repo unwraps to the active locale's
 * WeekContent (with ES fallback when EN not yet seeded).
 */
export type LocalizedWeekContent = Record<Locale, WeekContent | null>;
```

If the existing exported name for the per-locale shape isn't `WeekContent` (e.g. it's inlined into `WorkoutTemplate`), extract it to a named export named `WeekContent` first, then add `LocalizedWeekContent`.

- [ ] **Step 3: Build verify**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/modules/training/domain/workout.ts
git commit -m "feat(training): add LocalizedWeekContent storage type"
```

---

## Task 4: Repository — read locale-aware WeekContent with ES fallback

**Files:**
- Modify: `src/modules/training/infra/template-repository.ts`

- [ ] **Step 1: Update the signature**

```ts
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import type { Category } from '@/modules/identity/domain/profile'
import type { WorkoutTemplate, WeekContent, LocalizedWeekContent } from '../domain/workout'
import type { Locale } from '@/shared/i18n/config'

export async function getTemplate(
  category: Category,
  weekNumber: number,
  locale: Locale,
): Promise<WorkoutTemplate | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('category', category)
    .eq('week_number', weekNumber)
    .single()

  if (!data) return null

  const localized = data.week_content as LocalizedWeekContent
  const content: WeekContent = localized[locale] ?? localized.es

  return {
    ...(data as Omit<WorkoutTemplate, 'week_content'>),
    week_content: content,
  } as WorkoutTemplate
}
```

The returned `WorkoutTemplate` keeps the legacy single-locale `week_content` shape so the rest of the codebase doesn't need to change.

- [ ] **Step 2: Find every caller and check signatures**

Use Grep over the codebase for `getTemplate(`. There should be one caller: `src/modules/training/application/get-current-week-workout.ts`. Update it in Task 5.

- [ ] **Step 3: Build verify**

```bash
npx tsc --noEmit
```

The build will fail at the use case — that's expected; Task 5 fixes it. **Do NOT commit yet** if TS errors exist outside the use case file.

- [ ] **Step 4: Hold the commit; combine with Task 5**

(No commit this task — Task 5 commits both together.)

---

## Task 5: Use case — accept locale, thread through

**Files:**
- Modify: `src/modules/training/application/get-current-week-workout.ts`

- [ ] **Step 1: Read the current file**

Note the current signature and dependencies (likely calls `getCurrentUser`, `getProfile`, `getCurrentCycleWeek`, `getTemplate`).

- [ ] **Step 2: Add a `locale: Locale` parameter**

```ts
import type { Locale } from '@/shared/i18n/config'

export async function getCurrentWeekWorkout(locale: Locale) {
  // ... existing logic ...
  const template = await getTemplate(profile.category, weekNumber, locale)
  // ... rest unchanged ...
}
```

If the function previously took zero arguments, adding `locale` requires updating the page caller — Task 6.

- [ ] **Step 3: Build verify**

```bash
npx tsc --noEmit
```

The build will fail at the page caller — Task 6 fixes it. Don't commit yet.

- [ ] **Step 4: Hold commit; combine with Task 6**

---

## Task 6: Page wires locale through

**Files:**
- Modify: `app/[locale]/entrenamiento/page.tsx`

- [ ] **Step 1: Read the file**

It should already be using `getTranslations('entrenamiento')` from Phase 2.

- [ ] **Step 2: Pull locale from `getLocale()` and pass to the use case**

```tsx
import { getLocale, getTranslations } from 'next-intl/server'
import { getCurrentWeekWorkout } from '@/modules/training/application/get-current-week-workout'
// ...

export default async function EntrenamientoPage() {
  const locale = await getLocale()
  const t = await getTranslations('entrenamiento')

  const result = await getCurrentWeekWorkout(locale as 'es' | 'en')
  // ... rest unchanged ...
}
```

The cast `locale as 'es' | 'en'` is safe here: middleware guarantees only `es`/`en` reach `[locale]` routes.

- [ ] **Step 3: Build verify**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 4: Smoke-check at runtime**

```bash
npm run start
```

Visit `/entrenamiento` (logged in, free week) — workout copy in ES (unchanged behavior, since EN content not seeded yet; `week_content.en` is null and the repo falls back to `es`).

Visit `/en/training` (logged in, free week) — workout copy still in ES (because `en` is null pre-seed; ES fallback). Page chrome already in EN from Phase 2.

This is the expected pre-seed state. Once Task 11 seeds EN content, `/en/training` will display EN.

- [ ] **Step 5: Commit Tasks 4 + 5 + 6 together**

```bash
git add src/modules/training/infra/template-repository.ts \
        src/modules/training/application/get-current-week-workout.ts \
        'app/[locale]/entrenamiento/page.tsx'
git commit -m "feat(training): locale-aware template read with ES fallback"
```

---

## Task 7: Sign-up writes `profiles.locale` from cookie

**Files:**
- Modify: `src/modules/identity/application/sign-up.ts`

- [ ] **Step 1: Read the current file**

It calls Supabase `auth.signUp`, then redirects. After signup, a `profiles` row is created (likely via DB trigger — check `supabase/migrations/001_initial_schema.sql` for the trigger that copies new auth users to `profiles`).

- [ ] **Step 2: After successful signup, write the locale**

```ts
'use server'

import { cookies } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/shared/i18n/routing'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'

export async function signUp(formData: FormData) {
  const locale = await getLocale()
  const supabase = await createSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    return { error: error.message }
  }

  // Persist locale preference to profile (best-effort; trigger creates the row).
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ locale })
      .eq('id', data.user.id)
  }

  redirect({ href: '/onboarding', locale })
}
```

- [ ] **Step 3: Build verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/identity/application/sign-up.ts
git commit -m "feat(identity): persist locale to profiles on signup"
```

---

## Task 8: Switcher persists to `profiles.locale` for logged-in users

**Files:**
- Create: `src/modules/identity/application/update-profile-locale.ts`
- Modify: `src/shared/i18n/components/language-switcher.tsx`

- [ ] **Step 1: Write the server action**

```ts
'use server'

import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import type { Locale } from '@/shared/i18n/config'

export async function updateProfileLocale(locale: Locale): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Anonymous users: nothing to persist; the cookie set client-side handles them.
  if (!user) return {}

  const { error } = await supabase
    .from('profiles')
    .update({ locale })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return {}
}
```

- [ ] **Step 2: Wire into the switcher**

In `src/shared/i18n/components/language-switcher.tsx`, import the action and fire-and-forget when the user clicks:

```tsx
import { updateProfileLocale } from '@/modules/identity/application/update-profile-locale'
// ...

function switchTo(target: 'es' | 'en') {
  if (target === locale) return
  document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  // Fire-and-forget: anonymous users get a no-op response.
  updateProfileLocale(target).catch(() => {})
  startTransition(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace({ pathname, params } as any, { locale: target })
  })
}
```

The `.catch(() => {})` swallows transient errors — locale persistence is best-effort and not load-bearing for the route switch.

- [ ] **Step 3: Build verify**

```bash
npm run build
```

- [ ] **Step 4: Smoke-check**

```bash
npm run start
```

Logged-in user clicks the switcher → check Supabase `profiles.locale` reflects the choice.

- [ ] **Step 5: Commit**

```bash
git add src/modules/identity/application/update-profile-locale.ts \
        src/shared/i18n/components/language-switcher.tsx
git commit -m "feat(i18n): persist switcher choice to profiles.locale when signed in"
```

---

## Task 9: Email templates — strings to messages, locale-aware send

**Files:**
- Modify: `messages/es.json` (add `emails.*` namespace; preserve all existing)
- Modify: `messages/en.json` (same)
- Modify: `src/modules/support/infra/email-client.ts`
- Modify: `src/modules/support/application/send-new-message.ts`
- Modify: `src/modules/support/application/reply-to-thread.ts`

- [ ] **Step 1: Inventory the literal email content**

Read `email-client.ts`. It has three send functions:
- `sendNewMessageToAdmin` — admin notification. Subject: `Mensaje de ${userEmail}`. Body: `${body}\n\n— ver hilo: ${link}`.
- `sendReplyToUser` — user-bound. Subject: `Re: [ATHLEX] ${subject}`. Body: `${body}\n\n— responde desde la app: ${link}`.
- `sendUserReplyToAdmin` — admin notification. (Check the actual file for any third function.)

Admin notifications stay ES-only (admin = internal team). User-bound emails become locale-aware.

- [ ] **Step 2: Add `emails.*` namespace to `messages/es.json`**

```json
"emails": {
  "newMessageToAdmin": {
    "subject": "Mensaje de {userEmail}",
    "bodyTrailer": "— ver hilo: {link}"
  },
  "replyToUser": {
    "subject": "Re: [ATHLEX] {subject}",
    "bodyTrailer": "— responde desde la app: {link}"
  },
  "userReplyToAdmin": {
    "subject": "Respuesta de {userEmail}",
    "bodyTrailer": "— ver hilo: {link}"
  }
}
```

Adjust to match exactly what the file has. Use ICU placeholders (`{userEmail}`, `{link}`, `{subject}`).

- [ ] **Step 3: Mirror in `messages/en.json`**

```json
"emails": {
  "newMessageToAdmin": {
    "subject": "Message from {userEmail}",
    "bodyTrailer": "— view thread: {link}"
  },
  "replyToUser": {
    "subject": "Re: [ATHLEX] {subject}",
    "bodyTrailer": "— reply from the app: {link}"
  },
  "userReplyToAdmin": {
    "subject": "Reply from {userEmail}",
    "bodyTrailer": "— view thread: {link}"
  }
}
```

- [ ] **Step 4: Refactor `email-client.ts`**

Each user-bound function takes a `recipientLocale: Locale` parameter. Admin functions hardcode `'es'` internally.

```ts
import { Resend } from 'resend'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/shared/i18n/config'

const key = process.env.RESEND_API_KEY
const resend = key ? new Resend(key) : null
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const ADMIN = process.env.ADMIN_EMAIL || ''

interface NewMessageInput {
  threadId: string
  subject: string
  body: string
  userEmail: string
  appUrl: string
}

interface ReplyInput {
  threadId: string
  subject: string
  body: string
  userEmail: string
  appUrl: string
  recipientLocale: Locale  // NEW
}

export async function sendNewMessageToAdmin(input: NewMessageInput) {
  if (!resend || !ADMIN) return { skipped: true }
  // Admin always receives ES.
  const t = await getTranslations({ locale: 'es', namespace: 'emails.newMessageToAdmin' })
  const link = `${input.appUrl}/admin/mensajes/${input.threadId}`
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    replyTo: input.userEmail,
    subject: t('subject', { userEmail: input.userEmail }),
    text: `${input.body}\n\n${t('bodyTrailer', { link })}`,
  })
  return { skipped: false }
}

export async function sendReplyToUser(input: ReplyInput) {
  if (!resend || !ADMIN) return { skipped: true }
  const t = await getTranslations({ locale: input.recipientLocale, namespace: 'emails.replyToUser' })
  // Note: link path uses ES slug for ES users, EN for EN users.
  const path = input.recipientLocale === 'en'
    ? `/en/contact/${input.threadId}`
    : `/preguntanos/${input.threadId}`
  const link = `${input.appUrl}${path}`
  await resend.emails.send({
    from: FROM,
    to: input.userEmail,
    replyTo: ADMIN,
    subject: t('subject', { subject: input.subject }),
    text: `${input.body}\n\n${t('bodyTrailer', { link })}`,
  })
  return { skipped: false }
}

// If sendUserReplyToAdmin exists, mirror sendNewMessageToAdmin's pattern.
```

- [ ] **Step 5: Update use cases that call email-client**

In `src/modules/support/application/reply-to-thread.ts`: when calling `sendReplyToUser`, pass `recipientLocale: thread.user.locale ?? 'es'`. Read the recipient's locale from `profiles.locale`. The use case already has access to a Supabase client and the user id of the thread owner.

In `src/modules/support/application/send-new-message.ts`: `sendNewMessageToAdmin` doesn't take `recipientLocale` (admin = ES). No change needed beyond calling the updated function.

- [ ] **Step 6: Build verify**

```bash
npm run build
```

- [ ] **Step 7: Manual smoke (if Resend keys are configured locally)**

Send a test reply from admin to a logged-in EN user. Check the email arrives in EN.

If Resend isn't wired locally, defer the live test to staging.

- [ ] **Step 8: Commit**

```bash
git add messages/es.json messages/en.json \
        src/modules/support/infra/email-client.ts \
        src/modules/support/application/reply-to-thread.ts \
        src/modules/support/application/send-new-message.ts
git commit -m "feat(emails): localize user-bound email subjects and trailers"
```

---

## Task 10: Sign-in opportunistic backfill of `profiles.locale`

**Files:**
- Modify: `src/modules/identity/application/sign-in.ts`

Users who signed up before Task 7 won't have `profiles.locale` set to anything other than the default `'es'`. For them, the first time they log in we backfill the column from their `NEXT_LOCALE` cookie if the cookie is non-default and the column is still default.

This is mild and idempotent — skip it entirely if you'd rather treat the column as set-once-on-signup. (Recommend: keep it; it costs one extra UPDATE on first login per pre-existing user.)

- [ ] **Step 1: Modify `sign-in.ts`**

After successful auth:

```ts
const { data: { user } } = await supabase.auth.getUser()
if (user && (locale === 'es' || locale === 'en')) {
  // Backfill only if profile still has the default 'es'.
  // We don't read first to avoid a roundtrip; the UPDATE is conditional.
  await supabase
    .from('profiles')
    .update({ locale })
    .eq('id', user.id)
    .eq('locale', 'es')
    .neq('locale', locale)
}
```

(The `.eq('locale', 'es')` plus `.neq('locale', locale)` chain ensures we only update rows that are currently default ES AND we're not trying to set them back to ES — a no-op safeguard.)

- [ ] **Step 2: Build verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/identity/application/sign-in.ts
git commit -m "feat(identity): opportunistic backfill of profiles.locale on sign-in"
```

---

## Task 11: Seed EN content for the 12 workout templates

This is the biggest content task. Templates are 6 weeks × 2 categories = 12 rows. Each has a `WeekContent` object with daily warmup/strength/wod/recuperacion content.

**Strategy:** instead of writing translations directly into a script, store EN content as 12 JSON files in `data/template-translations-en/` (one per row). The script reads them and writes to the DB. This separates content authoring from execution and lets a non-engineer review/diff the EN copy.

**Files:**
- Create: `data/template-translations-en/<category>-<weekNumber>.json` (12 files; e.g. `athx-1.json`, `athx-2.json`, ..., `athx-pro-6.json`).
- Create: `scripts/seed-en-templates.ts`
- Modify: `package.json` (add the script entry).

- [ ] **Step 1: Dump the existing ES content for reference**

Run a query against local Supabase:

```bash
npx supabase db query "select category, week_number, week_content->'es' as es from workout_templates order by category, week_number;" > /tmp/existing-es.json
```

(Adjust to your project's actual query mechanism.)

- [ ] **Step 2: Author the 12 EN JSON files**

For each template row, create `data/template-translations-en/<category>-<weekNumber>.json` with the **same shape** as the ES `week_content` (`{ days: { lunes: { titulo, warmup[], fuerza[], wod, recuperacion } , martes: ... } }`), translating only the **string values**:

- `nombre` (exercise names): translate generic ones ("Sentadilla" → "Squat", "Peso muerto" → "Deadlift"). Keep brand-specific or technical lifts as-is when ambiguous ("AMRAP", "EMOM", barbell complex names).
- `notas`, `descripcion`, `repeticiones` (when free-form): translate.
- `recuperacion` (recovery): translate.
- `titulo` (day titles): translate.
- Numeric values, percentages, sets/reps shorthand: do not translate.

Field keys (`nombre`, `notas`, `series`, etc.) STAY in Spanish — those are domain identifiers, not user-facing.

This step is content authoring. **It is intentional that this isn't fully scripted** — the EN copy must be reviewed by a coach who understands the lifts. The plan describes the format; an admin/coach fills the values.

For dispatch agents: if the agent is asked to do this fully autonomously, dispatch a separate "translate JSON" subagent per row, providing the ES JSON and asking for a faithful EN translation following the rules above. Do not invent exercises. Quote unfamiliar terms verbatim if uncertain.

- [ ] **Step 3: Write `scripts/seed-en-templates.ts`**

```ts
// scripts/seed-en-templates.ts
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
})

const DIR = path.resolve(process.cwd(), 'data', 'template-translations-en')

async function main() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.json'))
  if (files.length === 0) {
    console.error('No JSON files in', DIR)
    process.exit(1)
  }

  for (const file of files) {
    // Filename format: <category>-<weekNumber>.json (e.g. athx-1.json, athx-pro-6.json)
    const stem = file.replace(/\.json$/, '')
    const lastDash = stem.lastIndexOf('-')
    const category = stem.slice(0, lastDash) // 'athx' or 'athx-pro'
    const weekNumber = Number(stem.slice(lastDash + 1))
    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      console.warn(`Skipping ${file}: cannot parse week number`)
      continue
    }

    const enContent = JSON.parse(await readFile(path.join(DIR, file), 'utf-8'))

    // Read the existing row to preserve es; merge en.
    const { data: existing, error: readErr } = await supabase
      .from('workout_templates')
      .select('week_content')
      .eq('category', category)
      .eq('week_number', weekNumber)
      .single()

    if (readErr || !existing) {
      console.error(`Row not found for ${category}/${weekNumber}:`, readErr?.message)
      continue
    }

    const merged = {
      ...(existing.week_content as Record<string, unknown>),
      en: enContent,
    }

    const { error: writeErr } = await supabase
      .from('workout_templates')
      .update({ week_content: merged })
      .eq('category', category)
      .eq('week_number', weekNumber)

    if (writeErr) {
      console.error(`Update failed for ${category}/${weekNumber}:`, writeErr.message)
      continue
    }
    console.log(`✓ Seeded ${category}/${weekNumber}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 4: Add script entry to `package.json`**

```jsonc
"scripts": {
  // ... existing ...
  "seed:en-templates": "tsx scripts/seed-en-templates.ts"
}
```

If `tsx` isn't already a devDep, install it:

```bash
npm install -D tsx
```

- [ ] **Step 5: Run the seed locally**

```bash
npm run seed:en-templates
```

Expected: 12 lines `✓ Seeded <category>/<n>`.

- [ ] **Step 6: Verify in DB**

```bash
npx supabase db query "select category, week_number, jsonb_typeof(week_content->'en') as en_type from workout_templates order by category, week_number;"
```

Expected: every row has `en_type = 'object'` (no longer null).

- [ ] **Step 7: Smoke at runtime**

```bash
npm run start
```

Visit `/en/training` (logged in, free week) → workout content now in EN.

Visit `/entrenamiento` (logged in, free week) → workout content still in ES (unchanged).

- [ ] **Step 8: Commit**

```bash
git add data/template-translations-en scripts/seed-en-templates.ts package.json package-lock.json
git commit -m "feat(training): seed EN content for 12 workout templates"
```

For production: run the same script against the prod DB after deploying the migrations. (`SUPABASE_SERVICE_ROLE_KEY` for prod environment, then `npm run seed:en-templates`.) Document in the post-merge test plan.

---

## Task 12: `/perfil` — surface current locale (read-only badge)

**Files:**
- Modify: `app/[locale]/perfil/page.tsx`

The user can change their language via the navbar/footer switcher. We don't need a separate setter inside `/perfil`. But surfacing the current saved preference closes the loop — users see what's persisted vs what's just-cookie.

- [ ] **Step 1: Read the current page**

It reads `getCurrentUser`, `getActiveSubscription`. We need to extend it to read `profiles.locale` for display.

- [ ] **Step 2: Read the locale from the profile**

Use the existing `getCurrentProfile` use case (under `src/modules/identity/application/`) — it already returns the `profiles` row. If `getCurrentProfile` doesn't include `locale`, extend its select to include it.

- [ ] **Step 3: Render a small badge in the profile card**

In the existing `glass rounded-xl p-5 space-y-3` card, after the subscription block, add:

```tsx
<div className="border-t border-white/10" />
<p>
  <span className="text-muted text-sm">{t('fields.language')}</span>
  <br />
  {profile.locale === 'en' ? 'English' : 'Español'}
</p>
```

Add the corresponding key to `messages/es.json` under `perfil.fields.language` ("Idioma") and `messages/en.json` ("Language").

- [ ] **Step 4: Build + smoke**

```bash
npm run build
```

Visit `/perfil` (logged in) → see current locale rendered.

- [ ] **Step 5: Commit**

```bash
git add 'app/[locale]/perfil/page.tsx' messages/es.json messages/en.json
git commit -m "feat(perfil): show saved locale in profile card"
```

---

## Task 13: Final smoke matrix + tag

- [ ] **Step 1: Clean build**

```bash
rm -rf .next
npm run lint && npm run build
```

Expected: build passes; lint at the same baseline as prior phases.

- [ ] **Step 2: Production-style smoke**

```bash
npm run start
```

Verify the matrix:

| # | Scenario | Expected |
|---|---|---|
| 1 | Anonymous visitor, `/en/training` | UI in EN. Page chrome from messages, workout copy from `week_content.en` (now seeded). |
| 2 | Anonymous visitor, `/entrenamiento` | UI in ES. Workout copy from `week_content.es`. |
| 3 | New user signs up with `NEXT_LOCALE=en` cookie | After signup, `profiles.locale = 'en'`. Confirm via Supabase studio. |
| 4 | Logged-in user clicks switcher ES → EN on any page | URL flips, cookie set, `profiles.locale` updated to `'en'` (verify in DB). |
| 5 | Admin replies to thread for an EN user | Email arrives in EN. (Manual test if Resend keys configured.) |
| 6 | Admin reply to ES user | Email arrives in ES. |
| 7 | New thread created by EN user (notifies admin) | Email arrives in ES (admin always ES). |
| 8 | `/perfil` displays current saved locale | Yes. |
| 9 | DB has 12 rows with `week_content.en != null` | Yes. |

- [ ] **Step 3: Tag**

```bash
git tag i18n-phase-3-done
```

---

## Done when

- All 13 tasks committed.
- `npm run build` passes.
- Migrations 009 and 010 applied locally and ready for prod.
- Seed script run locally; 12 templates have EN content.
- Smoke matrix (Task 13 step 2) all green.
- Production deploy plan documented (see "Post-merge actions" below).

---

## Post-merge actions (production)

1. Apply migrations 009 + 010 against prod (via your usual Supabase deploy flow).
2. Set `SUPABASE_SERVICE_ROLE_KEY` for prod (or use the existing one) and run `npm run seed:en-templates` pointing at prod. Verify 12 rows updated.
3. Deploy the branch.
4. Smoke `/en/training` against prod with a real subscribed test account. Confirm EN content renders.
5. Send a test admin reply to a test EN user. Confirm EN email arrives.

---

## Out of scope (future)

- Per-locale Stripe pricing (`currency_options` + geo) — spec §9.7. Trigger when paid EN traffic becomes meaningful.
- Translating user-typed `support_messages.body` content. Stays as-typed.
- Auth error message localization (Supabase returns English; map-to-key remains future polish).
- Languages beyond ES + EN.
- Region-specific ES variants (`es-MX` vs `es-ES`).

---

## Self-review (run after writing this plan)

**Spec coverage:**
- §9.1 (workout_templates JSONB) — Tasks 2, 3, 4, 5, 6, 11.
- §9.2 (profiles.locale) — Tasks 1, 7, 8, 10, 12.
- §9.3 (email templates) — Task 9.
- §9.4 (support messages stay user-typed) — explicitly out of scope; documented.
- §10 Phase 3 bullets — all covered.

**Placeholder scan:**
- Task 11 step 2 (authoring 12 JSON files) is intentionally not fully specified — content needs human/coach review. Acceptable; the plan documents the format and rules. Dispatch agents can do the per-row translation work as separate subagent calls if desired.
- Every other step has actual code or actual SQL.

**Type / pattern consistency:**
- `Locale` from `@/shared/i18n/config` everywhere.
- `LocalizedWeekContent` storage type isolated to the repo layer; UI sees plain `WeekContent`.
- `getTranslations({ locale, namespace })` for explicit-locale use (emails). `getTranslations(namespace)` for active-request-locale (pages).
- Conventional commits, no Claude trailer.

**Scope:**
- DB content + locale persistence + email + seed flow. No UI string extraction (Phase 2 territory). No Stripe currency (future).

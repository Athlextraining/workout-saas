# Public Week-1 Preview — Design

Date: 2026-06-05
Status: Approved

## Goal

Let an unregistered visitor see the first week's training on `/entrenamiento`
without logging in. The first day (lunes) is fully viewable. Other days are
locked behind a register/login CTA. Today the page redirects every anonymous
visitor to a full-screen sign-up CTA with no workout shown.

## Decisions

- Public preview shows the **ATHX PRO**, week 1 template.
- Only the **first day (lunes)** is open for anonymous visitors. Mar–Dom locked.
- Locked days present the CTA **in place** (the day card is swapped for a
  blurred teaser + register/login CTA). The visitor stays on the page.
- A persistent register CTA banner sits below the week, visible even while the
  free day is shown.
- The workout timer stays visible (no user-specific data needed).

## Constraint: RLS

`workout_templates` has RLS allowing reads only for `auth.role() = 'authenticated'`
(migration 006). Anonymous server client cannot read it. The preview therefore
fetches via the **admin (service-role) client**, scoped to exactly one row
(ATHX PRO, week 1). No migration; no broad anon exposure of other weeks.

## Components

### Repository — `src/modules/training/infra/template-repository.ts`
Add `getPublicTemplate(category, weekNumber, locale)`:
- Same query shape as `getTemplate`, but uses `createSupabaseAdminClient()`
  instead of the server client.
- Existing `getTemplate` is untouched.

### Use case — `src/modules/training/application/get-preview-workout.ts`
`getPreviewWorkout(locale): Promise<UserWeekWorkout | null>`
- Calls `getPublicTemplate('athx_pro', 1, locale)`.
- Returns `{ ...template, cycle_number: 1, week_number: 1 }` or `null`.
- No auth, no profile lookup.

### Page — `app/[locale]/entrenamiento/page.tsx`
In the `!user` branch:
- Fetch `getPreviewWorkout(locale)`.
- If it returns `null` → keep the existing full-screen `ctaUnregistered`
  section as a fallback.
- If it returns a workout → render the normal `train-page` layout:
  - Header badge: `ATHX PRO · Semana 1` (regular glass badge, not admin).
  - `WeekView` with `preview` mode, `maxes` all null.
  - `WorkoutTimer compact`.
  - Below the week: a persistent register CTA banner (always visible).

### WeekView — `app/[locale]/entrenamiento/week-view.tsx`
Add `preview?: boolean` prop.
- When `preview`:
  - Force `active` initial state and `todayKey` to `'lunes'`.
  - Day pills mar–dom render a small lock glyph; lunes renders normally.
  - Selecting a locked day renders an in-place **gate card** instead of the
    `DayCard`: blurred teaser + lock icon + register/login CTA linking to
    `/login` (via `@/shared/i18n/routing` `Link`).
  - The lunes `DayCard` hides the done-toggle (no persistence for anon).
- Non-preview behavior is unchanged.

## i18n

New `entrenamiento.preview` keys in `messages/es.json` and `messages/en.json`:
- `lockedTitle`, `lockedSubtitle`, `lockedButton`
- `bannerTitle`, `bannerSubtitle`, `bannerButton`

Update `messages/_keys.md` if it tracks keys.

## Out of scope

- No change to subscribed/paywall logic for registered users.
- No DB migration.
- No change to admin week override.

## Dependency graph delta (AGENTS.md)

- `entrenamiento/page.tsx` ─→ add `training.get-preview-workout`
- `training/application/get-preview-workout.ts` ─→ `training.template-repository.getPublicTemplate`
- `training/infra/template-repository.ts` ─→ add admin-client read (`shared.supabase.admin`)

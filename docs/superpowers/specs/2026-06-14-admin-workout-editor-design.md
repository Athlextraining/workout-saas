# Admin Workout Editor — Design

Date: 2026-06-14
Context: `training` bounded context + new admin route

## Goal

Let an admin edit the workout programming (`workout_templates`) directly from a
dedicated admin section, editing one block at a time as JSON, in both languages
(ES + EN), with schema validation before saving to Supabase. Must respect the
block structure and allow adding strength (`fuerza`) to a day that has none.

## Data model (existing — do not change)

`workout_templates` (12 rows = 2 categories × 6 weeks). Since migration 010,
`content` is stored localized:

```ts
type LocalizedWeekContent = Record<Locale, WeekContent | null> // { es, en }
type WeekContent = Record<DayKey, DayWorkout>                   // 7 days
interface DayWorkout {
  titulo: string
  warmup?: WarmupExercise[]
  fuerza?: StrengthExercise[]
  wod?: Wod
  recuperacion?: string
}
```

Editable blocks per day: `titulo`, `warmup`, `fuerza`, `wod`, `recuperacion`.

## Decisions

- **Granularity:** per block (not whole day/week).
- **Languages:** edit ES and EN together, side by side.
- **Location:** dedicated route `app/[locale]/admin/entrenos/`.
- **Validation:** JSON textarea + schema validation on save (reject if invalid).
- **Block editor layout:** two textareas side by side (ES | EN).
- **Auth:** reuse existing `requireAdmin` from `support/application` (depends only
  on identity; app-layer cross-context import is allowed). Not moved now.

## Routes

```
app/[locale]/admin/entrenos/
├─ page.tsx                  — grid of 12 templates (category × week 1-6). requireAdmin.
├─ [category]/[week]/
│  └─ page.tsx               — 7 days; each day lists its blocks with a "Modificar"
│                              button. Empty blocks show an "Añadir" slot (e.g. add
│                              fuerza where none exists). requireAdmin.
└─ block-editor.tsx          — client component (the ES|EN editor + save).
```

## Component: block-editor.tsx (client)

- Receives `category`, `week`, `day`, `blockKey`, and the current ES/EN value.
- `titulo` / `recuperacion` (strings) → simple text input per language, no JSON.
- `warmup` / `fuerza` / `wod` → two textareas side by side (ES | EN) with the
  block JSON for that language.
- Save button → calls the `update-template-block` server action.
- Shows parse errors and schema errors inline; does not save on error.

## Application layer (training context)

- `application/get-admin-template.ts` (NEW) — `requireAdmin`, returns the raw
  `LocalizedWeekContent` (both languages) via `getRawTemplate`.
- `application/update-template-block.ts` (NEW, `'use server'`) —
  signature: `(category, week, day, blockKey, { es, en })`.
  1. `requireAdmin`.
  2. Validate `es` and `en` with `validateBlock(blockKey, value)`. If either
     errors, return `{ error }` and do NOT touch the DB.
  3. Call `updateTemplateBlock` (merge only this block).
  4. `revalidatePath` for the affected admin page and `/entrenamiento`.
  Returns `{ error?: string }`.

## Domain: workout-validators.ts (NEW)

`validateBlock(blockKey, value): { error?: string }` dispatching per type:

- `titulo`, `recuperacion` → string (may be empty).
- `warmup` → array of `{ nombre: string, repeticiones: string, notas?: string }`.
- `fuerza` → array of `{ nombre: string, series: number, repeticiones: string,
  tempo?: string, peso?: string, pct_1rm?: number, notas?: string }`.
- `wod` → `{ tipo: string, cap?: string, descripcion: string,
  ejercicios: WodExercise[], notas?: string }` where each ejercicio is
  `{ nombre: string, repeticiones: string, peso?: string, notas?: string }`.
- Empty value (`[]`, `null`, `""`) is allowed and means "remove the block".

Pure TS, no I/O. Hand-written (project has no zod).

## Infra: template-repository.ts (+2 functions)

- `getRawTemplate(category, week): Promise<LocalizedWeekContent | null>` — admin
  client, returns both languages unwrapped from the row.
- `updateTemplateBlock(category, week, day, blockKey, { es, en })` — admin client
  (bypass RLS):
  1. Read the row's `content`.
  2. For each locale present, set `content[locale][day][blockKey] = value`
     (delete the key if value is empty → removes the block).
  3. Write the merged `content` back. Does not touch other days/blocks/locales.

## Save flow

```
block-editor (ES + EN)
  → update-template-block action
    → requireAdmin
    → validateBlock(es) / validateBlock(en)   ── error → {error}, no DB write
    → updateTemplateBlock (merge single block)
    → revalidatePath(admin page, /entrenamiento)
  → UI shows success or error
```

## Error handling

- Invalid JSON (parse fail): caught in the client and again server-side → message,
  no save.
- Schema invalid: `validateBlock` returns the offending message → no save.
- DB write failure: surfaced as `{ error }`.

## Testing

- TDD unit tests for `validateBlock`: valid fuerza; `series` not a number; wod
  missing `ejercicios`; empty value = remove; bad warmup item.
- Use case `update-template-block` with mocked repo/admin: rejects on validation
  error, writes on success, merges only the target block.

## Out of scope (YAGNI)

- Version history / audit trail.
- Live preview of edits.
- Whole-day or whole-week editing.
- Creating new weeks/categories (the 12 rows already exist).

## Dependency graph additions (update AGENTS.md in implementation commit)

```
app/[locale]/admin/entrenos/
├─ page.tsx                 ─→ support.require-admin + training.get-admin-template (list)
├─ [category]/[week]/page.tsx ─→ support.require-admin + training.get-admin-template
│                              + training.ui.block-editor
└─ block-editor.tsx         ─→ training.update-template-block + training.workout-validators

src/modules/training/
├─ domain/workout-validators.ts   (validateBlock — pure)
├─ infra/template-repository.ts   (+ getRawTemplate, updateTemplateBlock)
└─ application/
   ├─ get-admin-template.ts       ─→ support.require-admin + training.template-repository
   └─ update-template-block.ts    ─→ support.require-admin + training.{workout-validators, template-repository}
```

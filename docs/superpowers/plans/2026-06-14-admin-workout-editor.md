# Admin Workout Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a dedicated `/admin/entrenos` section to edit `workout_templates` one block at a time, as JSON, in both languages (ES + EN), with schema validation before saving to Supabase.

**Architecture:** Pure domain validator (`validateBlock`) gates every save. Repo functions read/merge a single block into the localized `content` via the service-role admin client (bypass RLS). Use cases enforce `requireAdmin` and run validation. New admin route renders a grid of the 12 templates → per-day block editors. A client `BlockEditor` shows side-by-side ES|EN textareas and calls a server action.

**Tech Stack:** Next.js 16 (App Router, `[locale]` routes, next-intl), Supabase JS, TypeScript. Tests via Node's built-in test runner (`node --test`) loaded through `tsx` (already a devDep) — no new test framework.

**Spec:** `docs/superpowers/specs/2026-06-14-admin-workout-editor-design.md`

---

## File structure

- `package.json` — add `test` script (modify).
- `src/modules/training/domain/workout-validators.ts` — `validateBlock` + `BlockKey` (create).
- `src/modules/training/domain/workout-validators.test.ts` — unit tests (create).
- `src/modules/training/infra/template-repository.ts` — add `getRawTemplate`, `updateTemplateBlock` (modify).
- `src/modules/training/application/get-admin-template.ts` — use case (create).
- `src/modules/training/application/update-template-block.ts` — server action use case (create).
- `app/[locale]/admin/entrenos/page.tsx` — template grid (create).
- `app/[locale]/admin/entrenos/block-editor.tsx` — client editor (create).
- `app/[locale]/admin/entrenos/[category]/[week]/page.tsx` — day/block list (create).
- `AGENTS.md` — dependency graph update (modify).

---

## Task 1: Test runner script

**Files:**
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Add the `test` script**

In `package.json`, add to `"scripts"` (after `"lint": "eslint",`):

```json
    "test": "node --import tsx --test",
```

- [ ] **Step 2: Verify the runner works**

Run: `node --import tsx --test --test-name-pattern="__none__" src/modules/training/domain/workout.ts 2>&1 | head -5`
Expected: runs without "unknown flag" / loader errors (0 tests found is fine). If `--import tsx` errors, fall back to `node --loader tsx --test` and use that form in the script instead.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add node:test runner script via tsx"
```

---

## Task 2: Domain validator (TDD)

**Files:**
- Create: `src/modules/training/domain/workout-validators.ts`
- Test: `src/modules/training/domain/workout-validators.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/modules/training/domain/workout-validators.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateBlock } from './workout-validators'

test('valid fuerza passes', () => {
  const r = validateBlock('fuerza', [{ nombre: 'Back Squat', series: 5, repeticiones: '5' }])
  assert.equal(r.error, undefined)
})

test('fuerza with non-number series fails', () => {
  const r = validateBlock('fuerza', [{ nombre: 'Back Squat', series: '5', repeticiones: '5' }])
  assert.match(r.error ?? '', /series/)
})

test('valid wod passes', () => {
  const r = validateBlock('wod', {
    tipo: 'AMRAP', descripcion: '12 min',
    ejercicios: [{ nombre: 'Burpee', repeticiones: '10' }],
  })
  assert.equal(r.error, undefined)
})

test('wod missing ejercicios fails', () => {
  const r = validateBlock('wod', { tipo: 'AMRAP', descripcion: '12 min' })
  assert.match(r.error ?? '', /ejercicios/)
})

test('empty value removes block (valid)', () => {
  assert.equal(validateBlock('fuerza', []).error, undefined)
  assert.equal(validateBlock('warmup', null).error, undefined)
  assert.equal(validateBlock('wod', null).error, undefined)
})

test('warmup item missing nombre fails', () => {
  const r = validateBlock('warmup', [{ repeticiones: '10' }])
  assert.match(r.error ?? '', /nombre/)
})

test('titulo must be string', () => {
  assert.equal(validateBlock('titulo', 'Lunes fuerte').error, undefined)
  assert.match(validateBlock('titulo', 123).error ?? '', /texto/)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --import tsx --test src/modules/training/domain/workout-validators.test.ts`
Expected: FAIL — cannot find module `./workout-validators`.

- [ ] **Step 3: Write the implementation**

Create `src/modules/training/domain/workout-validators.ts`:

```ts
export type BlockKey = 'titulo' | 'warmup' | 'fuerza' | 'wod' | 'recuperacion'

export interface BlockValidationResult {
  error?: string
}

function isString(v: unknown): v is string {
  return typeof v === 'string'
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v)
}
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function isEmpty(v: unknown): boolean {
  return (
    v === null ||
    v === undefined ||
    v === '' ||
    (Array.isArray(v) && v.length === 0)
  )
}

export function validateBlock(blockKey: BlockKey, value: unknown): BlockValidationResult {
  switch (blockKey) {
    case 'titulo':
    case 'recuperacion':
      if (value === null || value === undefined) return {}
      if (!isString(value)) return { error: `${blockKey} debe ser texto` }
      return {}
    case 'warmup':
      return validateWarmup(value)
    case 'fuerza':
      return validateFuerza(value)
    case 'wod':
      return validateWod(value)
    default:
      return { error: `Bloque desconocido: ${blockKey}` }
  }
}

function validateWarmup(value: unknown): BlockValidationResult {
  if (isEmpty(value)) return {}
  if (!Array.isArray(value)) return { error: 'warmup debe ser una lista' }
  for (let i = 0; i < value.length; i++) {
    const e = value[i]
    if (!isObject(e)) return { error: `warmup[${i}] debe ser un objeto` }
    if (!isString(e.nombre)) return { error: `warmup[${i}].nombre requerido (texto)` }
    if (!isString(e.repeticiones)) return { error: `warmup[${i}].repeticiones requerido (texto)` }
    if (e.notas !== undefined && !isString(e.notas)) return { error: `warmup[${i}].notas debe ser texto` }
  }
  return {}
}

function validateFuerza(value: unknown): BlockValidationResult {
  if (isEmpty(value)) return {}
  if (!Array.isArray(value)) return { error: 'fuerza debe ser una lista' }
  for (let i = 0; i < value.length; i++) {
    const e = value[i]
    if (!isObject(e)) return { error: `fuerza[${i}] debe ser un objeto` }
    if (!isString(e.nombre)) return { error: `fuerza[${i}].nombre requerido (texto)` }
    if (!isNumber(e.series)) return { error: `fuerza[${i}].series requerido (número)` }
    if (!isString(e.repeticiones)) return { error: `fuerza[${i}].repeticiones requerido (texto)` }
    if (e.tempo !== undefined && !isString(e.tempo)) return { error: `fuerza[${i}].tempo debe ser texto` }
    if (e.peso !== undefined && !isString(e.peso)) return { error: `fuerza[${i}].peso debe ser texto` }
    if (e.pct_1rm !== undefined && !isNumber(e.pct_1rm)) return { error: `fuerza[${i}].pct_1rm debe ser número` }
    if (e.notas !== undefined && !isString(e.notas)) return { error: `fuerza[${i}].notas debe ser texto` }
  }
  return {}
}

function validateWod(value: unknown): BlockValidationResult {
  if (isEmpty(value)) return {}
  if (!isObject(value)) return { error: 'wod debe ser un objeto' }
  if (!isString(value.tipo)) return { error: 'wod.tipo requerido (texto)' }
  if (!isString(value.descripcion)) return { error: 'wod.descripcion requerido (texto)' }
  if (value.cap !== undefined && !isString(value.cap)) return { error: 'wod.cap debe ser texto' }
  if (value.notas !== undefined && !isString(value.notas)) return { error: 'wod.notas debe ser texto' }
  if (!Array.isArray(value.ejercicios)) return { error: 'wod.ejercicios debe ser una lista' }
  for (let i = 0; i < value.ejercicios.length; i++) {
    const e = value.ejercicios[i]
    if (!isObject(e)) return { error: `wod.ejercicios[${i}] debe ser un objeto` }
    if (!isString(e.nombre)) return { error: `wod.ejercicios[${i}].nombre requerido (texto)` }
    if (!isString(e.repeticiones)) return { error: `wod.ejercicios[${i}].repeticiones requerido (texto)` }
    if (e.peso !== undefined && !isString(e.peso)) return { error: `wod.ejercicios[${i}].peso debe ser texto` }
    if (e.notas !== undefined && !isString(e.notas)) return { error: `wod.ejercicios[${i}].notas debe ser texto` }
  }
  return {}
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --import tsx --test src/modules/training/domain/workout-validators.test.ts`
Expected: PASS — all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/modules/training/domain/workout-validators.ts src/modules/training/domain/workout-validators.test.ts
git commit -m "feat(training): add workout block schema validator"
```

---

## Task 3: Repository read/merge functions

**Files:**
- Modify: `src/modules/training/infra/template-repository.ts`

- [ ] **Step 1: Add imports**

At the top of `src/modules/training/infra/template-repository.ts`, extend the existing imports so they include `LocalizedWeekContent`, `WeekContent`, and `BlockKey`:

```ts
import type { WorkoutTemplate, WeekContent, LocalizedWeekContent } from '../domain/workout'
import type { BlockKey } from '../domain/workout-validators'
```

(The `WorkoutTemplate, WeekContent, LocalizedWeekContent` import line already exists — just add the `BlockKey` import line below it.)

- [ ] **Step 2: Append `getRawTemplate`**

Add at the end of the file:

```ts
/**
 * Returns the full localized content (both languages) for the admin editor.
 * Service-role client — gated by requireAdmin in the use case.
 */
export async function getRawTemplate(
  category: Category,
  weekNumber: number,
): Promise<LocalizedWeekContent | null> {
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('workout_templates')
    .select('content')
    .eq('category', category)
    .eq('week_number', weekNumber)
    .single()

  if (!data) return null
  return data.content as LocalizedWeekContent
}
```

- [ ] **Step 3: Append `updateTemplateBlock`**

Add at the end of the file:

```ts
/**
 * Merges a single block into one day, for each provided locale, leaving every
 * other day/block/locale untouched. Empty value removes the block. Service-role
 * client — gated by requireAdmin in the use case.
 */
export async function updateTemplateBlock(
  category: Category,
  weekNumber: number,
  day: keyof WeekContent,
  blockKey: BlockKey,
  byLocale: Partial<Record<Locale, unknown>>,
): Promise<{ error?: string }> {
  const supabase = createSupabaseAdmin()
  const { data, error: readErr } = await supabase
    .from('workout_templates')
    .select('content')
    .eq('category', category)
    .eq('week_number', weekNumber)
    .single()

  if (readErr || !data) return { error: 'Plantilla no encontrada' }

  const content = data.content as LocalizedWeekContent

  for (const [locale, value] of Object.entries(byLocale) as [Locale, unknown][]) {
    const week = content[locale]
    if (!week) continue
    const dayWorkout = week[day] as Record<string, unknown> | undefined
    if (!dayWorkout) continue

    const empty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)

    if (empty) {
      delete dayWorkout[blockKey]
    } else {
      dayWorkout[blockKey] = value
    }
  }

  const { error: writeErr } = await supabase
    .from('workout_templates')
    .update({ content })
    .eq('category', category)
    .eq('week_number', weekNumber)

  if (writeErr) return { error: writeErr.message }
  return {}
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: No errors found.

- [ ] **Step 5: Commit**

```bash
git add src/modules/training/infra/template-repository.ts
git commit -m "feat(training): repo functions to read and merge template blocks"
```

---

## Task 4: Application use cases

**Files:**
- Create: `src/modules/training/application/get-admin-template.ts`
- Create: `src/modules/training/application/update-template-block.ts`

- [ ] **Step 1: Create `get-admin-template.ts`**

```ts
import { requireAdmin } from '@/modules/support/application/require-admin'
import { getRawTemplate } from '../infra/template-repository'
import type { Category } from '@/modules/identity/domain/profile'
import type { LocalizedWeekContent } from '../domain/workout'

export async function getAdminTemplate(
  category: Category,
  weekNumber: number,
): Promise<LocalizedWeekContent | null> {
  await requireAdmin()
  return getRawTemplate(category, weekNumber)
}
```

- [ ] **Step 2: Create `update-template-block.ts`**

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/modules/support/application/require-admin'
import { validateBlock, type BlockKey } from '../domain/workout-validators'
import { updateTemplateBlock } from '../infra/template-repository'
import type { Category } from '@/modules/identity/domain/profile'
import type { WeekContent } from '../domain/workout'
import type { Locale } from '@/shared/i18n/config'

export async function updateTemplateBlockAction(
  category: Category,
  weekNumber: number,
  day: keyof WeekContent,
  blockKey: BlockKey,
  byLocale: Partial<Record<Locale, unknown>>,
): Promise<{ error?: string }> {
  await requireAdmin()

  for (const value of Object.values(byLocale)) {
    const { error } = validateBlock(blockKey, value)
    if (error) return { error }
  }

  const result = await updateTemplateBlock(category, weekNumber, day, blockKey, byLocale)
  if (result.error) return result

  revalidatePath('/[locale]/admin/entrenos/[category]/[week]', 'page')
  revalidatePath('/[locale]/entrenamiento', 'page')
  return {}
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: No errors found.

- [ ] **Step 4: Commit**

```bash
git add src/modules/training/application/get-admin-template.ts src/modules/training/application/update-template-block.ts
git commit -m "feat(training): admin use cases to read and update template blocks"
```

---

## Task 5: Block editor client component

**Files:**
- Create: `app/[locale]/admin/entrenos/block-editor.tsx`

- [ ] **Step 1: Create `block-editor.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTemplateBlockAction } from '@/modules/training/application/update-template-block'
import type { BlockKey } from '@/modules/training/domain/workout-validators'
import type { WeekContent } from '@/modules/training/domain/workout'

interface Props {
  category: 'athx' | 'athx_pro'
  week: number
  day: keyof WeekContent
  blockKey: BlockKey
  valueEs: unknown
  valueEn: unknown
}

const STRING_BLOCKS: BlockKey[] = ['titulo', 'recuperacion']

export function BlockEditor({ category, week, day, blockKey, valueEs, valueEn }: Props) {
  const router = useRouter()
  const isString = STRING_BLOCKS.includes(blockKey)
  const [open, setOpen] = useState(false)
  const [es, setEs] = useState(() => serialize(valueEs, isString))
  const [en, setEn] = useState(() => serialize(valueEn, isString))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setError(null)
    let parsedEs: unknown
    let parsedEn: unknown
    try {
      parsedEs = isString ? es : parseJson(es)
      parsedEn = isString ? en : parseJson(en)
    } catch (e) {
      setError('JSON inválido: ' + (e as Error).message)
      return
    }
    setSaving(true)
    const result = await updateTemplateBlockAction(category, week, day, blockKey, {
      es: parsedEs,
      en: parsedEn,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="border-t border-white/10 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{blockKey}</span>
        <button onClick={() => setOpen((o) => !o)} className="text-xs underline">
          {open ? 'Cerrar' : 'Modificar'}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted">ES</label>
              <textarea
                value={es}
                onChange={(e) => setEs(e.target.value)}
                rows={isString ? 2 : 8}
                className="w-full text-xs font-mono bg-black/30 rounded p-2"
              />
            </div>
            <div>
              <label className="text-xs text-muted">EN</label>
              <textarea
                value={en}
                onChange={(e) => setEn(e.target.value)}
                rows={isString ? 2 : 8}
                className="w-full text-xs font-mono bg-black/30 rounded p-2"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg btn-gradient text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  )
}

function serialize(value: unknown, isString: boolean): string {
  if (value === null || value === undefined) return ''
  if (isString) return String(value)
  return JSON.stringify(value, null, 2)
}

function parseJson(text: string): unknown {
  const trimmed = text.trim()
  if (trimmed === '') return null
  return JSON.parse(trimmed)
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: No errors found.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/admin/entrenos/block-editor.tsx"
git commit -m "feat(training): block editor client component (ES|EN JSON)"
```

---

## Task 6: Admin route pages

**Files:**
- Create: `app/[locale]/admin/entrenos/page.tsx`
- Create: `app/[locale]/admin/entrenos/[category]/[week]/page.tsx`

- [ ] **Step 1: Create the index page**

`app/[locale]/admin/entrenos/page.tsx`:

```tsx
import { requireAdmin } from '@/modules/support/application/require-admin'
import { Link } from '@/shared/i18n/routing'

const CATEGORIES: { key: 'athx' | 'athx_pro'; label: string }[] = [
  { key: 'athx', label: 'ATHX' },
  { key: 'athx_pro', label: 'ATHX PRO' },
]
const WEEKS = [1, 2, 3, 4, 5, 6]

export default async function AdminEntrenosPage() {
  await requireAdmin()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Editor de entrenos</h1>
      {CATEGORIES.map((cat) => (
        <div key={cat.key} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{cat.label}</h2>
          <div className="grid grid-cols-3 gap-3">
            {WEEKS.map((w) => (
              <Link
                key={w}
                href={`/admin/entrenos/${cat.key}/${w}`}
                className="glass rounded-xl p-4 text-center hover:opacity-80"
              >
                Semana {w}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create the detail page**

`app/[locale]/admin/entrenos/[category]/[week]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/modules/support/application/require-admin'
import { getAdminTemplate } from '@/modules/training/application/get-admin-template'
import { isCategory } from '@/modules/identity/domain/profile'
import type { WeekContent } from '@/modules/training/domain/workout'
import type { BlockKey } from '@/modules/training/domain/workout-validators'
import { BlockEditor } from '../../block-editor'

const DAYS: (keyof WeekContent)[] = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
]
const BLOCKS: BlockKey[] = ['titulo', 'warmup', 'fuerza', 'wod', 'recuperacion']

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; week: string }>
}) {
  await requireAdmin()
  const { category, week } = await params

  if (!isCategory(category)) notFound()
  const weekNumber = parseInt(week)
  if (!(weekNumber >= 1 && weekNumber <= 6)) notFound()

  const content = await getAdminTemplate(category, weekNumber)
  if (!content) notFound()

  const es = content.es
  const en = content.en

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {category === 'athx_pro' ? 'ATHX PRO' : 'ATHX'} · Semana {weekNumber}
      </h1>
      {DAYS.map((day) => {
        const esDay = es?.[day] as Record<string, unknown> | undefined
        const enDay = en?.[day] as Record<string, unknown> | undefined
        return (
          <section key={day} className="mb-8 glass rounded-xl p-4">
            <h2 className="text-lg font-semibold capitalize mb-3">{day}</h2>
            {BLOCKS.map((blockKey) => (
              <BlockEditor
                key={blockKey}
                category={category}
                week={weekNumber}
                day={day}
                blockKey={blockKey}
                valueEs={esDay?.[blockKey] ?? null}
                valueEn={enDay?.[blockKey] ?? null}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: No type errors; lint passes.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, log in as an admin user, visit `/es/admin/entrenos`.
Expected: grid of ATHX / ATHX PRO × 6 weeks. Click one → 7 days, each with `titulo/warmup/fuerza/wod/recuperacion` rows. Click "Modificar" on `fuerza` → ES|EN textareas with JSON. Edit, Guardar → saves, panel closes, value persists on reload. Enter invalid JSON → error shown, not saved. Enter `fuerza` with `"series": "5"` → schema error. Visit as a non-admin → redirected to home.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/admin/entrenos/page.tsx" "app/[locale]/admin/entrenos/[category]/[week]/page.tsx"
git commit -m "feat(training): admin entrenos route with per-block editor"
```

---

## Task 7: Update dependency graph

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add the new nodes to the dependency graph**

In `AGENTS.md`, under the `app/` section of the dependency graph, add:

```
├─ admin/entrenos/
│  ├─ page.tsx                   ─→ support.require-admin
│  ├─ [category]/[week]/page.tsx ─→ support.require-admin + training.get-admin-template
│  │                                + identity.profile.isCategory + entrenos.block-editor
│  └─ block-editor.tsx           ─→ training.{update-template-block, workout-validators}
```

Under `src/modules/training/`, add to the listing:

```
│  ├─ domain/workout-validators.ts (validateBlock, BlockKey — pure)
│  ├─ infra/template-repository.ts  (+ getRawTemplate, updateTemplateBlock)
│  └─ application/
│     ├─ get-admin-template.ts    ─→ support.require-admin + training.template-repository
│     └─ update-template-block.ts ─→ support.require-admin + training.{workout-validators, template-repository}
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update dependency graph for admin workout editor"
```

---

## Notes / risks

- **`requireAdmin` lives in `support/application`** but only depends on `identity`. Reused here as an app-layer cross-context import (allowed). If a third context ever needs it, consider moving it to `identity`.
- **`revalidatePath` with localized routes:** the `'/[locale]/...'` page-pattern form is best-effort; the client `router.refresh()` after save is what guarantees the editor shows fresh data.
- **No automated tests for repo/use case/UI:** the project has no Supabase test harness. Risk is covered by typecheck + the manual verification in Task 6. Only the pure validator is unit-tested (Task 2).
- **Server action arg safety:** `byLocale` values are JSON-parsed plain objects/strings/null — serializable across the client→server boundary.

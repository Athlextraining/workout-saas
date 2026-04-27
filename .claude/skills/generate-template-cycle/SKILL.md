---
name: generate-template-cycle
description: Generate the 6-week shared workout template cycle (12 workouts: 6 ATHX + 6 ATHX PRO) and upload to Supabase
user_invocable: true
---

# Generate Template Cycle

Generate the full 6-week shared workout template for ATHX Games 2026 preparation. Creates 12 templates (6 ATHX + 6 ATHX PRO) and uploads them to Supabase `workout_templates` table.

## Steps

1. Ask the user if they want to:
   - Generate all 12 templates (full cycle)
   - Generate a specific (category, week) combination
   - Default: full cycle if no answer.

2. Read env vars from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Read RAG context from `data/athx/`:
   - `data/athx/workouts-2026.md`
   - `data/athx/movement-standards-2026.md`

4. For each (category, week_number) pair to generate:
   - For weeks > 1, fetch the previous week's template from Supabase to use as progression context:
     ```bash
     curl -s "${SUPABASE_URL}/rest/v1/workout_templates?category=eq.${CATEGORY}&week_number=eq.${PREV_WEEK}&select=content" \
       -H "apikey: ${SERVICE_ROLE_KEY}" \
       -H "Authorization: Bearer ${SERVICE_ROLE_KEY}"
     ```
     Read previous week from `content.es` (canonical). Use it as progression baseline.
   - Generate the workout JSON in BOTH locales (`es` and `en`) following the methodology below.

5. Upsert each template:
   ```bash
   curl -s "${SUPABASE_URL}/rest/v1/workout_templates" \
     -H "apikey: ${SERVICE_ROLE_KEY}" \
     -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
     -H "Content-Type: application/json" \
     -H "Prefer: resolution=merge-duplicates" \
     -d @- <<'EOF'
   {
     "category": "athx" | "athx_pro",
     "week_number": N,
     "content": { "es": { ...WeekContent_ES }, "en": { ...WeekContent_EN } },
     "model_version": "claude-opus-4-7"
   }
   EOF
   ```
   The unique constraint is `(category, week_number)`.

6. Confirm: "Generated N templates. Cycle ready."

## Methodology — ATHX Games 2026 prep

**Competition target:** ATHX Games 2026 — 3 events (Strength, Endurance, MetCon X). See `data/athx/workouts-2026.md` and `data/athx/movement-standards-2026.md` for full details.

**Cycle structure (6 weeks):**
- Weeks 1-2: BASE — moderate volume, RPE 6-7, technique focus
- Weeks 3-4: BUILD — high volume, RPE 7-8, progressive loads
- Week 5: PEAK — max intensity, RPE 8-9, simulate competition
- Week 6: DELOAD/TAPER — low volume, RPE 5-6, recovery

**Weekly schedule (5 training days + recovery + rest):**
- Lunes, Martes, Miercoles, Viernes, Sabado: training
- Jueves: recuperacion activa (run/swim/mobility)
- Domingo: descanso completo

**Daily structure (training days):**
1. **Warmup** — 2-3 rounds, 8-12 min, prep for the day's movements
2. **Fuerza** — Strength block. EMOM, Every X min, or build to heavy. 8-15 min.
3. **WOD** — Metcon. For Time, AMRAP, EMOM, chipper. 8-20 min.

**Weekly requirements:**
- At least 1 day Strict Press
- At least 1 day Back Squat
- At least 1 day Deadlift
- At least 1 day long cardio (row + run, prep Endurance event)
- At least 1 day MetCon X movements (ski-erg, GTOH, sandbag, box jumps, lunges, burpee broad jumps)

**Category differences:**
- ATHX: alternate dumbbell GTOH, suitcase walking lunges, 750m switches in endurance
- ATHX PRO: dual dumbbell GTOH, front rack walking lunges, 1000m switches, heavier loads (sandbag 70/50 vs 50/30, DB 22.5/15 vs 20/12.5)

**Strength loading:** Use `pct_1rm` field where applicable (frontend will compute actual weight from user's 1RM in future). Use RPE as fallback.

## JSON output structure

The `content` column is a JSONB with shape `{ es: WeekContent, en: WeekContent }`. Both locales are required (no nulls). Day keys (`lunes`..`domingo`) stay in Spanish in BOTH locales — they are stable identifiers, not user-visible strings.

`WeekContent` (same shape under both `es` and `en`):

```json
{
  "lunes": {
    "titulo": "Fuerza: Back Squat + Metcon",
    "warmup": [
      { "nombre": "Row", "repeticiones": "300m" },
      { "nombre": "Air Squats", "repeticiones": "10" }
    ],
    "fuerza": [
      {
        "nombre": "Back Squat",
        "series": 5,
        "repeticiones": "5",
        "tempo": "Every 2 min for 10 min",
        "peso": "RPE 7",
        "pct_1rm": 70,
        "notas": "2 series de calentamiento previas"
      }
    ],
    "wod": {
      "tipo": "Rounds For Time",
      "cap": "12 min",
      "descripcion": "4 Rounds For Time (Cap 12 min)",
      "ejercicios": [
        { "nombre": "DB GTOH alterno", "repeticiones": "20", "peso": "20/12.5 kg" },
        { "nombre": "Box Jump Over", "repeticiones": "12", "notas": "24\"/20\"" }
      ]
    }
  },
  "martes": { ... },
  "miercoles": { ... },
  "jueves": { "titulo": "Recuperacion activa", "recuperacion": "30-40 min carrera suave + movilidad 15 min" },
  "viernes": { ... },
  "sabado": { ... },
  "domingo": { "titulo": "Descanso", "recuperacion": "Descanso completo" }
}
```

**Field formats:**
- Warmup: `{ "nombre": str, "repeticiones": str, "notas"?: str }`
- Fuerza: `{ "nombre": str, "series": int, "repeticiones": str, "tempo"?: str, "peso"?: str, "pct_1rm"?: int, "notas"?: str }`
- WOD: `{ "tipo": str, "cap"?: str, "descripcion": str, "ejercicios": [...], "notas"?: str }`
- WOD ejercicio: `{ "nombre": str, "repeticiones": str, "peso"?: str, "notas"?: str }`

## Language (bilingual output — REQUIRED)

Generate two parallel `WeekContent` objects with identical structure, keys, numbers, sets/reps, weights, percentages, and day keys. Only the human-readable strings differ.

Translate in `en`:
- `titulo` → English (e.g. "Fuerza: Back Squat + Metcon" → "Strength: Back Squat + Metcon")
- `descripcion` (WOD) → English
- `notas` → English
- `recuperacion` → English
- `tempo` → English ("Every 2 min for 10 min" stays; "Cada 2 min..." → "Every 2 min...")

Keep identical (do NOT translate) in BOTH locales:
- Day keys: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo` (stable identifiers)
- Movement names (`nombre`): use the universal English CrossFit name in both locales (Thruster, Wall Ball, Toes-to-Bar, Clean & Jerk, Snatch, Box Jump Over, Back Squat, Deadlift, Strict Press, Row, Burpee, etc.)
- Numbers, `series`, `repeticiones`, `peso`, `pct_1rm`, `cap`, `tipo` codes (For Time / AMRAP / EMOM stay English in both)

Example pair (lunes):
```json
{
  "es": { "lunes": { "titulo": "Fuerza: Back Squat + Metcon", "wod": { "descripcion": "4 Rounds For Time (Cap 12 min)", ... } } },
  "en": { "lunes": { "titulo": "Strength: Back Squat + Metcon", "wod": { "descripcion": "4 Rounds For Time (Cap 12 min)", ... } } }
}
```

Sanity check before upsert: `Object.keys(content.es).sort()` must equal `Object.keys(content.en).sort()`.

## Progression rules

- Don't repeat the exact same WOD or strength movement from the previous week
- Vary metcon formats (For Time, AMRAP, EMOM, chipper) across the week and across weeks
- Strength: progressive loading via RPE/pct_1rm increases week over week (except deload week 6)
- Vary accessory work and warmups week to week

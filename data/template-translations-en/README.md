# EN Workout Template Translations

One JSON file per template row: `<category>-<weekNumber>.json`.

Twelve files total: `athx-1.json` ... `athx-6.json`, `athx_pro-1.json` ... `athx_pro-6.json`.

Each file contains the EN translation of a row's `week_content` — same shape as the ES original, with string values translated. Field keys (`nombre`, `notas`, `series`, `tipo`, etc.) STAY in Spanish (they're domain identifiers, not user-facing text).

## Source of truth for ES (reference)

The canonical ES templates live in the production Supabase database (`workout_templates` table, `week_content.es` column). They were seeded in commit 8661ddb. A snapshot for translators will be generated and saved to `data/template-translations-es-snapshot/` before this translation step.

## Running the seed

```bash
npm run seed:en-templates
```

Reads each JSON in this directory and writes its content to `workout_templates.week_content.en` for the matching row. Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in env.

The script preserves `week_content.es` — it only updates the `.en` key.

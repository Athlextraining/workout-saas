import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
})

const DIR = path.resolve(process.cwd(), 'data', 'template-translations-en')

async function main() {
  let files: string[]
  try {
    files = (await readdir(DIR)).filter((f) => f.endsWith('.json'))
  } catch (err) {
    console.error('Cannot read', DIR, err instanceof Error ? err.message : err)
    process.exit(1)
  }

  if (files.length === 0) {
    console.error('No JSON files in', DIR)
    process.exit(1)
  }

  for (const file of files) {
    // Filename format: <category>-<weekNumber>.json (e.g. athx-1.json, athx-pro-6.json)
    const stem = file.replace(/\.json$/, '')
    const lastDash = stem.lastIndexOf('-')
    if (lastDash < 0) {
      console.warn(`Skipping ${file}: cannot parse name`)
      continue
    }
    const category = stem.slice(0, lastDash).replace(/-/g, '_')
    const weekNumber = Number(stem.slice(lastDash + 1))
    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      console.warn(`Skipping ${file}: cannot parse week number`)
      continue
    }

    let enContent: unknown
    try {
      enContent = JSON.parse(await readFile(path.join(DIR, file), 'utf-8'))
    } catch (err) {
      console.error(
        `Failed to parse ${file}:`,
        err instanceof Error ? err.message : err,
      )
      continue
    }

    const { data: existing, error: readErr } = await supabase
      .from('workout_templates')
      .select('week_content')
      .eq('category', category)
      .eq('week_number', weekNumber)
      .single()

    if (readErr || !existing) {
      console.error(
        `Row not found for ${category}/${weekNumber}:`,
        readErr?.message ?? '(no data)',
      )
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

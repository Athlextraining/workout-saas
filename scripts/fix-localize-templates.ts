import { createClient } from '@supabase/supabase-js'

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  const { data, error } = await s
    .from('workout_templates')
    .select('category,week_number,content')

  if (error) {
    console.error(error)
    process.exit(1)
  }

  for (const row of data ?? []) {
    const c = row.content as Record<string, unknown>
    if (c.es && c.en && Object.keys(c).length === 2) {
      console.log(`${row.category}/${row.week_number}: already localized, skip`)
      continue
    }

    const en = c.en ?? null
    const esEntries = Object.entries(c).filter(([k]) => k !== 'en')
    const es = Object.fromEntries(esEntries)

    const next = { es, en }
    const { error: writeErr } = await s
      .from('workout_templates')
      .update({ content: next })
      .eq('category', row.category)
      .eq('week_number', row.week_number)

    if (writeErr) {
      console.error(`fail ${row.category}/${row.week_number}:`, writeErr.message)
      continue
    }
    console.log(`✓ fixed ${row.category}/${row.week_number}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

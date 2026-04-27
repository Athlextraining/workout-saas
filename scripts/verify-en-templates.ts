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
    .order('category')
    .order('week_number')

  if (error) {
    console.error(error)
    process.exit(1)
  }

  for (const row of data ?? []) {
    const c = row.content as { es?: unknown; en?: unknown }
    const esOk = !!c?.es
    const enOk = !!c?.en
    console.log(
      `${row.category}/${row.week_number}: es=${esOk ? 'yes' : 'NO'} en=${enOk ? 'yes' : 'NO'}`,
    )
  }

  const sample = data?.find((r) => r.category === 'athx' && r.week_number === 1)
  if (sample) {
    const c = sample.content as Record<string, unknown>
    console.log('\nathx/1 sample:')
    console.log('  top-level keys:', Object.keys(c))
    console.log('  es keys:', Object.keys((c.es as object) ?? {}))
    console.log('  en keys:', Object.keys((c.en as object) ?? {}))
    console.log('  en preview:', JSON.stringify(c.en).slice(0, 500))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

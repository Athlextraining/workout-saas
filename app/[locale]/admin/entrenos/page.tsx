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
                href={{
                  pathname: '/admin/entrenos/[category]/[week]',
                  params: { category: cat.key, week: String(w) },
                }}
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

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { getCyclePhase } from '@/modules/training/domain/cycle'

interface Props {
  category: 'athx' | 'athx_pro'
  weekNumber: number
  phaseLabel: string
}

export function AdminWeekBadge({ category, weekNumber, phaseLabel }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phase = getCyclePhase(weekNumber)

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.replace(`?${params.toString()}`)
  }

  const categoryLabel = category === 'athx_pro' ? 'ATHX PRO' : 'ATHX'

  return (
    <span className="inline-flex items-center gap-2">
      <span className="badge badge--pill badge--glass relative cursor-pointer select-none">
        {categoryLabel} ▾
        <select
          value={category}
          onChange={(e) => setParam('cat', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
          aria-label="Seleccionar categoría"
        >
          <option value="athx">ATHX</option>
          <option value="athx_pro">ATHX PRO</option>
        </select>
      </span>
      <span
        className={`badge badge--pill badge--glass phase-${phase.code.toLowerCase()} relative cursor-pointer select-none`}
      >
        <span className="badge-dot phase-chip-dot" />
        {phaseLabel} {weekNumber} ▾
        <select
          value={weekNumber}
          onChange={(e) => setParam('week', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
          aria-label="Seleccionar semana"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {phaseLabel} {i + 1}
            </option>
          ))}
        </select>
      </span>
    </span>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { getCyclePhase } from '@/modules/training/domain/cycle'

interface Props {
  categoryLabel: string
  weekNumber: number
  phaseLabel: string
}

export function AdminWeekBadge({ categoryLabel, weekNumber, phaseLabel }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phase = getCyclePhase(weekNumber)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('week', e.target.value)
    router.replace(`?${params.toString()}`)
  }

  return (
    <span
      className={`badge badge--pill badge--glass phase-${phase.code.toLowerCase()} relative cursor-pointer select-none`}
    >
      <span className="badge-dot phase-chip-dot" />
      {categoryLabel} · {phaseLabel} {weekNumber} ▾
      <select
        value={weekNumber}
        onChange={handleChange}
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
  )
}

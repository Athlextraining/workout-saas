import { getMondayOf } from '@/shared/utils/dates'

export interface UserCycleWeek {
  cycleNumber: number
  weekNumber: number
}

const WEEKS_PER_CYCLE = 6
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export function getUserCycleWeek(cycleStartDate: string | Date): UserCycleWeek {
  let start: Date
  if (typeof cycleStartDate === 'string') {
    const [y, m, d] = cycleStartDate.split('-').map(Number)
    start = new Date(y, m - 1, d)
  } else {
    start = cycleStartDate
  }
  const startMonday = getMondayOf(start)
  // Semana arranca domingo 22:00 hora Madrid (Lun 00:00 − 2h).
  // toLocaleString respeta DST → 22:00 Madrid exacto todo el año.
  const SHIFT_MS = 2 * 60 * 60 * 1000
  const nowMadrid = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
  )
  const todayMonday = getMondayOf(new Date(nowMadrid.getTime() + SHIFT_MS))

  const weeksElapsed = Math.floor(
    (todayMonday.getTime() - startMonday.getTime()) / MS_PER_WEEK
  )
  const safeWeeks = Math.max(0, weeksElapsed)

  return {
    cycleNumber: Math.floor(safeWeeks / WEEKS_PER_CYCLE) + 1,
    weekNumber: (safeWeeks % WEEKS_PER_CYCLE) + 1,
  }
}

export function isFreeWeek(cycle: UserCycleWeek): boolean {
  return cycle.cycleNumber === 1 && cycle.weekNumber === 1
}

export type PhaseCode = 'BASE' | 'BUILD' | 'PEAK' | 'DELOAD'

export interface CyclePhase {
  code: PhaseCode
  label: string
}

export function getCyclePhase(weekNumber: number): CyclePhase {
  if (weekNumber <= 2) return { code: 'BASE', label: 'Base' }
  if (weekNumber <= 4) return { code: 'BUILD', label: 'Build' }
  if (weekNumber === 5) return { code: 'PEAK', label: 'Peak' }
  return { code: 'DELOAD', label: 'Deload' }
}

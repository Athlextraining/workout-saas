import type { Category } from '@/modules/identity/domain/profile'
import type { Locale } from '@/shared/i18n/config'

export interface WarmupExercise {
  nombre: string
  repeticiones: string
  notas?: string
}

export interface StrengthExercise {
  nombre: string
  series: number
  repeticiones: string
  tempo?: string
  peso?: string
  pct_1rm?: number
  notas?: string
}

export interface WodExercise {
  nombre: string
  repeticiones: string
  peso?: string
  notas?: string
}

export interface Wod {
  tipo: string
  cap?: string
  descripcion: string
  ejercicios: WodExercise[]
  notas?: string
}

export interface DayWorkout {
  titulo: string
  warmup?: WarmupExercise[]
  fuerza?: StrengthExercise[]
  wod?: Wod
  recuperacion?: string
}

export type WeekContent = Record<
  'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo',
  DayWorkout
>

export interface WorkoutTemplate {
  id: string
  category: Category
  week_number: number
  content: WeekContent
  model_version: string | null
  created_at: string
  updated_at: string
}

export interface UserWeekWorkout extends WorkoutTemplate {
  cycle_number: number
}

/**
 * Storage shape of `workout_templates.week_content` after migration 010.
 * UI code never sees this wrapper — the repo unwraps to the active locale's
 * WeekContent (with ES fallback when EN not yet seeded).
 */
export type LocalizedWeekContent = Record<Locale, WeekContent | null>

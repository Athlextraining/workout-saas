export type TimerMode = 'emom' | 'amrap' | 'fortime' | 'tabata' | 'countdown'

export type TimerConfig =
  | { mode: 'emom'; intervalSec: number; totalSec: number }
  | { mode: 'amrap'; totalSec: number }
  | { mode: 'fortime'; capSec?: number }
  | { mode: 'tabata'; workSec: number; restSec: number; rounds: number }
  | { mode: 'countdown'; totalSec: number }

export type TimerStatus = 'idle' | 'prestart' | 'running' | 'paused' | 'done'

export interface TimerSnapshot {
  status: TimerStatus
  elapsedMs: number
  remainingMs: number | null
  currentRound: number
  totalRounds: number | null
  phase: 'work' | 'rest' | null
  nextBeepInMs: number | null
}

export function modeLabel(mode: TimerMode): string {
  switch (mode) {
    case 'emom':
      return 'EMOM'
    case 'amrap':
      return 'AMRAP'
    case 'fortime':
      return 'For Time'
    case 'tabata':
      return 'Tabata'
    case 'countdown':
      return 'Cuenta atrás'
  }
}

export function totalDurationMs(config: TimerConfig): number | null {
  switch (config.mode) {
    case 'emom':
    case 'amrap':
    case 'countdown':
      return config.totalSec * 1000
    case 'fortime':
      return config.capSec ? config.capSec * 1000 : null
    case 'tabata':
      return (config.workSec + config.restSec) * config.rounds * 1000
  }
}

export function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

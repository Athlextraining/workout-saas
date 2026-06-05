'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import { AnimatePresence, motion } from 'motion/react'
import type { WeekContent, DayWorkout } from '@/modules/training/domain/workout'
import { Link } from '@/shared/i18n/routing'

type DayKey = keyof WeekContent

const DAY_KEYS: DayKey[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
]

// Map ES day keys to numeric weekday (0=Sun, 1=Mon, ..., 6=Sat)
const DAY_TO_WEEKDAY: Record<DayKey, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
}

interface UserMaxes {
  strictPress: number | null
  backSquat: number | null
  deadlift: number | null
}

interface Props {
  content: WeekContent
  todayKey: DayKey
  cycleNumber: number
  weekNumber: number
  maxes: UserMaxes
  preview?: boolean
}

export function WeekView({
  content,
  todayKey,
  cycleNumber,
  weekNumber,
  maxes,
  preview = false,
}: Props) {
  const t = useTranslations('entrenamiento')
  const format = useFormatter()
  const [active, setActive] = useState<DayKey>(todayKey)
  const [done, setDone] = useState<Record<DayKey, boolean>>({
    lunes: false, martes: false, miercoles: false, jueves: false,
    viernes: false, sabado: false, domingo: false,
  })

  const storageKey = `done:c${cycleNumber}:w${weekNumber}`

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setDone(JSON.parse(raw))
    } catch {}
  }, [storageKey])

  function toggleDone(day: DayKey) {
    setDone((prev) => {
      const next = { ...prev, [day]: !prev[day] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  // Auto-scroll active tab into view
  const tabsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = tabsRef.current?.querySelector<HTMLButtonElement>(`[data-day="${active}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [active])

  const dayContent = content[active]
  const isLocked = (day: DayKey) => preview && day !== 'lunes'

  // Get short day label using formatter
  const getDayShort = (day: DayKey) => {
    const weekday = DAY_TO_WEEKDAY[day]
    const date = new Date()
    date.setDate(date.getDate() - date.getDay() + weekday)
    return format.dateTime(date, { weekday: 'short' })
  }

  // Get full day label using formatter
  const getDayFull = (day: DayKey) => {
    const weekday = DAY_TO_WEEKDAY[day]
    const date = new Date()
    date.setDate(date.getDate() - date.getDay() + weekday)
    return format.dateTime(date, { weekday: 'long' })
  }

  return (
    <div className="space-y-4">
      <div ref={tabsRef} className="day-tabs">
        {DAY_KEYS.map((day) => {
          const isActive = day === active
          const isToday = day === todayKey
          const isDone = done[day]
          return (
            <button
              key={day}
              data-day={day}
              onClick={() => setActive(day)}
              className={`day-pill ${isActive ? 'is-active' : ''} ${isToday ? 'is-today' : ''} ${isDone ? 'is-done' : ''} ${isLocked(day) ? 'is-locked' : ''}`}
            >
              <span className="day-pill-label">{getDayShort(day)}</span>
              {isLocked(day) ? (
                <span className="day-pill-check" aria-hidden>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <path d="M6 10V8a6 6 0 1 1 12 0v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="4" y="10" width="16" height="11" rx="2" fill="currentColor" />
                  </svg>
                </span>
              ) : isDone && (
                <span className="day-pill-check" aria-hidden>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <polyline points="5 12 10 17 19 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {isLocked(active) ? (
            <GateCard />
          ) : (
            <DayCard
              dayKey={active}
              day={dayContent}
              done={done[active]}
              onToggleDone={() => toggleDone(active)}
              maxes={maxes}
              getDayFull={getDayFull}
              hideToggle={preview}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function DayCard({
  dayKey,
  day,
  done,
  onToggleDone,
  maxes,
  getDayFull,
  hideToggle = false,
}: {
  dayKey: DayKey
  day: DayWorkout | undefined
  done: boolean
  onToggleDone: () => void
  maxes: UserMaxes
  getDayFull: (day: DayKey) => string
  hideToggle?: boolean
}) {
  const t = useTranslations('entrenamiento')
  return (
    <article className="glass rounded-2xl p-5 space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight">{getDayFull(dayKey)}</h2>
          {day?.titulo && (
            <p className="text-accent text-xs mt-1">{day.titulo}</p>
          )}
        </div>
        {!hideToggle && (
          <button
            type="button"
            onClick={onToggleDone}
            className={`done-toggle ${done ? 'is-done' : ''}`}
            aria-label={done ? t('day.markUndone') : t('day.markDone')}
          >
            {done ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <polyline points="5 12 10 17 19 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="text-[10px] uppercase tracking-wider pl-[0.05em]">{t('done')}</span>
            )}
          </button>
        )}
      </header>

      {day?.recuperacion ? (
        <p className="text-muted text-sm">{day.recuperacion}</p>
      ) : !day ? (
        <p className="text-muted text-sm">{t('day.rest')}</p>
      ) : (
        <div className="space-y-5">
          {day.warmup && day.warmup.length > 0 && (
            <Section title={t('sections.warmup')}>
              <div className="space-y-1.5">
                {day.warmup.map((ex, i) => (
                  <Row key={i} left={ex.nombre} right={ex.repeticiones} />
                ))}
              </div>
            </Section>
          )}

          {day.fuerza && day.fuerza.length > 0 && (
            <Section title={t('sections.strength')} chip={day.fuerza[0].tempo} chipVariant="muted">
              <div className="divide-y divide-white/5">
                {day.fuerza.map((ex, i) => {
                  const calc = calcWeightFromPct(ex.nombre, ex.pct_1rm, maxes)
                  return (
                    <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-snug min-w-0 break-words">{ex.nombre}</p>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted">
                            {ex.series}×{ex.repeticiones}
                          </p>
                          {(ex.peso || calc) && (
                            <p className="text-xs text-muted mt-0.5">
                              {ex.peso}
                              {calc && (
                                <span className="text-accent"> ({calc} kg)</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {day.wod && (
            <Section
              title={t('sections.wod')}
              chip={day.wod.tipo}
              chipMeta={day.wod.cap}
              chipVariant="green"
            >
              <p className="text-sm font-medium mb-2">{day.wod.descripcion}</p>
              <div className="space-y-1.5">
                {day.wod.ejercicios.map((ex, i) => (
                  <Row
                    key={i}
                    left={
                      <>
                        {ex.repeticiones} {ex.nombre}
                        {ex.notas && (
                          <span className="text-muted text-xs ml-1">({ex.notas})</span>
                        )}
                      </>
                    }
                    right={ex.peso}
                  />
                ))}
              </div>
              {day.wod.notas && (
                <p className="text-muted text-xs mt-3 italic">{day.wod.notas}</p>
              )}
            </Section>
          )}
        </div>
      )}
    </article>
  )
}

function GateCard() {
  const t = useTranslations('entrenamiento')
  return (
    <article className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-2/5 rounded bg-white/10" />
        <div className="h-3 w-3/5 rounded bg-white/10" />
      </div>
      <div className="relative mt-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 10V8a6 6 0 1 1 12 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="4" y="10" width="16" height="11" rx="2" fill="currentColor" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold">{t('preview.lockedTitle')}</h3>
          <p className="text-muted text-sm">{t('preview.lockedSubtitle')}</p>
        </div>
        <Link href="/login" className="hero-cta-primary inline-flex">
          {t('preview.lockedButton')}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  )
}

function Section({
  title,
  chip,
  chipMeta,
  chipVariant = 'muted',
  children,
}: {
  title: string
  chip?: string
  chipMeta?: string
  chipVariant?: 'green' | 'muted'
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em]">
          {title}
        </p>
        {chip && (
          <span className={`badge badge--${chipVariant}`}>
            {chip}
            {chipMeta && <span className="opacity-60"> · {chipMeta}</span>}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

function Row({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="min-w-0 break-words">{left}</span>
      {right && <span className="text-muted text-xs shrink-0 self-center">{right}</span>}
    </div>
  )
}

const RM_KEYWORDS: Array<[string, keyof UserMaxes]> = [
  ['strict press', 'strictPress'],
  ['back squat', 'backSquat'],
  ['deadlift', 'deadlift'],
]

function calcWeightFromPct(
  name: string,
  pct: number | undefined,
  maxes: UserMaxes,
): number | null {
  if (!pct) return null
  const key = name.toLowerCase()
  for (const [needle, field] of RM_KEYWORDS) {
    if (key.includes(needle)) {
      const rm = maxes[field]
      if (!rm) return null
      const raw = (rm * pct) / 100
      return Math.round(raw / 2.5) * 2.5
    }
  }
  return null
}

'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'motion/react'
import type { TimerConfig } from '../domain/timer'
import { formatMs, modeLabel } from '../domain/timer'
import { useTimer } from './use-timer'
import { TimerModal } from './timer-modal'

export function WorkoutTimer({ compact = false }: { compact?: boolean } = {}) {
  const t = useTranslations('timer')
  const [modalOpen, setModalOpen] = useState(false)
  const [config, setConfig] = useState<TimerConfig | null>(null)

  function handleConfirm(cfg: TimerConfig) {
    setConfig(cfg)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`timer-launch-btn ${compact ? 'is-compact' : ''}`}
        aria-label={t('launch')}
      >
        <svg width={compact ? 14 : 18} height={compact ? 14 : 18} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="timer-launch-label">{compact ? 'Timer' : t('launch')}</span>
      </button>

      <TimerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleConfirm}
      />

      <AnimatePresence>
        {config && (
          <ActiveTimer
            key={configKey(config)}
            config={config}
            onClose={() => setConfig(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function configKey(c: TimerConfig): string {
  return JSON.stringify(c)
}

function ActiveTimer({
  config,
  onClose,
}: {
  config: TimerConfig
  onClose: () => void
}) {
  const t = useTranslations('timer')
  const { snapshot, start, pause, resume, stop } = useTimer(config)

  useEffect(() => {
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isRunning = snapshot.status === 'running'
  const isPaused = snapshot.status === 'paused'
  const isPrestart = snapshot.status === 'prestart'
  const isDone = snapshot.status === 'done'

  const mainText = (() => {
    if (isPrestart) {
      const s = Math.max(0, Math.ceil((snapshot.remainingMs ?? 0) / 1000))
      return s.toString()
    }
    if (config.mode === 'fortime' && snapshot.remainingMs == null) {
      return formatMs(snapshot.elapsedMs)
    }
    return formatMs(snapshot.remainingMs ?? snapshot.elapsedMs)
  })()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="workout-timer-overlay"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`workout-timer ${isPrestart ? 'is-prestart' : ''} ${isDone ? 'is-done' : ''} ${snapshot.phase === 'rest' ? 'is-rest' : ''}`}
      >
        <div className="workout-timer-head">
          <span className="workout-timer-mode">{modeLabel(config.mode)}</span>
          {snapshot.totalRounds != null && !isPrestart && (
            <span className="workout-timer-round">
              Ronda {snapshot.currentRound}/{snapshot.totalRounds}
            </span>
          )}
          {config.mode === 'emom' && !isPrestart && (
            <span className="workout-timer-round">Min {snapshot.currentRound}</span>
          )}
        </div>

        <div className="workout-timer-main">
          <span className="workout-timer-time">{mainText}</span>
          {isPrestart && <span className="workout-timer-hint">Empezando…</span>}
          {snapshot.phase && !isPrestart && (
            <span className={`workout-timer-phase phase-${snapshot.phase}`}>
              {snapshot.phase === 'work' ? 'TRABAJO' : 'DESCANSO'}
            </span>
          )}
        </div>

        <div className="workout-timer-controls">
          {isRunning && (
            <button type="button" className="timer-ctrl" onClick={pause}>
              Pausa
            </button>
          )}
          {isPaused && (
            <button type="button" className="timer-ctrl is-primary" onClick={resume}>
              Reanudar
            </button>
          )}
          <button
            type="button"
            className="timer-ctrl is-stop"
            onClick={() => {
              stop()
              onClose()
            }}
          >
            {isDone ? t('close') : t('stop')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

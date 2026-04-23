'use client'

import { useState } from 'react'
import { Drawer } from 'vaul'
import type { TimerConfig, TimerMode } from '../domain/timer'
import { modeLabel } from '../domain/timer'

const MODES: TimerMode[] = ['emom', 'amrap', 'fortime', 'tabata', 'countdown']

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (config: TimerConfig) => void
}

export function TimerModal({ open, onOpenChange, onConfirm }: Props) {
  const [mode, setMode] = useState<TimerMode>('emom')
  const [intervalSec, setIntervalSec] = useState(60)
  const [totalMin, setTotalMin] = useState(12)
  const [capMin, setCapMin] = useState(15)
  const [hasCap, setHasCap] = useState(true)
  const [workSec, setWorkSec] = useState(20)
  const [restSec, setRestSec] = useState(10)
  const [rounds, setRounds] = useState(8)

  function handleConfirm() {
    let config: TimerConfig
    switch (mode) {
      case 'emom':
        config = { mode: 'emom', intervalSec, totalSec: totalMin * 60 }
        break
      case 'amrap':
        config = { mode: 'amrap', totalSec: totalMin * 60 }
        break
      case 'fortime':
        config = { mode: 'fortime', capSec: hasCap ? capMin * 60 : undefined }
        break
      case 'tabata':
        config = { mode: 'tabata', workSec, restSec, rounds }
        break
      case 'countdown':
        config = { mode: 'countdown', totalSec: totalMin * 60 }
        break
    }
    onConfirm(config)
    onOpenChange(false)
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" />
        <Drawer.Content className="timer-sheet">
          <Drawer.Title className="sr-only">Configurar timer</Drawer.Title>
          <div className="timer-sheet-handle" />
          <div className="timer-sheet-body">
            <h3 className="timer-sheet-heading">Tipo de timer</h3>
            <div className="timer-mode-grid">
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`timer-mode-chip ${mode === m ? 'is-active' : ''}`}
                >
                  {modeLabel(m)}
                </button>
              ))}
            </div>

            <div className="timer-fields">
              {(mode === 'emom' || mode === 'amrap' || mode === 'countdown') && (
                <Field
                  label="Duración total"
                  value={totalMin}
                  onChange={setTotalMin}
                  min={1}
                  max={60}
                  unit="min"
                />
              )}
              {mode === 'emom' && (
                <Field
                  label="Intervalo"
                  value={intervalSec}
                  onChange={setIntervalSec}
                  min={10}
                  max={600}
                  step={10}
                  unit="seg"
                />
              )}
              {mode === 'fortime' && (
                <>
                  <label className="timer-toggle">
                    <input
                      type="checkbox"
                      checked={hasCap}
                      onChange={(e) => setHasCap(e.target.checked)}
                    />
                    <span>Cap de tiempo</span>
                  </label>
                  {hasCap && (
                    <Field
                      label="Cap"
                      value={capMin}
                      onChange={setCapMin}
                      min={1}
                      max={60}
                      unit="min"
                    />
                  )}
                </>
              )}
              {mode === 'tabata' && (
                <>
                  <Field
                    label="Trabajo"
                    value={workSec}
                    onChange={setWorkSec}
                    min={5}
                    max={120}
                    step={5}
                    unit="seg"
                  />
                  <Field
                    label="Descanso"
                    value={restSec}
                    onChange={setRestSec}
                    min={5}
                    max={120}
                    step={5}
                    unit="seg"
                  />
                  <Field
                    label="Rondas"
                    value={rounds}
                    onChange={setRounds}
                    min={1}
                    max={30}
                    unit="x"
                  />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="timer-confirm-btn"
            >
              Empezar
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit: string
}) {
  function inc(delta: number) {
    const next = Math.max(min, Math.min(max, value + delta))
    onChange(next)
  }
  return (
    <div className="timer-field">
      <span className="timer-field-label">{label}</span>
      <div className="timer-field-ctrl">
        <button type="button" className="timer-step" onClick={() => inc(-step)} aria-label="Decrementar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="timer-field-value">
          {value}
          <span className="timer-field-unit">{unit}</span>
        </span>
        <button type="button" className="timer-step" onClick={() => inc(step)} aria-label="Incrementar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

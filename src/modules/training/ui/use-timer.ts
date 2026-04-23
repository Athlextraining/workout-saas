'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TimerConfig, TimerSnapshot } from '../domain/timer'
import { totalDurationMs } from '../domain/timer'
import { beepEnd, beepInterval, beepStart, unlockAudio, vibrate } from './timer-audio'

const PRESTART_MS = 10_000

export function useTimer(config: TimerConfig) {
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() => initialSnapshot(config))
  const rafRef = useRef<number | null>(null)
  const startTsRef = useRef<number | null>(null)
  const pausedElapsedRef = useRef(0)
  const lastIntervalMarkRef = useRef(-1)
  const lastSecondRef = useRef(-1)
  const statusRef = useRef<TimerSnapshot['status']>('idle')
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const tick = useCallback(() => {
    if (startTsRef.current == null) return
    const now = performance.now()
    const elapsed = pausedElapsedRef.current + (now - startTsRef.current)
    const next = computeSnapshot(config, statusRef.current, elapsed)
    setSnapshot(next)

    const runtimeElapsed = next.status === 'prestart' ? 0 : elapsed - PRESTART_MS
    handleBeeps(config, next, runtimeElapsed)

    if (next.status === 'done') {
      stopLoop()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [config])

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
  }, [])

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {}
  }, [])

  function handleBeeps(cfg: TimerConfig, snap: TimerSnapshot, runtimeElapsed: number) {
    // Prestart countdown: beep each of last 3 seconds
    if (snap.status === 'prestart') {
      const remainSec = Math.ceil((snap.remainingMs ?? 0) / 1000)
      if (remainSec !== lastSecondRef.current && remainSec <= 3 && remainSec > 0) {
        lastSecondRef.current = remainSec
        beepInterval()
        vibrate(60)
      }
      return
    }

    if (snap.status !== 'running') return

    // Interval beeps per mode
    if (cfg.mode === 'emom') {
      const mark = Math.floor(runtimeElapsed / (cfg.intervalSec * 1000))
      if (mark !== lastIntervalMarkRef.current && mark > 0) {
        lastIntervalMarkRef.current = mark
        beepStart()
        vibrate([80, 40, 80])
      }
    }
    if (cfg.mode === 'tabata') {
      const cycle = cfg.workSec + cfg.restSec
      const within = Math.floor(runtimeElapsed / 1000) % cycle
      if (within === 0 && Math.floor(runtimeElapsed / 1000) !== lastIntervalMarkRef.current) {
        lastIntervalMarkRef.current = Math.floor(runtimeElapsed / 1000)
        beepStart()
        vibrate([80, 40, 80])
      } else if (within === cfg.workSec && Math.floor(runtimeElapsed / 1000) !== lastIntervalMarkRef.current) {
        lastIntervalMarkRef.current = Math.floor(runtimeElapsed / 1000)
        beepInterval()
        vibrate(80)
      }
    }

    // Final beep
    if (snap.remainingMs != null && snap.remainingMs <= 0) {
      beepEnd()
      vibrate([200, 100, 200, 100, 400])
    }
  }

  const start = useCallback(() => {
    unlockAudio()
    requestWakeLock()
    statusRef.current = 'prestart'
    startTsRef.current = performance.now()
    pausedElapsedRef.current = 0
    lastIntervalMarkRef.current = -1
    lastSecondRef.current = -1
    setSnapshot(computeSnapshot(config, 'prestart', 0))
    rafRef.current = requestAnimationFrame(tick)
    // Transition prestart → running after PRESTART_MS
    setTimeout(() => {
      if (statusRef.current === 'prestart') {
        statusRef.current = 'running'
        beepStart()
        vibrate(200)
      }
    }, PRESTART_MS)
  }, [config, requestWakeLock, tick])

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') return
    if (startTsRef.current != null) {
      pausedElapsedRef.current += performance.now() - startTsRef.current
    }
    statusRef.current = 'paused'
    stopLoop()
    setSnapshot((s) => ({ ...s, status: 'paused' }))
  }, [stopLoop])

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return
    statusRef.current = 'running'
    startTsRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    statusRef.current = 'idle'
    stopLoop()
    startTsRef.current = null
    pausedElapsedRef.current = 0
    lastIntervalMarkRef.current = -1
    lastSecondRef.current = -1
    releaseWakeLock()
    setSnapshot(initialSnapshot(config))
  }, [config, releaseWakeLock, stopLoop])

  useEffect(() => {
    return () => {
      stopLoop()
      releaseWakeLock()
    }
  }, [releaseWakeLock, stopLoop])

  return { snapshot, start, pause, resume, stop }
}

function initialSnapshot(config: TimerConfig): TimerSnapshot {
  const total = totalDurationMs(config)
  return {
    status: 'idle',
    elapsedMs: 0,
    remainingMs: total,
    currentRound: 0,
    totalRounds: config.mode === 'tabata' ? config.rounds : null,
    phase: config.mode === 'tabata' ? 'work' : null,
    nextBeepInMs: null,
  }
}

function computeSnapshot(
  config: TimerConfig,
  status: TimerSnapshot['status'],
  rawElapsedMs: number,
): TimerSnapshot {
  if (rawElapsedMs < PRESTART_MS) {
    return {
      status: 'prestart',
      elapsedMs: 0,
      remainingMs: PRESTART_MS - rawElapsedMs,
      currentRound: 0,
      totalRounds: config.mode === 'tabata' ? config.rounds : null,
      phase: config.mode === 'tabata' ? 'work' : null,
      nextBeepInMs: null,
    }
  }
  const elapsed = rawElapsedMs - PRESTART_MS
  const total = totalDurationMs(config)
  const remaining = total != null ? Math.max(0, total - elapsed) : null
  const isDone = total != null && elapsed >= total

  let currentRound = 0
  let totalRounds: number | null = null
  let phase: TimerSnapshot['phase'] = null
  let nextBeepInMs: number | null = null

  if (config.mode === 'emom') {
    const intMs = config.intervalSec * 1000
    currentRound = Math.floor(elapsed / intMs) + 1
    totalRounds = Math.ceil(config.totalSec / config.intervalSec)
    nextBeepInMs = intMs - (elapsed % intMs)
  }
  if (config.mode === 'tabata') {
    const cycle = (config.workSec + config.restSec) * 1000
    const roundIdx = Math.floor(elapsed / cycle)
    const within = elapsed % cycle
    currentRound = Math.min(config.rounds, roundIdx + 1)
    totalRounds = config.rounds
    phase = within < config.workSec * 1000 ? 'work' : 'rest'
    nextBeepInMs = phase === 'work' ? config.workSec * 1000 - within : cycle - within
  }

  return {
    status: isDone ? 'done' : status === 'prestart' ? 'running' : status,
    elapsedMs: elapsed,
    remainingMs: remaining,
    currentRound,
    totalRounds,
    phase,
    nextBeepInMs,
  }
}

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function beep(freq = 880, durationMs = 150, volume = 0.25) {
  const c = getCtx()
  if (!c) return
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.01)
  gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000)
  osc.connect(gain).connect(c.destination)
  osc.start(now)
  osc.stop(now + durationMs / 1000 + 0.02)
}

export function beepStart() {
  beep(1200, 250, 0.3)
}

export function beepInterval() {
  beep(880, 150, 0.25)
}

export function beepEnd() {
  beep(440, 120, 0.3)
  setTimeout(() => beep(440, 120, 0.3), 160)
  setTimeout(() => beep(330, 280, 0.3), 320)
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export function unlockAudio() {
  getCtx()
}

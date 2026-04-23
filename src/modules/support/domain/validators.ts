export const SUBJECT_MIN = 3
export const SUBJECT_MAX = 120
export const BODY_MIN = 1
export const BODY_MAX = 4000

export function validateSubject(subject: string): string | null {
  const s = subject.trim()
  if (s.length < SUBJECT_MIN) return `Asunto demasiado corto (min ${SUBJECT_MIN}).`
  if (s.length > SUBJECT_MAX) return `Asunto demasiado largo (max ${SUBJECT_MAX}).`
  return null
}

export function validateBody(body: string): string | null {
  const b = body.trim()
  if (b.length < BODY_MIN) return 'Mensaje vacio.'
  if (b.length > BODY_MAX) return `Mensaje demasiado largo (max ${BODY_MAX}).`
  return null
}

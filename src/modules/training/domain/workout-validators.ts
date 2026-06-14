export type BlockKey = 'titulo' | 'warmup' | 'fuerza' | 'wod' | 'recuperacion'

export interface BlockValidationResult {
  error?: string
}

function isString(v: unknown): v is string {
  return typeof v === 'string'
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v)
}
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function isEmpty(v: unknown): boolean {
  return (
    v === null ||
    v === undefined ||
    v === '' ||
    (Array.isArray(v) && v.length === 0)
  )
}

export function validateBlock(blockKey: BlockKey, value: unknown): BlockValidationResult {
  switch (blockKey) {
    case 'titulo':
    case 'recuperacion':
      if (value === null || value === undefined) return {}
      if (!isString(value)) return { error: `${blockKey} debe ser texto` }
      return {}
    case 'warmup':
      return validateWarmup(value)
    case 'fuerza':
      return validateFuerza(value)
    case 'wod':
      return validateWod(value)
    default:
      return { error: `Bloque desconocido: ${blockKey}` }
  }
}

function validateWarmup(value: unknown): BlockValidationResult {
  if (isEmpty(value)) return {}
  if (!Array.isArray(value)) return { error: 'warmup debe ser una lista' }
  for (let i = 0; i < value.length; i++) {
    const e = value[i]
    if (!isObject(e)) return { error: `warmup[${i}] debe ser un objeto` }
    if (!isString(e.nombre)) return { error: `warmup[${i}].nombre requerido (texto)` }
    if (!isString(e.repeticiones)) return { error: `warmup[${i}].repeticiones requerido (texto)` }
    if (e.notas !== undefined && !isString(e.notas)) return { error: `warmup[${i}].notas debe ser texto` }
  }
  return {}
}

function validateFuerza(value: unknown): BlockValidationResult {
  if (isEmpty(value)) return {}
  if (!Array.isArray(value)) return { error: 'fuerza debe ser una lista' }
  for (let i = 0; i < value.length; i++) {
    const e = value[i]
    if (!isObject(e)) return { error: `fuerza[${i}] debe ser un objeto` }
    if (!isString(e.nombre)) return { error: `fuerza[${i}].nombre requerido (texto)` }
    if (!isNumber(e.series)) return { error: `fuerza[${i}].series requerido (número)` }
    if (!isString(e.repeticiones)) return { error: `fuerza[${i}].repeticiones requerido (texto)` }
    if (e.tempo !== undefined && !isString(e.tempo)) return { error: `fuerza[${i}].tempo debe ser texto` }
    if (e.peso !== undefined && !isString(e.peso)) return { error: `fuerza[${i}].peso debe ser texto` }
    if (e.pct_1rm !== undefined && !isNumber(e.pct_1rm)) return { error: `fuerza[${i}].pct_1rm debe ser número` }
    if (e.notas !== undefined && !isString(e.notas)) return { error: `fuerza[${i}].notas debe ser texto` }
  }
  return {}
}

function validateWod(value: unknown): BlockValidationResult {
  if (isEmpty(value)) return {}
  if (!isObject(value)) return { error: 'wod debe ser un objeto' }
  if (!isString(value.tipo)) return { error: 'wod.tipo requerido (texto)' }
  if (!isString(value.descripcion)) return { error: 'wod.descripcion requerido (texto)' }
  if (value.cap !== undefined && !isString(value.cap)) return { error: 'wod.cap debe ser texto' }
  if (value.notas !== undefined && !isString(value.notas)) return { error: 'wod.notas debe ser texto' }
  if (!Array.isArray(value.ejercicios)) return { error: 'wod.ejercicios debe ser una lista' }
  for (let i = 0; i < value.ejercicios.length; i++) {
    const e = value.ejercicios[i]
    if (!isObject(e)) return { error: `wod.ejercicios[${i}] debe ser un objeto` }
    if (!isString(e.nombre)) return { error: `wod.ejercicios[${i}].nombre requerido (texto)` }
    if (!isString(e.repeticiones)) return { error: `wod.ejercicios[${i}].repeticiones requerido (texto)` }
    if (e.peso !== undefined && !isString(e.peso)) return { error: `wod.ejercicios[${i}].peso debe ser texto` }
    if (e.notas !== undefined && !isString(e.notas)) return { error: `wod.ejercicios[${i}].notas debe ser texto` }
  }
  return {}
}

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateBlock } from './workout-validators'

test('valid fuerza passes', () => {
  const r = validateBlock('fuerza', [{ nombre: 'Back Squat', series: 5, repeticiones: '5' }])
  assert.equal(r.error, undefined)
})

test('fuerza with non-number series fails', () => {
  const r = validateBlock('fuerza', [{ nombre: 'Back Squat', series: '5', repeticiones: '5' }])
  assert.match(r.error ?? '', /series/)
})

test('valid wod passes', () => {
  const r = validateBlock('wod', {
    tipo: 'AMRAP', descripcion: '12 min',
    ejercicios: [{ nombre: 'Burpee', repeticiones: '10' }],
  })
  assert.equal(r.error, undefined)
})

test('wod missing ejercicios fails', () => {
  const r = validateBlock('wod', { tipo: 'AMRAP', descripcion: '12 min' })
  assert.match(r.error ?? '', /ejercicios/)
})

test('empty value removes block (valid)', () => {
  assert.equal(validateBlock('fuerza', []).error, undefined)
  assert.equal(validateBlock('warmup', null).error, undefined)
  assert.equal(validateBlock('wod', null).error, undefined)
})

test('warmup item missing nombre fails', () => {
  const r = validateBlock('warmup', [{ repeticiones: '10' }])
  assert.match(r.error ?? '', /nombre/)
})

test('titulo must be string', () => {
  assert.equal(validateBlock('titulo', 'Lunes fuerte').error, undefined)
  assert.match(validateBlock('titulo', 123).error ?? '', /texto/)
})

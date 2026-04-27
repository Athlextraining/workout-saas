#!/usr/bin/env node
// Verify ES and EN message catalogs have identical key sets.
// Exit non-zero on drift so CI can fail.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(process.cwd(), 'messages')
const es = JSON.parse(readFileSync(resolve(ROOT, 'es.json'), 'utf8'))
const en = JSON.parse(readFileSync(resolve(ROOT, 'en.json'), 'utf8'))

function flatten(obj, prefix = '') {
  const out = []
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v, path))
    else out.push(path)
  }
  return out
}

const esKeys = new Set(flatten(es))
const enKeys = new Set(flatten(en))

const onlyEs = [...esKeys].filter((k) => !enKeys.has(k)).sort()
const onlyEn = [...enKeys].filter((k) => !esKeys.has(k)).sort()

if (onlyEs.length === 0 && onlyEn.length === 0) {
  console.log(`✓ messages/{es,en}.json keys match (${esKeys.size} keys)`)
  process.exit(0)
}

if (onlyEs.length) {
  console.error(`✗ ${onlyEs.length} key(s) only in es.json:`)
  for (const k of onlyEs) console.error(`  - ${k}`)
}
if (onlyEn.length) {
  console.error(`✗ ${onlyEn.length} key(s) only in en.json:`)
  for (const k of onlyEn) console.error(`  - ${k}`)
}
process.exit(1)

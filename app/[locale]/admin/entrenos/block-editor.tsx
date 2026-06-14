'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTemplateBlockAction } from '@/modules/training/application/update-template-block'
import type { BlockKey } from '@/modules/training/domain/workout-validators'
import type { WeekContent } from '@/modules/training/domain/workout'

interface Props {
  category: 'athx' | 'athx_pro'
  week: number
  day: keyof WeekContent
  blockKey: BlockKey
  valueEs: unknown
  valueEn: unknown
}

const STRING_BLOCKS: BlockKey[] = ['titulo', 'recuperacion']

export function BlockEditor({ category, week, day, blockKey, valueEs, valueEn }: Props) {
  const router = useRouter()
  const isString = STRING_BLOCKS.includes(blockKey)
  const [open, setOpen] = useState(false)
  const [es, setEs] = useState(() => serialize(valueEs, isString))
  const [en, setEn] = useState(() => serialize(valueEn, isString))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setError(null)
    let parsedEs: unknown
    let parsedEn: unknown
    try {
      parsedEs = isString ? es : parseJson(es)
      parsedEn = isString ? en : parseJson(en)
    } catch (e) {
      setError('JSON inválido: ' + (e as Error).message)
      return
    }
    setSaving(true)
    const result = await updateTemplateBlockAction(category, week, day, blockKey, {
      es: parsedEs,
      en: parsedEn,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="border-t border-white/10 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{blockKey}</span>
        <button onClick={() => setOpen((o) => !o)} className="text-xs underline">
          {open ? 'Cerrar' : 'Modificar'}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted">ES</label>
              <textarea
                value={es}
                onChange={(e) => setEs(e.target.value)}
                rows={isString ? 2 : 8}
                className="w-full text-xs font-mono bg-black/30 rounded p-2"
              />
            </div>
            <div>
              <label className="text-xs text-muted">EN</label>
              <textarea
                value={en}
                onChange={(e) => setEn(e.target.value)}
                rows={isString ? 2 : 8}
                className="w-full text-xs font-mono bg-black/30 rounded p-2"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg btn-gradient text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  )
}

function serialize(value: unknown, isString: boolean): string {
  if (value === null || value === undefined) return ''
  if (isString) return String(value)
  return JSON.stringify(value, null, 2)
}

function parseJson(text: string): unknown {
  const trimmed = text.trim()
  if (trimmed === '') return null
  return JSON.parse(trimmed)
}

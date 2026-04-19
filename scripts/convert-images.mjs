import sharp from 'sharp'
import { stat, unlink } from 'node:fs/promises'
import { join, parse, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const TARGETS = [
  'pesobackground.jpg',
]

for (const file of TARGETS) {
  const src = join(DIR, file)
  const { name } = parse(file)
  const out = join(DIR, `${name}.webp`)

  const before = (await stat(src)).size
  await sharp(src)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(out)
  const after = (await stat(out)).size

  console.log(`${file}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
  await unlink(src)
}

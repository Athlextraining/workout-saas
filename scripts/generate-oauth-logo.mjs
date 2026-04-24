import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SIZE = 512
const svg = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" fill="#0A0A0A"/>
  <text
    x="253"
    y="256"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Arial Black, Impact, system-ui, sans-serif"
    font-weight="900"
    font-size="88"
    letter-spacing="6"
    fill="#FFFFFF"
  >ATHLEX</text>
  <line x1="120" y1="316" x2="392" y2="316" stroke="#FFFFFF" stroke-width="2" opacity="0.45"/>
  <text
    x="251"
    y="346"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Arial, system-ui, sans-serif"
    font-weight="600"
    font-size="26"
    letter-spacing="10"
    fill="#FFFFFF"
    opacity="0.75"
  >TRAINING</text>
</svg>
`.trim()

const out = join(process.cwd(), 'public', 'oauth-logo.png')
await sharp(Buffer.from(svg)).png().toFile(out)
console.log('written', out)

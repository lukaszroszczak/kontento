/**
 * Embeds screenshot files as base64 data URIs in the HTML report
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')

const htmlPath = join(ROOT, 'raport-kontento.html')
let html = readFileSync(htmlPath, 'utf8')

const screenshots = [
  'posts-list',
  'autopilot',
  'calendar',
  'creator',
  'post-detail',
  'post-edit',
]

for (const name of screenshots) {
  const filePath = join(ROOT, 'screenshots', `${name}.png`)
  if (!existsSync(filePath)) {
    console.warn(`⚠ Missing: ${name}.png`)
    continue
  }
  const buf = readFileSync(filePath)
  const b64 = buf.toString('base64')
  const dataUri = `data:image/png;base64,${b64}`
  html = html.replaceAll(`screenshots/${name}.png`, dataUri)
  console.log(`✓ Embedded ${name}.png (${Math.round(buf.length / 1024)}KB)`)
}

writeFileSync(htmlPath, html, 'utf8')
console.log('\n✅ Report updated with embedded screenshots:', htmlPath)

/**
 * Screenshot capture script for Kontento report
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3001'
const OUT_DIR = join(process.cwd(), 'screenshots')

mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'dark',
})
const page = await context.newPage()

// Log in
await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(800)
await page.locator('input[type="email"]').fill('admin@kontento.pl')
await page.locator('input[type="password"]').fill('Kontento2026!')
await page.locator('button[type="submit"]').click()
await page.waitForURL(`${BASE_URL}/**`, { timeout: 10000 })
await page.waitForTimeout(2500)
console.log('✓ Logged in')

async function save(name) {
  const buffer = await page.screenshot({ fullPage: false })
  writeFileSync(join(OUT_DIR, `${name}.png`), buffer)
  console.log(`✓ ${name}.png`)
}

// 1. Posts list
await page.goto(`${BASE_URL}/posts`, { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(2000)
await save('posts-list')

// 2. Autopilot
await page.goto(`${BASE_URL}/autopilot`, { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(2000)
await save('autopilot')

// 3. Calendar
await page.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(2000)
await save('calendar')

// 4. Creator modal
await page.goto(`${BASE_URL}/posts`, { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(1500)
await page.locator('button').filter({ hasText: /Nowy post/i }).first().click()
await page.waitForTimeout(2000)
await save('creator')
await page.keyboard.press('Escape')
await page.waitForTimeout(800)

// 5+6. Post detail — click a post that has an image (prefer 3rd post which is autopilot)
await page.goto(`${BASE_URL}/posts`, { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(2000)

// Click the 3rd post row (autopilot one with good image)
const clickedRow = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('main div')].filter(el =>
    el.textContent.includes('Szkic') && el.offsetHeight > 60 && el.offsetHeight < 150
  )
  // Pick index 2 (3rd post — likely has autopilot image)
  const target = rows[2] || rows[0]
  if (target) { target.click(); return rows.indexOf(target) }
  return -1
})
console.log('Clicked row index:', clickedRow)
await page.waitForTimeout(2500)

// Scroll down a bit in the modal to show text content below image
await page.evaluate(() => {
  const modal = document.querySelector('[role="dialog"], [class*="modal"], [class*="Modal"]')
    || document.querySelector('.overflow-y-auto, .overflow-auto')
  if (modal) modal.scrollTop = 200
})
await page.waitForTimeout(500)
await save('post-detail')

// 6. Edit mode — click Edytuj and scroll to show textarea
const editBtn = page.locator('button').filter({ hasText: /Edytuj/i }).first()
if (await editBtn.count() > 0) {
  await editBtn.click()
  await page.waitForTimeout(1200)
  // Scroll modal to show edit textarea
  await page.evaluate(() => {
    const scrollable = document.querySelector('.overflow-y-auto, .overflow-auto, [class*="overflow"]')
    if (scrollable) scrollable.scrollTop = 100
  })
  await page.waitForTimeout(400)
}
await save('post-edit')

await browser.close()
console.log('\n✅ Done')

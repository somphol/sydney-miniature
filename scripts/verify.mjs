// Deterministic browser gate for the single-file build. Capture mode advances virtual time, so the
// result does not depend on the frame rate. Run: node scripts/verify.mjs [dist-single/index.html]
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright-core'

const file = process.argv[2] ?? 'dist-single/index.html'
const html = readFileSync(file)
const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  if (path !== '/' && path !== '/index.html') {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/`

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: [`--use-angle=${process.env.SHOOT_ANGLE ?? 'swiftshader'}`, '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

const checks = []
const check = (id, ok, value) => {
  checks.push({ id, ok: !!ok, value })
  if (!ok) console.log('FAIL', id, JSON.stringify(value))
}

const page = await browser.newPage({ viewport: { width: 900, height: 600 } })
page.setDefaultTimeout(60000)
const errors = []
let external = 0
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('request', (r) => {
  if (!r.url().startsWith(base) && !r.url().startsWith('data:')) external++
})
await page.goto(`${base}?capture=1&quality=low`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 60000 })

const step = (n, dt = 1 / 30) => page.evaluate(([a, b]) => window.__scene.step(a, b), [n, dt])
const act = (name, arg) => page.evaluate(([n, a]) => window.__scene.act(n, a), [name, arg])
const state = () => page.evaluate(() => window.__scene.inspect().state)
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

const targets = [
  ['opera-house', [-0.85, 0.95, -1.75]],
  ['harbour-bridge', [-5.0, 1.55, -2.45]],
  ['sydney-tower', [0.55, 2.45, 2.5]],
  ['qvb', [-1.2, 1.05, 3.6]],
  ['st-marys', [0.55, 1.45, 4.5]],
  ['luna-park', [-6.4, 0.95, -4.9]],
  ['fort-denison', [2.7, 0.85, -3.35]],
  ['observatory', [-3.35, 1.25, 1.15]],
]

await step(2)
for (const [id, target] of targets) {
  await act('landmark', id)
  await step(60)
  const s = await state()
  const chosen = await page.evaluate(() => {
    const b = document.querySelector('.landmark-buttons button.chosen')
    return { id: b?.getAttribute('data-landmark'), pressed: b?.getAttribute('aria-pressed') }
  })
  const card = await page.evaluate(() => document.querySelector('.landmark-info h2')?.textContent ?? '')
  check(
    `landmark-${id}`,
    s.selected === id && !s.transition && dist(s.target, target) < 0.05 && s.cameraClear && chosen.id === id && chosen.pressed === 'true' && card.length > 3,
    { target: s.target.map((v) => Math.round(v * 100) / 100), expected: target, transition: s.transition, clear: s.cameraClear, chosen, card },
  )
}

await act('night', true)
await step(120)
let s = await state()
check('night', s.night > 0.9, { night: Math.round(s.night * 100) / 100 })
await act('night', false)
await step(120)
s = await state()
check('day', s.night < 0.1, { night: Math.round(s.night * 100) / 100 })

await act('reset')
await step(80)
s = await state()
check('reset', !s.transition && s.selected === null && dist(s.target, [0.2, 0.6, -0.2]) < 0.05, {
  target: s.target.map((v) => Math.round(v * 100) / 100),
})

const d0 = (await state()).distance
await act('zoom', 0.8)
await step(50)
check('zoom', (await state()).distance < d0 - 0.5, { before: d0, after: (await state()).distance })

const a0 = (await state()).azimuth
await act('orbit', [0.35, 0])
await step(2)
check('orbit', Math.abs((await state()).azimuth - a0) > 0.2, { before: a0, after: (await state()).azimuth })

const t0 = (await state()).target
await act('pan', [0.3, 0])
await step(2)
const t1 = (await state()).target
check('pan', Math.hypot(t1[0] - t0[0], t1[2] - t0[2]) > 0.2, { before: t0, after: t1 })

await act('rotate', true)
const r0 = (await state()).azimuth
await step(40)
check('rotate', Math.abs((await state()).azimuth - r0) > 0.01, { before: r0, after: (await state()).azimuth })
await act('rotate', false)

const inspect = await page.evaluate(() => window.__scene.inspect())
const facts = inspect.facts
check(
  'facts',
  facts.landmarks === 8 &&
    facts.roadEdges > 300 &&
    facts.vehicles > 24 &&
    facts.pedestrians > 40 &&
    facts.boats >= 5 &&
    facts.buildings > 180 &&
    facts.triangles > 30000 &&
    facts.drawCalls < 500,
  facts,
)
check('no-errors', errors.length === 0 && inspect.errors === 0, { page: errors.slice(0, 3), runtime: inspect.errors })
check('no-external-requests', external === 0, { external })
check(
  'english-copy',
  inspect.titles.title === 'Sydney Miniature' &&
    inspect.titles.tagline === 'The harbour is the city.' &&
    inspect.titles.labels.length === 8 &&
    inspect.titles.labels.includes('Opera House') &&
    inspect.titles.labels.includes('Harbour Bridge'),
  inspect.titles,
)
const htmlLang = await page.evaluate(() => document.documentElement.lang)
check('html-lang', htmlLang === 'en', { htmlLang })
await page.close()

const embed = await browser.newPage({ viewport: { width: 345, height: 345 }, hasTouch: true })
await embed.goto(`${base}?capture=1&embed=1&quality=low`, { waitUntil: 'load' })
await embed.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 60000 })
const embedOk = await embed.evaluate(() => {
  const hidden = !document.querySelector('header') && !document.querySelector('.intro')
  const buttons = [...document.querySelectorAll('button')].filter((b) => b.offsetParent)
  const inside = buttons.every((b) => {
    const r = b.getBoundingClientRect()
    return r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5
  })
  return { hidden, count: buttons.length, inside }
})
check('embed-345', embedOk.hidden && embedOk.count >= 10 && embedOk.inside, embedOk)
await embed.close()

await browser.close()
server.close()
const passed = checks.filter((c) => c.ok).length
console.log(`\n${passed}/${checks.length} checks passed`)
if (passed !== checks.length) process.exitCode = 1

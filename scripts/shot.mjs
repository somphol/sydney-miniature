// Visual review captures. Canvas shots are reliable under SwiftShader; UI shots are best effort.
import { writeFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const file = process.argv[2] ?? 'dist-single/index.html'
const html = readFileSync(file)
const server = createServer((req, res) => {
  const p = (req.url ?? '/').split('?')[0]
  if (p !== '/' && p !== '/index.html') return void res.writeHead(404).end()
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/`
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
mkdirSync('shots', { recursive: true })
const save = (name, data) => {
  writeFileSync(`shots/${name}.png`, Buffer.from(data.split(',')[1], 'base64'))
  console.log(`shots/${name}.png`)
}
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${base}?capture=1&quality=low`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 60000 })
await page.evaluate(() => window.__scene.step(3))
save('day', await page.evaluate(() => window.__scene.shot()))
for (const [i, id] of [
  [0, 'opera-house'],
  [1, 'harbour-bridge'],
  [2, 'sydney-tower'],
  [3, 'qvb'],
  [4, 'st-marys'],
  [5, 'luna-park'],
  [6, 'fort-denison'],
  [7, 'observatory'],
]) {
  await page.evaluate((n) => window.__scene.act('landmark', n), i)
  await page.evaluate(() => window.__scene.step(60))
  save(id, await page.evaluate(() => window.__scene.shot()))
}
await page.evaluate(() => window.__scene.act('reset'))
await page.evaluate(() => window.__scene.step(2))
await page.evaluate(() => window.__scene.act('night', true))
await page.evaluate(() => window.__scene.step(140))
save('night', await page.evaluate(() => window.__scene.shot()))
await page.close()

const compact = await browser.newPage({ viewport: { width: 390, height: 844 } })
await compact.goto(`${base}?capture=1&quality=low`, { waitUntil: 'load' })
await compact.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 60000 })
await compact.evaluate(() => window.__scene.step(3))
await compact.screenshot({ path: 'shots/compact.png' }).catch(() => console.log('compact UI shot skipped'))
await compact.close()
const embed = await browser.newPage({ viewport: { width: 345, height: 345 } })
await embed.goto(`${base}?capture=1&embed=1&quality=low`, { waitUntil: 'load' })
await embed.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 60000 })
await embed.evaluate(() => window.__scene.step(3))
await embed.screenshot({ path: 'shots/embed.png' }).catch(() => console.log('embed UI shot skipped'))
await embed.close()
await browser.close()
server.close()

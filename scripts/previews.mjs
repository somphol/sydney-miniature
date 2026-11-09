import { writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'
const html = readFileSync('dist-single/index.html')
const server = createServer((req, res) => {
  const p = (req.url ?? '/').split('?')[0]
  if (p !== '/' && p !== '/index.html') return void res.writeHead(404).end()
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/`
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${base}?capture=1&quality=low`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__scene?.ready === true, null, { timeout: 60000 })
const save = async (name) => {
  const d = await page.evaluate(() => window.__scene.shot())
  writeFileSync(`docs/preview-${name}.png`, Buffer.from(d.split(',')[1], 'base64'))
  console.log(`docs/preview-${name}.png`)
}
await page.evaluate(() => window.__scene.step(3))
await save('day')
await page.evaluate(() => window.__scene.act('landmark', 'opera-house'))
await page.evaluate(() => window.__scene.step(55))
await save('opera')
await page.evaluate(() => window.__scene.act('landmark', 'harbour-bridge'))
await page.evaluate(() => window.__scene.step(55))
await save('bridge')
await page.evaluate(() => window.__scene.act('reset'))
await page.evaluate(() => window.__scene.step(2))
await page.evaluate(() => window.__scene.act('night', true))
await page.evaluate(() => window.__scene.step(130))
await save('night')
await browser.close()
server.close()

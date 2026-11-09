#!/usr/bin/env node
// Folds the Vite build (index.html + one JS chunk + one CSS file + notices) into one self-contained
// HTML file for the sandbox CSP. Usage: node scripts/inline-build.mjs dist dist-single/index.html
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const [distArg, outArg] = process.argv.slice(2)
if (!distArg || !outArg) {
  console.error('Usage: node scripts/inline-build.mjs <dist> <out.html>')
  process.exit(2)
}
const dist = resolve(distArg)
const indexFile = join(dist, 'index.html')
if (!existsSync(indexFile)) {
  console.error(`missing ${indexFile}`)
  process.exit(1)
}
let html = readFileSync(indexFile, 'utf8')
const jsMatch = /<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/.exec(html)
const cssMatch = /<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/.exec(html)
if (!jsMatch) {
  console.error('expected exactly one module script in the Vite build')
  process.exit(1)
}
const jsFile = join(dist, jsMatch[1])
if (!existsSync(jsFile)) {
  console.error(`missing ${jsFile}`)
  process.exit(1)
}
const noticesFile = join(dist, 'THIRD_PARTY_NOTICES.txt')
if (!existsSync(noticesFile)) {
  console.error(`missing ${noticesFile}`)
  process.exit(1)
}
const js = readFileSync(jsFile, 'utf8')
const css = cssMatch && existsSync(join(dist, cssMatch[1])) ? readFileSync(join(dist, cssMatch[1]), 'utf8') : ''
const notices = readFileSync(noticesFile, 'utf8')

html = html.replace(jsMatch[0], '').replace(cssMatch?.[0] ?? '', '')
if (/<script\b/i.test(html)) {
  console.error('an unexpected script tag remains in the HTML')
  process.exit(1)
}
if (/\s(?:src|href)\s*=\s*["']?(?:https?:)?\/\//i.test(html)) {
  console.error('an external src/href remains in the HTML')
  process.exit(1)
}
if (!/<meta\s+charset=["']?utf-8/i.test(html)) {
  console.error('missing early charset')
  process.exit(1)
}
const comment = `<!--\nThird-party notices\n${notices.replaceAll('--', '- -')}\n-->`
html = html.replace(/<meta\s+charset=["']?utf-8["']?\s*\/?>/i, (tag) => `${tag}\n${comment}`)
const style = `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`
const script = `<script type="module">${js
  .replace(/<\/script/gi, '<\\/script')
  .replace(/<!--/g, '\\x3C!--')}</script>`
if (css) html = html.replace(/<\/head>/i, (tag) => `${style}\n${tag}`)
html = html.replace(/<\/body>/i, (tag) => `${script}\n${tag}`)

const file = resolve(outArg)
mkdirSync(dirname(file), { recursive: true })
const bytes = Buffer.from(html, 'utf8')
writeFileSync(file, bytes)
console.log(`wrote ${outArg} (${(bytes.length / 1024).toFixed(0)} KiB, sha256 ${createHash('sha256').update(bytes).digest('hex').slice(0, 12)})`)

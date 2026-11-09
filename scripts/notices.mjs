#!/usr/bin/env node
// Writes a compact third-party notice for the production dependency closure.
// Usage: node scripts/notices.mjs dist/THIRD_PARTY_NOTICES.txt
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = resolve(process.argv[2] ?? 'dist/THIRD_PARTY_NOTICES.txt')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packages = ['three', 'react', 'react-dom', 'scheduler']
const lines = [
  'This single-file build bundles the following MIT-licensed packages.',
  'Full licence texts are reproduced below.',
  '',
]
for (const name of packages) {
  const dir = join(root, 'node_modules', name)
  if (!existsSync(dir)) continue
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  lines.push(`${pkg.name}@${pkg.version} — ${pkg.license ?? 'MIT'}`)
  if (pkg.homepage) lines.push(pkg.homepage)
  lines.push('')
  for (const file of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license']) {
    const path = join(dir, file)
    if (existsSync(path)) {
      lines.push(readFileSync(path, 'utf8').trim(), '')
      break
    }
  }
}
writeFileSync(out, `${lines.join('\n')}\n`)
console.log(`wrote ${out}`)

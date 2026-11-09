// Plan and geometry checks without a browser: each test is bundled (three included) by a Vite SSR
// build and imported. Run: node tests/run.mjs
import { rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(APP, 'node_modules/.cache/syd-tests')
try {
  for (const name of ['plan.test', 'geometry.test']) {
    await build({
      configFile: false,
      logLevel: 'error',
      root: APP,
      ssr: { noExternal: true },
      build: {
        ssr: join(APP, 'tests', `${name}.ts`),
        outDir: OUT,
        emptyOutDir: true,
        write: true,
        rollupOptions: { output: { format: 'es', entryFileNames: '[name].mjs' } },
      },
    })
    await import(pathToFileURL(join(OUT, `${name}.mjs`)).href)
    console.log(`ok ${name}`)
  }
} finally {
  rmSync(OUT, { recursive: true, force: true })
}

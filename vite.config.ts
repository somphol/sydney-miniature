import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// One JS chunk + one CSS file with every asset inlined, so a single-file build is simple.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})

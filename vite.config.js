import { defineConfig } from 'vite'

// Relative base so the built site runs from any static host or a file path.
export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200,
  },
})

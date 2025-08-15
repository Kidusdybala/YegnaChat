import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Define global as window
    'process.env': {}, // Provide a minimal process.env
  },
  resolve: {
    alias: {
      // Handle Node.js modules
      events: 'events-browserify',
      util: 'util',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['simple-peer'],
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
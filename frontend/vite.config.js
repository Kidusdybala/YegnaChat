import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // Define global as globalThis
    'process.env': 'import.meta.env', // Use Vite's env
    process: JSON.stringify({ env: {} }), // Define process object
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
      // Removed external simple-peer to allow bundling
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    global: 'globalThis',
    process: JSON.stringify({
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production'
      },
      platform: 'browser',
      version: ''
    }),
    'process.env': JSON.stringify({
      NODE_ENV: process.env.NODE_ENV || 'production'
    }),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
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
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
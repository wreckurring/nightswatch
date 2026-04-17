import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    proxy: {
      // REST API
      '/api/v1': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      // WebSocket (SockJS long-poll + upgrade)
      '/api/ws-sync': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})

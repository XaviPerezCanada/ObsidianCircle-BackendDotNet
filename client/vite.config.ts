import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        // API HTTP en 5222; si usas HTTPS en 7200, cambia a 'https://localhost:7200'
        target: 'http://localhost:5222',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
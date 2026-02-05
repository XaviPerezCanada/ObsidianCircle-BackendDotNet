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
    // Proxy API al backend .NET (debe estar en marcha en el puerto 5222)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5222',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const adminBase = (process.env.VITE_ADMIN_BASE || '/admin/').replace(/\/?$/, '/')

export default defineConfig({
  base: adminBase,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    proxy: { '/api': { target: 'http://localhost:5001', changeOrigin: true } },
  },
})

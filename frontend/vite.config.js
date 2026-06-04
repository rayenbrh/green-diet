import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Ports locaux par défaut : boutique 5177, API 5001 (voir backend/.env.example).
const previewPort = Number(process.env.PORT) || 5177

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5177,
  },
  preview: {
    host: '0.0.0.0',
    port: previewPort,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'icons/*.png'],
      manifest: {
        name: 'Green Diet Sfax',
        short_name: 'Green Diet',
        description: 'Produits sans gluten bio à Sfax, Tunisie',
        theme_color: '#2D5A3D',
        background_color: '#FAF8F2',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
          },
          { src: '/screenshots/mobile.png', sizes: '390x844', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Ne pas intercepter /admin/ : sinon la PWA sert index.html boutique → 404 introuvable
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/admin(?:\/|$)/, /^\/api(?:\/|$)/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})

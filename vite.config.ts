import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Camfi',
        short_name: 'Camfi',
        description: 'Controle financeiro pessoal',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:svg|png|jpg|jpeg|webp|woff2?)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})

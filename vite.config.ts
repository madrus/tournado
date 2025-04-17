import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { vitePlugin as remix } from '@remix-run/dev'

export default defineConfig({
  css: {
    transformer: 'lightningcss',
  },
  plugins: [
    remix(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Tournament App for any Group Sport',
        short_name: 'Tournado',
        start_url: '/',
        display: 'standalone',
        background_color: '#1e293b',
        theme_color: '#1e293b',
        icons: [
          {
            src: '/favicon/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: '/favicon/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: '/favicon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/favicon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/favicon/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
})

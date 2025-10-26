import { reactRouter } from '@react-router/dev/vite'

import { reactRouterDevTools } from 'react-router-devtools'

import tailwindcss from '@tailwindcss/vite'

import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const enablePwa = process.env.DISABLE_PWA !== 'true' && process.env.NODE_ENV !== 'test'

export default defineConfig({
  plugins: [
    ...(process.env.ENABLE_REACT_ROUTER_DEVTOOLS === 'true'
      ? [
          reactRouterDevTools({
            client: {
              showBreakpointIndicator: false,
              defaultOpen: false,
            },
          }),
        ]
      : []),
    reactRouter(),
    tailwindcss(),
    ...(enablePwa
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'robots.txt'],
            manifest: {
              name: 'Tournament App for any Group Sport',
              short_name: 'Tournado',
              description: 'Tournament management made easy',
              start_url: '/',
              scope: '/',
              display: 'standalone',
              display_override: ['fullscreen', 'standalone'],
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
                  purpose: 'any maskable',
                },
                {
                  src: '/favicon/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable',
                },
                {
                  src: '/favicon/apple-touch-icon.png',
                  sizes: '180x180',
                  type: 'image/png',
                },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/tournado-staging\.fly\.dev\/.*/i,
                  handler: 'NetworkFirst',
                  options: {
                    cacheName: 'api-cache',
                    expiration: {
                      maxEntries: 100,
                      maxAgeSeconds: 60 * 60 * 24, // 24 hours
                    },
                    cacheableResponse: {
                      statuses: [0, 200],
                    },
                  },
                },
              ],
              cleanupOutdatedCaches: true,
              sourcemap: true,
            },
            devOptions: {
              enabled: true,
              type: 'module',
              navigateFallback: 'index.html',
            },
          }),
        ]
      : []),
    tsconfigPaths(),
  ],
  server: {
    hmr: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '~test': path.resolve(__dirname, './test'),
    },
  },
})

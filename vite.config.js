import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

const SERVER_PORT = Number(process.env.PORT ?? 2323);

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Bee Tree',
        short_name: 'Bee Tree',
        description: 'Spelling Bee with hints, a solver and word lists',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f5c518',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Puzzle list and opened puzzles: fresh when online, cached for offline Play.
            urlPattern: ({ url }) => url.pathname === '/api/puzzles' || /^\/api\/puzzles\/[\d-]+$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'puzzles',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 400 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: SERVER_PORT + 1,
    strictPort: true,
    proxy: { '/api': `http://localhost:${SERVER_PORT}` },
  },
});

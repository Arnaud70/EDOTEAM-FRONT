import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null, // on enregistre nous-mêmes dans main.tsx
      includeAssets: [
        'favicon-64.png',
        'apple-touch-icon.png',
        'pwa-192.png',
        'pwa-512.png',
        'pwa-maskable-512.png',
      ],
      manifest: {
        id: '/?source=pwa',
        name: 'EDOTEAM',
        short_name: 'EDOTEAM',
        description: 'Plateforme de mise en relation entre clients et prestataires au Togo',
        lang: 'fr',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#0f172a',
        theme_color: '#0f172a',
        orientation: 'portrait',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/auth/, /^\/uploads/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Polices Google : cache long.
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images distantes (photos de profil, uploads).
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (!normalizedId.includes('/node_modules/')) return;

          if (normalizedId.includes('/node_modules/react-router-dom/')) return 'vendor-router';
          if (normalizedId.includes('/node_modules/@tanstack/react-query/')) return 'vendor-react-query';
          if (normalizedId.includes('/node_modules/recharts/')) return 'vendor-recharts';
          if (normalizedId.includes('/node_modules/framer-motion/')) return 'vendor-framer-motion';
          if (normalizedId.includes('/node_modules/lucide-react/')) return 'vendor-lucide';
          if (normalizedId.includes('/node_modules/axios/')) return 'vendor-axios';
          if (normalizedId.includes('/node_modules/react-dom/')) return 'vendor-react';
          if (normalizedId.includes('/node_modules/react/')) return 'vendor-react';
        },
      },
    },
  },
});

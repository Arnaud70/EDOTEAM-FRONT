import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        id: '/?source=pwa',
        name: 'EDOTEAM',
        short_name: 'EDOTEAM',
        description: 'Plateforme de mise en relation entre clients et prestataires au Togo',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#0f172a',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
      }
    })
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
        }
      }
    }
  }
});

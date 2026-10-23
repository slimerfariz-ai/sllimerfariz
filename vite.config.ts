import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg', 'apple-touch-icon.png'],
          manifest: {
            id: '/',
            name: 'Loss Prevention Department',
            short_name: 'LP Check',
            description: 'Aplikasi Resmi Loss Prevention Department - Daily Checklist & Observasi Lapangan',
            theme_color: '#1d4ed8',
            background_color: '#0f172a',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any',
              },
              {
                src: '/icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any',
              },
              {
                src: '/icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          },
          devOptions: {
            enabled: true,
            type: 'module',
          },
        }),
      ],
      build: {
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('canvg') || id.includes('dompurify')) {
                  return 'vendor-pdf';
                }
                if (id.includes('recharts') || id.includes('d3-')) {
                  return 'vendor-charts';
                }
                if (id.includes('@google/genai')) {
                  return 'vendor-ai';
                }
                if (id.includes('firebase')) {
                  return 'vendor-firebase';
                }
              }
            },
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

// vite.config.js o vite.config.ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk para React y dependencias core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Chunk para UI components (Radix, Lucide, etc.)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            'lucide-react'
          ],
          
          // Chunk para Firebase y servicios
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
            '@firebase/analytics'
          ],
          
          // Chunk para utilidades y librerías
          'utils-vendor': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'next-themes',
            'sonner',
            'vaul'
          ],
          
          // Chunk para formularios y validación
          'forms-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Chunk para carousels y sliders
          'carousel-vendor': [
            'embla-carousel-react',
            'react-slick',
            'slick-carousel'
          ]
        }
      }
    },
    // Aumentar el límite para chunks específicos que necesiten ser más grandes
    chunkSizeWarningLimit: 600
  },
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png'],
      manifest: {
        name: 'Mundo Mágico de Hongos',
        short_name: 'Hongos Mágicos',
        description: 'Descubre la magia y el misterio de los hongos en nuestra colección única',
        theme_color: '#8b5cf6',
        background_color: '#1e1b4b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    return `${request.url}?v=1`;
                  }
                }
              ]
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["worldwide-yacht-reforms-tft.trycloudflare.com"],
  },
});

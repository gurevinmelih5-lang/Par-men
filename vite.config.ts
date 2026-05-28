import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Parşömen',
        short_name: 'Parşömen',
        description: 'Kitapların yolculuğuna katıl. Hiper-lokal kitap takas ağı.',
        theme_color: '#F5F0E6',
        background_color: '#F5F0E6',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('react') || id.includes('framer-motion') || id.includes('zustand') || id.includes('lucide') || id.includes('recharts')) return 'vendor';
            return 'vendor-other';
          }
        }
      }
    }
  }
})

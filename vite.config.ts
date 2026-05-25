import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

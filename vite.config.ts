import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'MILO Core // Système d’Exploration & IA',
        short_name: 'MILO Core',
        description: 'Navigation BFS, classification k-NN supervisée et analyse d’anomalies, 100 % hors ligne.',
        theme_color: '#0B131E',
        background_color: '#0B131E',
        display: 'standalone',
        start_url: '/',
        lang: 'fr',
        icons: [
          {
            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23FFF6EC"/><circle cx="50" cy="35" r="18" stroke="%2324333F" stroke-width="3" fill="none"/><rect x="28" y="53" width="44" height="20" rx="10" stroke="%2324333F" stroke-width="3" fill="none"/><circle cx="43" cy="32" r="2" fill="%2324333F"/><circle cx="57" cy="32" r="2" fill="%2324333F"/><path d="M43 39 Q50 44 57 39" stroke="%2324333F" stroke-width="2" fill="none"/></svg>',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/engine', 'src/data'],
    },
  },
})

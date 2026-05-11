import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({ include: '**/*.{jsx,js}' })],
  envPrefix: 'REACT_APP_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/razorpay') || id.includes('node_modules/sonner')) {
            return 'payment';
          }
          if (id.includes('AdminDashboard') || id.includes('AdminLogin')) {
            return 'admin';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
  }
})
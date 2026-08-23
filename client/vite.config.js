import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Cảnh báo nếu chunk > 1MB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting — tối ưu browser caching
        manualChunks: {
          // React core — ít thay đổi nhất → cache lâu nhất
          'vendor-react': ['react', 'react-dom'],
          // Router — thay đổi ít
          'vendor-router': ['react-router-dom'],
          // Icons library — lớn nhưng ít thay đổi
          'vendor-icons': ['lucide-react'],
          // UI utilities
          'vendor-ui': ['react-hot-toast', 'react-dropzone', 'react-circular-progressbar'],
        },
      },
    },
  },
})


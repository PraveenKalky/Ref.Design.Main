import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@phosphor-icons') || id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('framer-motion') || id.includes('gsap')) {
              return 'motion';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
});

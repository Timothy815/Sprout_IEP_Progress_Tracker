import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load correctly on GitHub Pages subpaths
  define: {
    // Polyfill process.env to support the Google GenAI SDK usage
    'process.env': process.env,
    // Explicitly inject the API key from build environment if available
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
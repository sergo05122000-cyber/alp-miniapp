import { defineConfig } from 'vite';

export default defineConfig({
  base: '/lp-miniapp/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});

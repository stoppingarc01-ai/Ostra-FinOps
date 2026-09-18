import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: currentDir,
  base: './',
  plugins: [react()],
  build: {
    outDir: path.resolve(currentDir, '../dist/ui'),
    emptyOutDir: true,
    target: 'esnext',
  },
  server: {
    port: 4040,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4040',
        changeOrigin: true,
      },
    },
  },
});

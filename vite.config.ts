import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    server: {
      proxy: {
        '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:8002', changeOrigin: true },
        '/sanctum': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:8002', changeOrigin: true },
      },
    },
    preview: {
      proxy: {
        '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:8002', changeOrigin: true },
        '/sanctum': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:8002', changeOrigin: true },
      },
    },
    build: { outDir: 'dist', sourcemap: false },
  };
});

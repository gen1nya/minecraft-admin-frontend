import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:3001';
  const wsProxyTarget = env.VITE_DEV_WS_PROXY_TARGET || proxyTarget.replace(/^http/, 'ws');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: wsProxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});

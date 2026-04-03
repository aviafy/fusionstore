import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT || '5050';
  const proxyTarget = `http://127.0.0.1:${apiPort}`;
  const apiProxy = {
    '/api': { target: proxyTarget, changeOrigin: true },
    '/images': { target: proxyTarget, changeOrigin: true },
  };

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'REACT_APP_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      // 5173 is Vite’s default and is already allowed in backend CORS; 3000 is often taken by other tools.
      port: Number(env.VITE_DEV_PORT) || 5173,
      strictPort: !!env.VITE_DEV_PORT,
      proxy: apiProxy,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
      proxy: apiProxy,
    },
    build: {
      outDir: 'build',
    },
  };
});

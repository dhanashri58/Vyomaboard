import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = Number(process.env.BACKEND_PORT || env.BACKEND_PORT || env.PORT || 3002)

  // Detect if SSL certs are available
  const keyPath = path.resolve(__dirname, 'localhost+2-key.pem');
  const certPath = path.resolve(__dirname, 'localhost+2.pem');
  const hasSSL = fs.existsSync(keyPath) && fs.existsSync(certPath);

  const backendProto = hasSSL ? 'https' : 'http';
  const wsProto = hasSSL ? 'wss' : 'ws';

  const serverConfig = {
    host: true,
    proxy: {
      '/api': {
        target: `${backendProto}://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: `${backendProto}://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false
      },
      '/yjs': {
        target: `${backendProto}://localhost:${backendPort}`,
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/comms': {
        target: `${backendProto}://localhost:${backendPort}`,
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/api/terminal': {
        target: `${backendProto}://localhost:${backendPort}`,
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  };

  if (hasSSL) {
    serverConfig.https = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    console.log('[vite] SSL certs found — running HTTPS');
  } else {
    console.log('[vite] No SSL certs found — running plain HTTP');
  }

  return {
    plugins: [react()],
    server: serverConfig
  }
})

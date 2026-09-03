// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/Krrish/OneDrive/Desktop/projects/moodboard/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Krrish/OneDrive/Desktop/projects/moodboard/node_modules/@vitejs/plugin-react/dist/index.js";
import fs from "fs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Krrish\\OneDrive\\Desktop\\projects\\moodboard";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendPort = Number(env.BACKEND_PORT || env.PORT || 3001);
  return {
    plugins: [react()],
    server: {
      host: true,
      https: {
        key: fs.readFileSync(path.resolve(__vite_injected_original_dirname, "localhost+2-key.pem")),
        cert: fs.readFileSync(path.resolve(__vite_injected_original_dirname, "localhost+2.pem"))
      },
      proxy: {
        "/api": {
          target: `https://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          secure: false
        },
        "/uploads": {
          target: `https://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          secure: false
        },
        "/yjs": {
          target: `wss://127.0.0.1:${backendPort}`,
          ws: true,
          changeOrigin: true,
          secure: false
        },
        "/comms": {
          target: `wss://127.0.0.1:${backendPort}`,
          ws: true,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxLcnJpc2hcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxwcm9qZWN0c1xcXFxtb29kYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEtycmlzaFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXG1vb2Rib2FyZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvS3JyaXNoL09uZURyaXZlL0Rlc2t0b3AvcHJvamVjdHMvbW9vZGJvYXJkL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIGNvbnN0IGJhY2tlbmRQb3J0ID0gTnVtYmVyKGVudi5CQUNLRU5EX1BPUlQgfHwgZW52LlBPUlQgfHwgMzAwMSlcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6IHRydWUsXG4gICAgICBodHRwczoge1xuICAgICAgICBrZXk6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbG9jYWxob3N0KzIta2V5LnBlbScpKSxcbiAgICAgICAgY2VydDogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdsb2NhbGhvc3QrMi5wZW0nKSksXG4gICAgICB9LFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiBgaHR0cHM6Ly8xMjcuMC4wLjE6JHtiYWNrZW5kUG9ydH1gLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICcvdXBsb2Fkcyc6IHtcbiAgICAgICAgICB0YXJnZXQ6IGBodHRwczovLzEyNy4wLjAuMToke2JhY2tlbmRQb3J0fWAsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJy95anMnOiB7XG4gICAgICAgICAgdGFyZ2V0OiBgd3NzOi8vMTI3LjAuMC4xOiR7YmFja2VuZFBvcnR9YCxcbiAgICAgICAgICB3czogdHJ1ZSxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnL2NvbW1zJzoge1xuICAgICAgICAgIHRhcmdldDogYHdzczovLzEyNy4wLjAuMToke2JhY2tlbmRQb3J0fWAsXG4gICAgICAgICAgd3M6IHRydWUsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVYsU0FBUyxjQUFjLGVBQWU7QUFDL1gsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sUUFBUTtBQUNmLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxjQUFjLE9BQU8sSUFBSSxnQkFBZ0IsSUFBSSxRQUFRLElBQUk7QUFFL0QsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLEtBQUssR0FBRyxhQUFhLEtBQUssUUFBUSxrQ0FBVyxxQkFBcUIsQ0FBQztBQUFBLFFBQ25FLE1BQU0sR0FBRyxhQUFhLEtBQUssUUFBUSxrQ0FBVyxpQkFBaUIsQ0FBQztBQUFBLE1BQ2xFO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRLHFCQUFxQixXQUFXO0FBQUEsVUFDeEMsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBLFlBQVk7QUFBQSxVQUNWLFFBQVEscUJBQXFCLFdBQVc7QUFBQSxVQUN4QyxjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sUUFBUSxtQkFBbUIsV0FBVztBQUFBLFVBQ3RDLElBQUk7QUFBQSxVQUNKLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsUUFDQSxVQUFVO0FBQUEsVUFDUixRQUFRLG1CQUFtQixXQUFXO0FBQUEsVUFDdEMsSUFBSTtBQUFBLFVBQ0osY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

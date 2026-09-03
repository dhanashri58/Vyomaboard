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
          target: `https://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false
        },
        "/uploads": {
          target: `https://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false
        },
        "/yjs": {
          target: `https://localhost:${backendPort}`,
          ws: true,
          changeOrigin: true,
          secure: false
        },
        "/comms": {
          target: `https://localhost:${backendPort}`,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxLcnJpc2hcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxwcm9qZWN0c1xcXFxtb29kYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEtycmlzaFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXG1vb2Rib2FyZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvS3JyaXNoL09uZURyaXZlL0Rlc2t0b3AvcHJvamVjdHMvbW9vZGJvYXJkL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIGNvbnN0IGJhY2tlbmRQb3J0ID0gTnVtYmVyKGVudi5CQUNLRU5EX1BPUlQgfHwgZW52LlBPUlQgfHwgMzAwMSlcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6IHRydWUsXG4gICAgICBodHRwczoge1xuICAgICAgICBrZXk6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbG9jYWxob3N0KzIta2V5LnBlbScpKSxcbiAgICAgICAgY2VydDogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdsb2NhbGhvc3QrMi5wZW0nKSksXG4gICAgICB9LFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiBgaHR0cHM6Ly9sb2NhbGhvc3Q6JHtiYWNrZW5kUG9ydH1gLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICcvdXBsb2Fkcyc6IHtcbiAgICAgICAgICB0YXJnZXQ6IGBodHRwczovL2xvY2FsaG9zdDoke2JhY2tlbmRQb3J0fWAsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgJy95anMnOiB7XG4gICAgICAgICAgdGFyZ2V0OiBgaHR0cHM6Ly9sb2NhbGhvc3Q6JHtiYWNrZW5kUG9ydH1gLFxuICAgICAgICAgIHdzOiB0cnVlLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICcvY29tbXMnOiB7XG4gICAgICAgICAgdGFyZ2V0OiBgaHR0cHM6Ly9sb2NhbGhvc3Q6JHtiYWNrZW5kUG9ydH1gLFxuICAgICAgICAgIHdzOiB0cnVlLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlWLFNBQVMsY0FBYyxlQUFlO0FBQy9YLE9BQU8sV0FBVztBQUNsQixPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sY0FBYyxPQUFPLElBQUksZ0JBQWdCLElBQUksUUFBUSxJQUFJO0FBRS9ELFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxLQUFLLEdBQUcsYUFBYSxLQUFLLFFBQVEsa0NBQVcscUJBQXFCLENBQUM7QUFBQSxRQUNuRSxNQUFNLEdBQUcsYUFBYSxLQUFLLFFBQVEsa0NBQVcsaUJBQWlCLENBQUM7QUFBQSxNQUNsRTtBQUFBLE1BQ0EsT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUSxxQkFBcUIsV0FBVztBQUFBLFVBQ3hDLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsUUFDQSxZQUFZO0FBQUEsVUFDVixRQUFRLHFCQUFxQixXQUFXO0FBQUEsVUFDeEMsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOLFFBQVEscUJBQXFCLFdBQVc7QUFBQSxVQUN4QyxJQUFJO0FBQUEsVUFDSixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0EsVUFBVTtBQUFBLFVBQ1IsUUFBUSxxQkFBcUIsV0FBVztBQUFBLFVBQ3hDLElBQUk7QUFBQSxVQUNKLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
